/**
 * Upload a cover's audio to plyr.fm from the web app — the "create the track when
 * it doesn't exist yet" half of the migration.
 *
 * This is the server-side counterpart to packages/scripts' migrate-to-plyr.ts: the
 * SAME proven pipeline (download → POST /tracks/ → transcode to R2 → SSE-wait →
 * resolve the fm.plyr.track record), driven by the server-side PLYR_TOKEN (the EPTSS
 * plyr identity). Because plyr exposes no third-party relying-party OAuth, the upload
 * is authored by EPTSS — so the new track lands on the EPTSS scaffold (artist_did =
 * EPTSS, with the original audio blob). The migration's next step (ensurePlyrTrackOwned)
 * then re-homes it into the user's own repo. Net result: a fully user-owned, plyr-hosted
 * track, exactly like the ones the migrate-to-plyr script produced.
 *
 * Best-effort by construction: if PLYR_TOKEN is unset, the cover has no uploadable
 * audio, or plyr errors, every entry point returns null and the caller falls back to
 * the cover's raw `url`. Not a "use server" module — an internal helper the claim
 * server action composes.
 */
import { db, submissions, roundMetadata, songs, eq, and } from "@eptss/db";

const PLYR_API = (process.env.PLYR_API ?? "https://api.plyr.fm").replace(/\/$/, "");
const MAX_BYTES = 200 * 1024 * 1024;

interface PlyrRef {
  uri: string;
  cid: string;
}

type LoadedFile = { bytes: Uint8Array; mimeType: string; filename: string };

function mimeFor(filename: string, fallback = "audio/mpeg"): string {
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

async function download(url: string): Promise<LoadedFile> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status} for ${url}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.byteLength > MAX_BYTES) {
    throw new Error(`media is ${(bytes.byteLength / 1e6).toFixed(1)}MB — over guard`);
  }
  const filename = decodeURIComponent(url.split("/").pop()?.split("?")[0] ?? "cover.mp3");
  const mimeType = res.headers.get("content-type") ?? mimeFor(filename);
  return { bytes, mimeType, filename };
}

/** POST the file (+ optional artwork) to plyr; returns the upload id to monitor. */
async function startUpload(
  token: string,
  file: LoadedFile,
  title: string,
  image?: LoadedFile,
): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([file.bytes], { type: file.mimeType }), file.filename);
  form.append("title", title);
  if (image) {
    form.append("image", new Blob([image.bytes], { type: image.mimeType }), image.filename);
  }
  const res = await fetch(`${PLYR_API}/tracks/`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(`POST /tracks/ ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as Record<string, unknown>;
  const uploadId = data.upload_id ?? data.uploadId ?? data.id;
  if (!uploadId) throw new Error(`no upload_id in response: ${JSON.stringify(data)}`);
  return String(uploadId);
}

/** Consume the SSE progress stream until the track resolves (or errors). */
async function waitForCompletion(
  token: string,
  uploadId: string,
): Promise<{ trackId?: string; uri?: string; cid?: string }> {
  const res = await fetch(`${PLYR_API}/tracks/uploads/${uploadId}/progress`, {
    headers: { authorization: `Bearer ${token}`, accept: "text/event-stream" },
  });
  if (!res.ok || !res.body) throw new Error(`progress ${res.status} for ${uploadId}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const found: { trackId?: string; uri?: string; cid?: string } = {};
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
      let p: Record<string, unknown>;
      try {
        p = JSON.parse(data) as Record<string, unknown>;
      } catch {
        continue;
      }
      if (p.error) throw new Error(`plyr error: ${JSON.stringify(p)}`);
      const tid = p.track_id ?? p.trackId ?? p.id;
      if (tid) found.trackId = String(tid);
      if (p.atproto_record_uri) found.uri = String(p.atproto_record_uri);
      if (p.atproto_record_cid) found.cid = String(p.atproto_record_cid);
    }
  }
  if (!found.trackId && !found.uri) {
    throw new Error("progress ended without a track id/uri");
  }
  return found;
}

/** Resolve the created track's fm.plyr.track AT URI + CID by its numeric id. */
async function fetchTrack(token: string, trackId: string): Promise<PlyrRef> {
  const res = await fetch(`${PLYR_API}/tracks/${trackId}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`GET /tracks/${trackId} ${res.status}: ${await res.text()}`);
  const t = (await res.json()) as Record<string, unknown>;
  const uri = (t.atproto_record_uri ?? t.uri) as string | undefined;
  const cid = (t.atproto_record_cid ?? t.cid) as string | undefined;
  if (!uri || !cid) throw new Error(`track ${trackId} missing atproto uri/cid`);
  return { uri, cid };
}

/**
 * Run one audio file through plyr's upload pipeline, returning the resulting
 * `fm.plyr.track` strong-ref (on the EPTSS scaffold). Null — never throws — when
 * PLYR_TOKEN is unset or any step fails, so the migration degrades to the raw `url`.
 */
async function uploadTrackToPlyr(opts: {
  audioUrl: string;
  title: string;
  imageUrl?: string | null;
}): Promise<PlyrRef | null> {
  const token = process.env.PLYR_TOKEN;
  if (!token) {
    console.warn("[plyr-upload] PLYR_TOKEN not set — cannot create a plyr track");
    return null;
  }
  try {
    const file = await download(opts.audioUrl);
    let image: LoadedFile | undefined;
    if (opts.imageUrl) {
      // Non-fatal: a broken/missing cover image shouldn't block the audio upload.
      try {
        image = await download(opts.imageUrl);
      } catch (err) {
        console.warn("[plyr-upload] cover art download failed (continuing)", err);
      }
    }
    const uploadId = await startUpload(token, file, opts.title, image);
    const progress = await waitForCompletion(token, uploadId);
    return progress.uri && progress.cid
      ? { uri: progress.uri, cid: progress.cid }
      : await fetchTrack(token, progress.trackId!);
  } catch (err) {
    console.error("[plyr-upload] upload failed", err);
    return null;
  }
}

/** The cover's uploadable audio + the metadata plyr needs, or null if there's no file. */
async function loadCoverAudio(
  submissionId: number,
  userId: string,
): Promise<{ audioUrl: string; title: string; imageUrl: string | null } | null> {
  const rows = await db
    .select({
      audioFileUrl: submissions.audioFileUrl,
      coverImageUrl: submissions.coverImageUrl,
      songTitle: songs.title,
    })
    .from(submissions)
    .leftJoin(roundMetadata, eq(submissions.roundId, roundMetadata.id))
    .leftJoin(songs, eq(roundMetadata.songId, songs.id))
    .where(and(eq(submissions.id, submissionId), eq(submissions.userId, userId)))
    .limit(1);
  const r = rows[0];
  // Only an uploaded audio FILE is re-hostable; a SoundCloud link isn't a media file.
  if (!r?.audioFileUrl) return null;
  return {
    audioUrl: r.audioFileUrl,
    title: r.songTitle ?? `EPTSS cover #${submissionId}`,
    imageUrl: r.coverImageUrl,
  };
}

/**
 * Ensure a cover that has no plyr track gets one: upload its audio to plyr (as EPTSS),
 * record the resulting scaffold pointer on the submission, and return the ref so the
 * caller can re-home it into the user's repo. Null when there's nothing to upload or
 * the upload couldn't be made — the cover then migrates with its raw `url`.
 */
export async function ensurePlyrTrackForCover(
  submissionId: number,
  userId: string,
): Promise<PlyrRef | null> {
  const info = await loadCoverAudio(submissionId, userId);
  if (!info) return null;

  const ref = await uploadTrackToPlyr(info);
  if (!ref) return null;

  // The track is on the EPTSS scaffold (uploaded as EPTSS); record the pointer so the
  // re-home step (ensurePlyrTrackOwned) moves it into the user's repo next.
  await db
    .update(submissions)
    .set({ plyrTrackUri: ref.uri, plyrTrackCid: ref.cid })
    .where(eq(submissions.id, submissionId));
  console.log(`[plyr-upload] #${submissionId} uploaded -> ${ref.uri}`);
  return ref;
}
