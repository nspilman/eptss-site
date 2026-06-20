/**
 * test-plyr-upload.ts — upload ONE audio file to plyr.fm, end to end, for testing.
 *
 * This is the SAME proven upload path as migrate-to-plyr.ts (POST /tracks/ →
 * transcode to R2 → fm.plyr.track record written to the token-holder's PDS),
 * isolated so you can test uploading a single song without the Supabase-submission
 * plumbing. It reports the resulting track so you can confirm ownership
 * (artist_did) and a playable embed.
 *
 * Auth: PLYR_TOKEN — a developer token from plyr.fm/portal. The track is owned by
 * the atproto identity the token belongs to, so run it with YOUR token to get a
 * user-owned track in YOUR PDS.
 *
 * Usage (from packages/scripts):
 *   set -a; source ../../apps/web/.env; set +a        # or: export PLYR_TOKEN=...
 *   bun src/atproto/plyr/test-plyr-upload.ts --file=./cover.mp3 --title="My Cover"
 *   bun src/atproto/plyr/test-plyr-upload.ts --url=https://example.com/cover.mp3 --title="My Cover"
 *   bun src/atproto/plyr/test-plyr-upload.ts --file=./cover.mp3 --dry-run --verbose
 *
 * Flags:
 *   --file=<path>      local audio file to upload          (one of --file / --url required)
 *   --url=<url>        remote audio URL to fetch + upload
 *   --title=<text>     track title (default: the file name)
 *   --image=<path|url> optional cover art
 *   --dry-run          validate + print the plan, upload nothing
 *   --verbose          print raw plyr responses (SSE events, track JSON)
 */
/// <reference lib="dom" />
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";

const PLYR_API = (process.env.PLYR_API ?? "https://api.plyr.fm").replace(/\/$/, "");
const PLYR_TOKEN = process.env.PLYR_TOKEN;
const MAX_BYTES = 200 * 1024 * 1024;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const verbose = args.includes("--verbose");
const filePath = strFlag("--file");
const url = strFlag("--url");
const imageArg = strFlag("--image");
const title = strFlag("--title");

function strFlag(name: string): string | undefined {
  const a = args.find((x) => x.startsWith(`${name}=`));
  return a ? a.slice(name.length + 1) : undefined;
}

const authHeaders = () => ({ authorization: `Bearer ${PLYR_TOKEN}` });

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

async function loadFromPath(path: string): Promise<LoadedFile> {
  const bytes = new Uint8Array(await readFile(path));
  if (bytes.byteLength > MAX_BYTES) {
    throw new Error(`file is ${(bytes.byteLength / 1e6).toFixed(1)}MB — over guard`);
  }
  const filename = basename(path);
  return { bytes, mimeType: mimeFor(filename), filename };
}

async function loadFromUrl(u: string): Promise<LoadedFile> {
  const res = await fetch(u);
  if (!res.ok) throw new Error(`download ${res.status} for ${u}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.byteLength > MAX_BYTES) {
    throw new Error(`audio is ${(bytes.byteLength / 1e6).toFixed(1)}MB — over guard`);
  }
  const filename = decodeURIComponent(u.split("/").pop()?.split("?")[0] ?? "cover.mp3");
  const mimeType = res.headers.get("content-type") ?? mimeFor(filename);
  return { bytes, mimeType, filename };
}

function loadEither(path?: string, u?: string): Promise<LoadedFile> {
  if (path) return loadFromPath(path);
  if (u) return loadFromUrl(u);
  throw new Error("provide --file=<path> or --url=<audioUrl>");
}

/** POST the file (+ optional artwork) to plyr; returns the upload id to monitor. */
async function startUpload(
  file: LoadedFile,
  trackTitle: string,
  image?: LoadedFile,
): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([file.bytes], { type: file.mimeType }), file.filename);
  form.append("title", trackTitle);
  if (image) {
    form.append("image", new Blob([image.bytes], { type: image.mimeType }), image.filename);
  }
  const res = await fetch(`${PLYR_API}/tracks/`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });
  if (!res.ok) throw new Error(`POST /tracks/ ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as Record<string, unknown>;
  if (verbose) console.log(`  start: ${JSON.stringify(data)}`);
  const uploadId = data.upload_id ?? data.uploadId ?? data.id;
  if (!uploadId) throw new Error(`no upload_id in response: ${JSON.stringify(data)}`);
  return String(uploadId);
}

/** Consume the SSE progress stream until the track resolves (or errors). */
async function waitForCompletion(
  uploadId: string,
): Promise<{ trackId?: string; uri?: string; cid?: string }> {
  const res = await fetch(`${PLYR_API}/tracks/uploads/${uploadId}/progress`, {
    headers: { ...authHeaders(), accept: "text/event-stream" },
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
      if (verbose) console.log(`  sse: ${data}`);
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
    throw new Error("progress ended without a track id/uri (re-run with --verbose)");
  }
  return found;
}

/** Resolve the created track's full record (artist_did, atproto uri/cid, …). */
async function fetchTrack(trackId: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${PLYR_API}/tracks/${trackId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`GET /tracks/${trackId} ${res.status}: ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>;
}

async function main(): Promise<void> {
  const file = await loadEither(filePath, url);
  const trackTitle = title ?? file.filename.replace(/\.[^.]+$/, "");
  let image: LoadedFile | undefined;
  if (imageArg) {
    image = imageArg.startsWith("http")
      ? await loadFromUrl(imageArg)
      : await loadFromPath(imageArg);
  }

  console.log(
    `[plyr-test] "${trackTitle}" — ${file.filename} ` +
      `(${(file.bytes.byteLength / 1e6).toFixed(2)}MB, ${file.mimeType})`,
  );
  if (image) {
    console.log(
      `[plyr-test] cover art: ${image.filename} (${(image.bytes.byteLength / 1e6).toFixed(2)}MB)`,
    );
  }

  if (dryRun) {
    console.log(`[plyr-test] dry run — would POST to ${PLYR_API}/tracks/ (nothing uploaded)`);
    return;
  }
  if (!PLYR_TOKEN) {
    console.error(
      "PLYR_TOKEN not set. Get a developer token from plyr.fm/portal (signed in as YOUR plyr identity).",
    );
    process.exit(1);
  }

  console.log("[plyr-test] uploading…");
  const uploadId = await startUpload(file, trackTitle, image);
  console.log(`[plyr-test] upload_id=${uploadId} — waiting for transcode…`);
  const progress = await waitForCompletion(uploadId);

  const track = progress.trackId ? await fetchTrack(progress.trackId) : {};
  if (verbose) console.log(`  track: ${JSON.stringify(track)}`);

  const trackId = progress.trackId ?? String(track.id ?? "");
  const uri =
    progress.uri ??
    (track.atproto_record_uri as string | undefined) ??
    (track.uri as string | undefined);
  const cid =
    progress.cid ??
    (track.atproto_record_cid as string | undefined) ??
    (track.cid as string | undefined);
  const artistDid = (track.artist_did ?? track.artistDid) as string | undefined;

  console.log("\n[plyr-test] ✓ uploaded");
  console.log(`  track id   : ${trackId}`);
  console.log(`  artist_did : ${artistDid ?? "(see --verbose track JSON)"}`);
  console.log(`  record uri : ${uri ?? "(pending index)"}`);
  console.log(`  record cid : ${cid ?? "(pending index)"}`);
  if (trackId) {
    console.log(`  embed      : https://plyr.fm/embed/track/${trackId}`);
    console.log(`  page       : https://plyr.fm/track/${trackId}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
