/**
 * test-plyr-upload.ts — upload ONE audio file to plyr.fm, end to end, for testing.
 *
 * A thin CLI around the shared plyr upload client (@eptss/atproto's uploadAudioToPlyr)
 * — the SAME pipeline the in-app migration and migrate-to-plyr use — so you can sanity-
 * check a single upload in isolation (confirm ownership via the resulting at:// uri and
 * a playable embed) without the Supabase-submission plumbing.
 *
 * Auth: PLYR_TOKEN — a developer token from plyr.fm/portal. The track is owned by the
 * atproto identity the token belongs to, so run it with YOUR token to get a user-owned
 * track in YOUR PDS.
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
 *   --verbose          print raw plyr SSE progress events
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import {
  downloadMedia,
  plyrMimeFor,
  uploadAudioToPlyr,
  type LoadedMedia,
} from "@eptss/atproto";

const PLYR_TOKEN = process.env.PLYR_TOKEN;

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

async function loadFromPath(path: string): Promise<LoadedMedia> {
  const bytes = new Uint8Array(await readFile(path));
  const filename = basename(path);
  return { bytes, mimeType: plyrMimeFor(filename), filename };
}

function loadEither(path?: string, u?: string): Promise<LoadedMedia> {
  if (path) return loadFromPath(path);
  if (u) return downloadMedia(u);
  throw new Error("provide --file=<path> or --url=<audioUrl>");
}

async function main(): Promise<void> {
  const file = await loadEither(filePath, url);
  const trackTitle = title ?? file.filename.replace(/\.[^.]+$/, "");
  let image: LoadedMedia | undefined;
  if (imageArg) {
    image = imageArg.startsWith("http")
      ? await downloadMedia(imageArg)
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
    console.log("[plyr-test] dry run — would upload to plyr (nothing sent)");
    return;
  }
  if (!PLYR_TOKEN) {
    console.error(
      "PLYR_TOKEN not set. Get a developer token from plyr.fm/portal (signed in as YOUR plyr identity).",
    );
    process.exit(1);
  }

  console.log("[plyr-test] uploading…");
  const { trackId, uri, cid } = await uploadAudioToPlyr({
    token: PLYR_TOKEN,
    file,
    title: trackTitle,
    image,
    onProgress: verbose ? (e) => console.log(`  sse: ${JSON.stringify(e)}`) : undefined,
  });

  // The artist DID is the authority segment of the record uri (at://<did>/…).
  const artistDid = uri.split("/")[2] ?? "(unknown)";
  console.log("\n[plyr-test] ✓ uploaded");
  console.log(`  track id   : ${trackId}`);
  console.log(`  artist_did : ${artistDid}`);
  console.log(`  record uri : ${uri}`);
  console.log(`  record cid : ${cid}`);
  console.log(`  embed      : https://plyr.fm/embed/track/${trackId}`);
  console.log(`  page       : https://plyr.fm/track/${trackId}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
