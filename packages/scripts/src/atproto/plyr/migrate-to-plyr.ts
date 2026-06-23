/**
 * Re-host EPTSS Supabase audio onto plyr.fm — via plyr's upload API.
 *
 * WHY THE API (not a raw PDS blob): plyr only gives a track a streaming/R2 copy
 * — and thus a working *embed* (plyr.fm/embed/track/<id>) — when the audio goes
 * through its upload pipeline. PDS-native records (uploadBlob + createRecord)
 * stay `audio_storage: pds`, never get an `r2_url`, and the embed shows NaN:NaN.
 * Uploading through `POST api.plyr.fm/tracks/` transcodes to R2 and (for an
 * authed atproto account) also writes the `fm.plyr.track` record to the PDS
 * ("both" storage) — so we keep ownership *and* get a playable embed.
 *
 * For each Supabase-hosted cover:
 *   1. download the audio from Supabase (public URL),
 *   2. POST it to api.plyr.fm/tracks/ (plyr transcodes to R2 + writes the record),
 *   3. wait for the async upload to finish, resolve the track,
 *   4. store the track record's AT URI + CID on the submission (plyr_track_uri/cid).
 *
 * SAFE: additive (Supabase audioFileUrl untouched), idempotent + resumable (only
 * covers without a plyr_track_uri are uploaded).
 *
 * Auth:
 *   - migrate: PLYR_TOKEN  (developer token from plyr.fm/portal, signed in as the
 *              EPTSS plyr identity — that account owns every uploaded track)
 *   - --purge: ATPROTO_HANDLE + ATPROTO_APP_PASSWORD  (to delete old records)
 *
 * Usage:
 *   set -a; source ../../apps/web/.env; set +a
 *   bun src/atproto/plyr/migrate-to-plyr.ts --purge            # wipe old records + DB pointers
 *   PLYR_TOKEN=... bun src/atproto/plyr/migrate-to-plyr.ts --limit=1 --verbose
 *   PLYR_TOKEN=... bun src/atproto/plyr/migrate-to-plyr.ts     # full run
 * Flags: --dry-run, --limit=N, --id=<submissionId>, --verbose, --purge.
 */
/// <reference lib="dom" />
import "dotenv/config";
import { isNotNull } from "drizzle-orm";
import {
  db,
  submissions,
  roundMetadata,
  songs,
  users,
  eq,
  and,
  isNull,
  ilike,
} from "@eptss/db";
import { loginAtprotoAgent } from "../agent";
import {
  EPTSS_DID,
  atUriRkey,
  downloadMedia,
  getPlyrTrackRecord,
  uploadAudioToPlyr,
} from "@eptss/atproto";

const PLYR_API = (process.env.PLYR_API ?? "https://api.plyr.fm").replace(/\/$/, "");
const PLYR_TOKEN = process.env.PLYR_TOKEN;

const SUPABASE_AUDIO_MARKER = "/audio-submissions/";
const PLYR_TRACK_COLLECTION = "fm.plyr.track";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const verbose = args.includes("--verbose");
const purge = args.includes("--purge");
const limit = numFlag("--limit") ?? Infinity;
const onlyId = numFlag("--id");
// Re-host just one participant's covers — used to move YOUR covers off the EPTSS
// account onto your own plyr identity: run with YOUR personal PLYR_TOKEN, e.g.
//   PLYR_TOKEN=<personal> bun ...migrate-to-plyr.ts --username=nspilman
// Each cover is re-uploaded (transcoded fresh, artist_did = you, record in YOUR
// PDS) and the Postgres pointer is repointed. The old EPTSS copy is left as a
// backup until a scoped purge removes it.
const username = strFlag("--username");
const delayMs = Number(process.env.PLYR_DELAY_MS ?? 750);

function numFlag(name: string): number | undefined {
  const a = args.find((x) => x.startsWith(`${name}=`));
  return a ? Number(a.split("=")[1]) : undefined;
}

function strFlag(name: string): string | undefined {
  const a = args.find((x) => x.startsWith(`${name}=`));
  return a ? a.slice(name.length + 1) : undefined;
}

const authHeaders = () => ({ authorization: `Bearer ${PLYR_TOKEN}` });

// ── PURGE: full rollback — delete every plyr track (plyr's R2 + index), sweep
//    any leftover fm.plyr.track on the admin repo, and clear the DB pointers. ──
//
// Deleting the PDS record alone leaves a ghost in plyr's index/R2, so the
// authoritative delete is plyr's own DELETE /tracks/{id} (needs PLYR_TOKEN); the
// PDS sweep then catches any record plyr didn't own/remove.
async function runPurge(): Promise<void> {
  const { agent, did, handle } = await loginAtprotoAgent();
  console.log(`[plyr] purge for ${handle} (${did})`);

  // 1. plyr-side authoritative delete (clears R2 + plyr's index + the record).
  if (PLYR_TOKEN) {
    const ids = await fetchPlyrTrackIds(did);
    console.log(`[plyr] ${ids.length} plyr track(s) via API${dryRun ? " (dry run)" : ""}`);
    if (!dryRun) {
      for (const id of ids) {
        const res = await fetch(`${PLYR_API}/tracks/${id}`, {
          method: "DELETE",
          headers: authHeaders(),
        });
        if (res.ok) {
          if (verbose) console.log(`  plyr deleted track ${id}`);
        } else {
          console.warn(`  DELETE /tracks/${id} -> ${res.status}: ${await res.text()}`);
        }
      }
    }
  } else {
    console.warn(
      "[plyr] no PLYR_TOKEN — skipping plyr-side deletes (set it to also clear plyr's R2/index)",
    );
  }

  // 2. sweep any fm.plyr.track records still on the PDS.
  const rkeys: string[] = [];
  let cursor: string | undefined;
  do {
    const res = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: PLYR_TRACK_COLLECTION,
      limit: 100,
      cursor,
    });
    for (const r of res.data.records) rkeys.push(r.uri.split("/").pop()!);
    cursor = res.data.cursor;
  } while (cursor);
  console.log(`[plyr] ${rkeys.length} PDS record(s) remaining${dryRun ? " (dry run)" : ""}`);
  if (!dryRun) {
    for (const rkey of rkeys) {
      await agent.com.atproto.repo.deleteRecord({
        repo: did,
        collection: PLYR_TRACK_COLLECTION,
        rkey,
      });
      if (verbose) console.log(`  deleted PDS record ${rkey}`);
    }
  }

  // 3. clear the Postgres pointers.
  if (!dryRun) {
    await db
      .update(submissions)
      .set({ plyrTrackUri: null, plyrTrackCid: null, plyrCoverImageUrl: null })
      .where(isNotNull(submissions.plyrTrackUri));
  }
  console.log("[plyr] purge done");
}

/** All plyr numeric track ids for a repo (its plyr profile), paginated. */
async function fetchPlyrTrackIds(did: string): Promise<number[]> {
  const ids: number[] = [];
  let cursor: string | undefined;
  do {
    const url = new URL(`${PLYR_API}/tracks/`);
    url.searchParams.set("artist_did", did);
    url.searchParams.set("limit", "100");
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url.toString());
    if (!res.ok) break;
    const data = (await res.json()) as {
      tracks?: { id: number }[];
      next_cursor?: string | null;
    };
    for (const t of data.tracks ?? []) ids.push(t.id);
    cursor = data.next_cursor ?? undefined;
  } while (cursor);
  return ids;
}

// ── MIGRATE: upload each Supabase cover through plyr's API ──
interface Candidate {
  id: number;
  audioFileUrl: string | null;
  coverImageUrl: string | null;
  songTitle: string | null;
  username: string | null;
  publicDisplayName: string | null;
}

async function loadCandidates(): Promise<Candidate[]> {
  // --id / --username re-process already-migrated covers (re-host / overwrite);
  // a plain run only touches covers that don't have a plyr track yet.
  const reprocess = onlyId != null || username != null;
  const conds = [ilike(submissions.audioFileUrl, `%${SUPABASE_AUDIO_MARKER}%`)];
  if (!reprocess) conds.push(isNull(submissions.plyrTrackUri));
  if (username) conds.push(eq(users.username, username));
  const where = and(...conds);
  const rows = await db
    .select({
      id: submissions.id,
      audioFileUrl: submissions.audioFileUrl,
      coverImageUrl: submissions.coverImageUrl,
      songTitle: songs.title,
      username: users.username,
      publicDisplayName: users.publicDisplayName,
    })
    .from(submissions)
    .leftJoin(roundMetadata, eq(submissions.roundId, roundMetadata.id))
    .leftJoin(songs, eq(roundMetadata.songId, songs.id))
    .leftJoin(users, eq(submissions.userId, users.userid))
    .where(where);
  return rows.filter((r) => onlyId == null || r.id === onlyId);
}

async function migrateOne(c: Candidate): Promise<void> {
  const title = c.songTitle ?? `EPTSS cover #${c.id}`;
  const artist = c.publicDisplayName ?? c.username ?? "EPTSS";
  console.log(`[plyr] #${c.id} "${title}" — ${artist}`);
  if (!c.audioFileUrl) {
    console.log("  no audioFileUrl — skip");
    return;
  }
  if (dryRun) {
    console.log(`  would upload: ${c.audioFileUrl}`);
    return;
  }

  const file = await downloadMedia(c.audioFileUrl);
  if (verbose) console.log(`  downloaded ${file.bytes.byteLength} bytes (${file.mimeType})`);

  // Pull the cover art too, when the submission has one — plyr accepts it as
  // the track's `image`. Non-fatal: a broken/missing image shouldn't block the
  // audio upload.
  let image;
  if (c.coverImageUrl) {
    try {
      image = await downloadMedia(c.coverImageUrl);
      if (verbose) console.log(`  cover art ${image.bytes.byteLength} bytes (${image.mimeType})`);
    } catch (err) {
      console.warn(`  cover art download failed: ${err instanceof Error ? err.message : err}`);
    }
  }

  const { uri, cid, reused } = await uploadAudioToPlyr({
    token: PLYR_TOKEN!,
    file,
    title,
    image,
    onProgress: verbose ? (e) => console.log(`  sse: ${JSON.stringify(e)}`) : undefined,
  });

  // The trusted, plyr-hosted cover URL (images.plyr.fm) plyr just minted on this track —
  // the only image origin its ingester trusts. Persist it on the submission so the in-app
  // claim can carry it onto the user's OWN track without reading plyr_track_uri's record
  // (which the claim overwrites). Best-effort: a failed read-back just leaves it null.
  let plyrCoverImageUrl: string | null = null;
  try {
    const rec = await getPlyrTrackRecord(EPTSS_DID, atUriRkey(uri));
    plyrCoverImageUrl = rec?.value.imageUrl ?? null;
  } catch (err) {
    console.warn(`  cover URL read-back failed: ${err instanceof Error ? err.message : err}`);
  }

  await db
    .update(submissions)
    .set({ plyrTrackUri: uri, plyrTrackCid: cid, plyrCoverImageUrl })
    .where(eq(submissions.id, c.id));
  // `reused` = plyr's dedup matched an existing track (the bytes were already on plyr from
  // a prior migration); we recovered + re-associated it rather than creating a duplicate.
  const how = reused ? "↺ re-associated" : "✓ uploaded";
  console.log(`  ${how} ${uri}${plyrCoverImageUrl ? " (+cover)" : ""}`);
}

async function runMigrate(): Promise<void> {
  if (!dryRun && !PLYR_TOKEN) {
    console.error(
      "PLYR_TOKEN not set. Get a developer token from plyr.fm/portal (signed in as the EPTSS plyr identity).",
    );
    process.exit(1);
  }
  const candidates = await loadCandidates();
  console.log(
    `[plyr] ${candidates.length} Supabase cover(s) to migrate${dryRun ? " (dry run)" : ""}`,
  );

  let migrated = 0;
  let failed = 0;
  let processed = 0;
  for (const c of candidates) {
    if (processed >= limit) break;
    processed++;
    try {
      await migrateOne(c);
      if (!dryRun) migrated++;
    } catch (err) {
      failed++;
      console.error(`  ✗ #${c.id} failed:`, err instanceof Error ? err.message : err);
    }
    if (!dryRun && delayMs) await new Promise((r) => setTimeout(r, delayMs));
  }
  console.log(`[plyr] done: ${migrated} migrated, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

(purge ? runPurge() : runMigrate()).catch((e) => {
  console.error(e);
  process.exit(1);
});
