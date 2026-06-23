/**
 * The one plyr.fm upload client — `POST /tracks/` → transcode → `fm.plyr.track`.
 *
 * Every place that re-hosts audio on plyr (the in-app cover migration and the
 * packages/scripts migration/test tools) flows through here, so there is a single
 * truth for "how an upload talks to plyr." The track is owned by the atproto identity
 * the `token` belongs to — so passing the EPTSS developer token lands it on the EPTSS
 * repo (the caller may then re-home it).
 *
 * Field names are taken from plyr's own source (backend/api/tracks/uploads.py), not
 * guessed. Note the deliberate asymmetry that bit the earlier copies:
 *   - the SSE progress events carry `atproto_uri` / `atproto_cid`
 *   - `GET /tracks/{id}` carries `atproto_record_uri` / `atproto_record_cid`
 * Completion is signalled by `status: "completed"` (or `"failed"`), and the final
 * event includes `track_id`. When the SSE completes before the record is indexed, we
 * resolve the uri/cid from `GET /tracks/{id}` instead.
 */

const PLYR_API_DEFAULT = "https://api.plyr.fm";
const MAX_BYTES_DEFAULT = 200 * 1024 * 1024;

export interface LoadedMedia {
  bytes: Uint8Array;
  mimeType: string;
  filename: string;
}

export interface PlyrUploadResult {
  trackId: string;
  uri: string;
  cid: string;
  /** True when plyr's content dedup matched an existing track (the bytes were already
   *  on plyr) and we recovered its record instead of creating a new one — the upload
   *  was a no-op and the returned ref points at the pre-existing track. */
  reused: boolean;
}

/**
 * plyr's content dedup rejects a re-upload of bytes it already stores, naming the
 * existing track in the failure message: "duplicate upload: track already exists
 * (id: 1083)". Pull that id out so the caller can recover (and re-associate) the
 * existing track rather than treating a re-run as a hard failure. Returns null when
 * the message isn't a dedup rejection.
 */
export function parseDuplicateTrackId(message: string): string | null {
  const m = /duplicate upload: track already exists \(id:\s*(\d+)\)/i.exec(message);
  return m ? m[1] : null;
}

/** Best-effort MIME from a filename extension, for the multipart part headers. */
export function plyrMimeFor(filename: string, fallback = "audio/mpeg"): string {
  switch (filename.split(".").pop()?.toLowerCase()) {
    case "wav":
      return "audio/wav";
    case "mp3":
      return "audio/mpeg";
    case "m4a":
    case "mp4":
      return "audio/mp4";
    case "flac":
      return "audio/flac";
    case "ogg":
      return "audio/ogg";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    default:
      return fallback;
  }
}

/** Fetch a remote audio/image URL into memory, guarding an upper size bound. */
export async function downloadMedia(
  url: string,
  maxBytes = MAX_BYTES_DEFAULT,
): Promise<LoadedMedia> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status} for ${url}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.byteLength > maxBytes) {
    throw new Error(`media is ${(bytes.byteLength / 1e6).toFixed(1)}MB — over guard`);
  }
  const filename = decodeURIComponent(url.split("/").pop()?.split("?")[0] ?? "audio.mp3");
  const mimeType = res.headers.get("content-type") ?? plyrMimeFor(filename);
  return { bytes, mimeType, filename };
}

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

/** POST the file (+ optional artwork); returns the `upload_id` to monitor. */
async function startUpload(
  apiBase: string,
  token: string,
  file: LoadedMedia,
  title: string,
  image?: LoadedMedia,
): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([file.bytes], { type: file.mimeType }), file.filename);
  form.append("title", title);
  if (image) {
    form.append("image", new Blob([image.bytes], { type: image.mimeType }), image.filename);
  }
  const res = await fetch(`${apiBase}/tracks/`, {
    method: "POST",
    headers: auth(token),
    body: form,
  });
  if (!res.ok) throw new Error(`POST /tracks/ ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { upload_id?: string };
  if (!data.upload_id) throw new Error(`no upload_id in response: ${JSON.stringify(data)}`);
  return data.upload_id;
}

/** A single SSE progress event, per plyr's `event_stream()` payload. */
interface ProgressEvent {
  status?: string;
  error?: string | null;
  message?: string;
  track_id?: number | string;
  atproto_uri?: string;
  atproto_cid?: string;
}

/** Consume the SSE progress stream until the upload completes (or fails). */
async function waitForUpload(
  apiBase: string,
  token: string,
  uploadId: string,
  onProgress?: (event: ProgressEvent) => void,
): Promise<{ trackId?: string; uri?: string; cid?: string; duplicate?: boolean }> {
  const res = await fetch(`${apiBase}/tracks/uploads/${uploadId}/progress`, {
    headers: { ...auth(token), accept: "text/event-stream" },
  });
  if (!res.ok || !res.body) throw new Error(`progress ${res.status} for ${uploadId}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const found: { trackId?: string; uri?: string; cid?: string; duplicate?: boolean } = {};
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const events = buf.split("\n\n");
    buf = events.pop() ?? "";
    for (const ev of events) {
      const data = ev
        .split("\n")
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trim())
        .join("\n");
      if (!data) continue;
      let p: ProgressEvent;
      try {
        p = JSON.parse(data) as ProgressEvent;
      } catch {
        continue;
      }
      onProgress?.(p);
      if (p.status === "failed" || p.error) {
        const msg = p.error ?? p.message ?? "unknown";
        // plyr's content dedup names the existing track when the bytes are already on
        // plyr — not a failure for us. Recover its id and resolve via fetchTrack below.
        const dupId = parseDuplicateTrackId(msg);
        if (dupId) {
          found.trackId = dupId;
          found.duplicate = true;
          return found;
        }
        throw new Error(`plyr upload failed: ${msg}`);
      }
      if (p.track_id != null) found.trackId = String(p.track_id);
      if (p.atproto_uri) found.uri = p.atproto_uri;
      if (p.atproto_cid) found.cid = p.atproto_cid;
    }
  }
  if (!found.trackId && !found.uri) {
    throw new Error("progress stream ended without a track id or uri");
  }
  return found;
}

/** Resolve a track's `fm.plyr.track` AT URI + CID by numeric id (the indexed record). */
async function fetchTrack(
  apiBase: string,
  token: string,
  trackId: string,
): Promise<{ uri: string; cid: string }> {
  const res = await fetch(`${apiBase}/tracks/${trackId}`, { headers: auth(token) });
  if (!res.ok) throw new Error(`GET /tracks/${trackId} ${res.status}: ${await res.text()}`);
  const t = (await res.json()) as { atproto_record_uri?: string; atproto_record_cid?: string };
  if (!t.atproto_record_uri || !t.atproto_record_cid) {
    throw new Error(`track ${trackId} has no atproto record yet`);
  }
  return { uri: t.atproto_record_uri, cid: t.atproto_record_cid };
}

/**
 * Run one audio file through plyr's pipeline and return the resulting
 * `fm.plyr.track` strong-ref. Throws on any failure — callers that want best-effort
 * (the cover migration) catch and fall back. `onProgress` receives each SSE event
 * (used by the CLI tools for `--verbose`).
 */
export async function uploadAudioToPlyr(opts: {
  token: string;
  file: LoadedMedia;
  title: string;
  image?: LoadedMedia;
  apiBase?: string;
  onProgress?: (event: ProgressEvent) => void;
}): Promise<PlyrUploadResult> {
  const apiBase = (opts.apiBase ?? PLYR_API_DEFAULT).replace(/\/$/, "");
  const uploadId = await startUpload(apiBase, opts.token, opts.file, opts.title, opts.image);
  const progress = await waitForUpload(apiBase, opts.token, uploadId, opts.onProgress);

  // The SSE may finish before the atproto record is indexed; resolve it by id then.
  const trackId = progress.trackId;
  const reused = Boolean(progress.duplicate);
  if (progress.uri && progress.cid && trackId) {
    return { trackId, uri: progress.uri, cid: progress.cid, reused };
  }
  if (!trackId) throw new Error("upload completed without a track id");
  // No uri/cid in the stream (indexing lag, or a dedup hit) — resolve the record by id.
  const { uri, cid } = await fetchTrack(apiBase, opts.token, trackId);
  return { trackId, uri, cid, reused };
}
