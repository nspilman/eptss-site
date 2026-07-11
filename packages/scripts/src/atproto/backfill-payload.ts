/**
 * Backfill `payload` onto the EPTSS scaffold's at.atjam.submission records (#173).
 *
 * The backfill era wrote scaffold submissions with only a raw `url` deliverable;
 * `payload` (a strong-ref to the cover's fm.plyr.track) came later. This walks every
 * Postgres submission that has a plyr track pointer and upgrades its scaffold record
 * to carry `payload` → that track, keeping `url` as the fallback the lexicon allows.
 *
 * The ref points at the track the pointer names TODAY — the EPTSS scaffold copy for
 * unclaimed covers, the user's own repo for claimed ones. Either is a valid, living
 * record; for claimed covers the scaffold backup then references the canonical
 * user-owned deliverable, which is exactly the truth.
 *
 * SAFE: additive (only records lacking `payload` are touched; all other fields are
 * carried unchanged), idempotent (stable rkeys, putRecord upserts), resumable, and
 * DEFAULTS TO A DRY RUN — re-run with --apply to execute.
 *
 * Env:  DATABASE_URL, ATPROTO_HANDLE, ATPROTO_APP_PASSWORD
 * Flags: --apply, --id=<submissionId>, --limit=N, --verbose
 *
 * Usage:
 *   set -a; source ../../apps/web/.env; set +a
 *   bun src/atproto/backfill-payload.ts             # dry run — prints the plan
 *   bun src/atproto/backfill-payload.ts --apply
 */
import "dotenv/config";
import { db, submissions } from "@eptss/db";
import { isNotNull } from "drizzle-orm";
import {
  EPTSS_DID,
  atUriDid,
  atUriRkey,
  eptssSubmissionRkey,
  getSubmissionRecord,
  getPlyrTrackRecord,
  createAdminSession,
  putAdminRecord,
  type AdminSession,
  type StrongRef,
} from "@eptss/atproto";

const SUBMISSION_COLLECTION = "at.atjam.submission";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const verbose = args.includes("--verbose");
const numFlag = (name: string) => {
  const raw = args.find((a) => a.startsWith(`${name}=`))?.slice(name.length + 1);
  return raw ? Number(raw) : undefined;
};
const onlyId = numFlag("--id");
const limit = numFlag("--limit") ?? Infinity;

/** Resolve the pointer to a live { uri, cid } — stored cid, else read the record. */
async function resolveTrackRef(
  uri: string,
  cid: string | null,
): Promise<StrongRef | null> {
  if (cid) return { uri, cid };
  const did = atUriDid(uri);
  if (!did) return null;
  const rec = await getPlyrTrackRecord(did, atUriRkey(uri));
  return rec ? { uri, cid: rec.cid } : null;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set. Source your env (set -a; source ../../apps/web/.env; set +a).");
    process.exit(1);
  }

  const rows = await db
    .select({
      id: submissions.id,
      plyrTrackUri: submissions.plyrTrackUri,
      plyrTrackCid: submissions.plyrTrackCid,
    })
    .from(submissions)
    .where(isNotNull(submissions.plyrTrackUri));

  const candidates = rows
    .filter((r) => onlyId == null || r.id === onlyId)
    .sort((a, b) => a.id - b.id);

  console.log(`[payload] ${candidates.length} submission(s) carry a plyr track pointer`);

  let session: AdminSession | null = null;
  let upgraded = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of candidates) {
    if (upgraded >= limit) break;
    const rkey = eptssSubmissionRkey(row.id);

    // The scaffold copy (public read off the EPTSS repo). Absent = never backfilled
    // or a native submission (which has no scaffold and needs none) — skip.
    const scaffold = await getSubmissionRecord(rkey);
    if (!scaffold) {
      if (verbose) console.log(`  #${row.id} no scaffold record — skip`);
      skipped++;
      continue;
    }
    if (scaffold.value.payload) {
      if (verbose) console.log(`  #${row.id} already carries payload — skip`);
      skipped++;
      continue;
    }

    const ref = await resolveTrackRef(row.plyrTrackUri!, row.plyrTrackCid);
    if (!ref) {
      console.warn(`  ✗ #${row.id} pointer ${row.plyrTrackUri} doesn't resolve — skip`);
      failed++;
      continue;
    }

    const where = atUriDid(ref.uri) === EPTSS_DID ? "scaffold" : "user-owned";
    if (!apply) {
      console.log(`  would upgrade #${row.id} (${rkey}) payload -> ${ref.uri} [${where}]`);
      upgraded++;
      continue;
    }

    try {
      session ??= await createAdminSession({
        identifier: process.env.ATPROTO_HANDLE!,
        appPassword: process.env.ATPROTO_APP_PASSWORD!,
        service: process.env.ATPROTO_SERVICE,
      });
      // Everything the scaffold already says, plus the payload strong-ref.
      await putAdminRecord(session, {
        collection: SUBMISSION_COLLECTION,
        rkey,
        record: { ...scaffold.value, $type: SUBMISSION_COLLECTION, payload: ref },
      });
      console.log(`  ✓ #${row.id} payload -> ${ref.uri} [${where}]`);
      upgraded++;
    } catch (err) {
      console.error(`  ✗ #${row.id} write failed:`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  console.log(
    `[payload] done: ${upgraded} ${apply ? "upgraded" : "planned"}, ${skipped} skipped, ${failed} failed`,
  );
  if (!apply) console.log("[payload] DRY RUN — re-run with --apply to execute.");
  process.exit(failed > 0 ? 1 : 0);
}

// Dry runs need no atproto credentials — every read here is public.
if (apply && (!process.env.ATPROTO_HANDLE || !process.env.ATPROTO_APP_PASSWORD)) {
  console.error("ATPROTO_HANDLE / ATPROTO_APP_PASSWORD required with --apply.");
  process.exit(1);
}

main().catch((err) => {
  console.error("[payload] fatal:", err);
  process.exit(1);
});
