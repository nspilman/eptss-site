/**
 * audit-legacy-migration.ts — corpus-wide coverage of the legacy → atproto migration.
 *
 * "It worked for my account" is one data point. This turns it into a map: for every
 * legacy submission, where is it along the pipeline?
 *
 *   has audio ──► backfilled ──► plyr-migrated ──► (submitter linked) ──► claimed
 *   (uploaded)   (admin record)  (fm.plyr.track)   (bsky identity)        (in user repo)
 *
 * The point is to tell apart the two very different kinds of gap:
 *   • a BACKFILL gap  — the record/track was never written  → we run more migration
 *   • a ROLLOUT gap   — it's claimable, the user just hasn't  → we nudge people
 *
 * Read-only. Touches Postgres (needs DATABASE_URL) and the admin PDS over public
 * reads (no auth). Writes nothing.
 *
 * Signals, and where each comes from:
 *   backfilled        — an at.atjam.submission record exists on the admin scaffold
 *                       (one paginated listRecords on EPTSS_DID, matched by rkey).
 *   plyr track        — submissions.plyr_track_uri is set (admin migration wrote it).
 *   plyr re-homed     — that uri's repo DID is the USER's, not EPTSS_DID (claim moved it).
 *   submitter linked  — the user has an active atproto identity (can claim).
 *   claimed           — submissions.claimed_at_uri is set (record lives in the user repo).
 *
 * Usage (from packages/scripts):
 *   set -a; source ../../apps/web/.env; set +a        # provides DATABASE_URL
 *   bun src/atproto/audit-legacy-migration.ts
 *   bun src/atproto/audit-legacy-migration.ts --round=29
 *   bun src/atproto/audit-legacy-migration.ts --list-gaps
 *   bun src/atproto/audit-legacy-migration.ts --json
 */
import "dotenv/config";
import { db, submissions, roundMetadata, eq, asc, loadActiveHandles } from "@eptss/db";
import { EPTSS_DID, eptssSubmissionId, eptssRoundId } from "@eptss/atproto";

const PLC_DIRECTORY = "https://plc.directory";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const listGaps = args.includes("--list-gaps");
const roundArg = args.find((a) => a.startsWith("--round="));
const roundFilter = roundArg ? Number(roundArg.slice("--round=".length)) : undefined;

/** Resolve a DID's PDS endpoint via plc.directory (same shape as @eptss/atproto/read). */
async function resolvePds(did: string): Promise<string> {
  const res = await fetch(`${PLC_DIRECTORY}/${encodeURIComponent(did)}`);
  if (!res.ok) throw new Error(`plc.directory ${res.status} for ${did}`);
  const doc = (await res.json()) as {
    service?: Array<{ id: string; serviceEndpoint: string }>;
  };
  const svc = doc.service?.find((s) => s.id === "#atproto_pds");
  if (!svc) throw new Error(`no #atproto_pds service in DID doc for ${did}`);
  return svc.serviceEndpoint.replace(/\/$/, "");
}

/** Every rkey in a collection on a repo (public, paginated listRecords). */
async function listRkeys(pds: string, did: string, collection: string): Promise<string[]> {
  const rkeys: string[] = [];
  let cursor: string | undefined;
  do {
    const url = new URL(`${pds}/xrpc/com.atproto.repo.listRecords`);
    url.searchParams.set("repo", did);
    url.searchParams.set("collection", collection);
    url.searchParams.set("limit", "100");
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`listRecords ${res.status} for ${collection}`);
    const data = (await res.json()) as { records: Array<{ uri: string }>; cursor?: string };
    for (const r of data.records) {
      const rkey = r.uri.split("/").pop();
      if (rkey) rkeys.push(rkey);
    }
    cursor = data.cursor;
  } while (cursor);
  return rkeys;
}

/** Repo DID from an AT URI (at://<did>/<collection>/<rkey>), or null. */
function repoDidOf(uri: string | null): string | null {
  if (!uri) return null;
  const m = /^at:\/\/([^/]+)\//.exec(uri);
  return m ? m[1] : null;
}

const pct = (n: number, d: number): string => (d ? `${Math.round((100 * n) / d)}%` : "—");
const pad = (s: string | number, w: number): string => String(s).padStart(w);

interface Row {
  id: number;
  roundId: number;
  hasAudio: boolean;
  soundcloudOnly: boolean;
  backfilled: boolean;
  plyrTrack: boolean;
  plyrRehomed: boolean;
  linked: boolean;
  claimed: boolean;
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set. Source your env (set -a; source ../../apps/web/.env; set +a).");
    process.exit(1);
  }

  // 1. Pull the submissions corpus from Postgres.
  const subs = await db
    .select({
      id: submissions.id,
      userId: submissions.userId,
      roundId: submissions.roundId,
      audioFileUrl: submissions.audioFileUrl,
      soundcloudUrl: submissions.soundcloudUrl,
      plyrTrackUri: submissions.plyrTrackUri,
      claimedAtUri: submissions.claimedAtUri,
    })
    .from(submissions)
    .where(roundFilter ? eq(submissions.roundId, roundFilter) : undefined)
    .orderBy(asc(submissions.roundId), asc(submissions.id));

  // 2. Which submissions/rounds are backfilled? One list call per collection.
  const pds = await resolvePds(EPTSS_DID);
  const [subRkeys, roundRkeys] = await Promise.all([
    listRkeys(pds, EPTSS_DID, "at.atjam.submission"),
    listRkeys(pds, EPTSS_DID, "at.atjam.round"),
  ]);
  const backfilledSubIds = new Set(
    subRkeys.map(eptssSubmissionId).filter((n): n is number => n !== null),
  );
  const backfilledRoundIds = new Set(
    roundRkeys.map(eptssRoundId).filter((n): n is number => n !== null),
  );

  // 3. Which submitters have an active bsky identity (can claim)?
  const userIds = [...new Set(subs.map((s) => s.userId))];
  const handles = await loadActiveHandles(userIds);

  // 4. Fold each submission into its signals.
  const rows: Row[] = subs.map((s) => {
    const hasAudio = Boolean(s.audioFileUrl);
    const plyrTrack = Boolean(s.plyrTrackUri);
    return {
      id: s.id,
      roundId: s.roundId,
      hasAudio,
      soundcloudOnly: !hasAudio && Boolean(s.soundcloudUrl),
      backfilled: backfilledSubIds.has(s.id),
      plyrTrack,
      plyrRehomed: plyrTrack && repoDidOf(s.plyrTrackUri) !== EPTSS_DID,
      linked: handles.has(s.userId),
      claimed: Boolean(s.claimedAtUri),
    };
  });

  // 5. Gap buckets — each is a distinct, actionable next move.
  const gaps = {
    audioNotBackfilled: rows.filter((r) => r.hasAudio && !r.backfilled),
    backfilledNoPlyr: rows.filter((r) => r.backfilled && r.hasAudio && !r.plyrTrack),
    claimableUnclaimed: rows.filter((r) => r.backfilled && r.linked && !r.claimed),
    backfilledUnlinked: rows.filter((r) => r.backfilled && !r.linked && !r.claimed),
    claimedPlyrOnAdmin: rows.filter((r) => r.claimed && r.plyrTrack && !r.plyrRehomed),
  };

  const total = rows.length;
  const count = (f: (r: Row) => boolean) => rows.filter(f).length;
  const roundIds = [...new Set(rows.map((r) => r.roundId))].sort((a, b) => a - b);
  const totalRounds = (await db.select({ id: roundMetadata.id }).from(roundMetadata)).length;

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          totals: {
            submissions: total,
            withAudio: count((r) => r.hasAudio),
            soundcloudOnly: count((r) => r.soundcloudOnly),
            backfilled: count((r) => r.backfilled),
            plyrTrack: count((r) => r.plyrTrack),
            plyrRehomed: count((r) => r.plyrRehomed),
            linked: count((r) => r.linked),
            claimed: count((r) => r.claimed),
            roundsWithSubs: roundIds.length,
            roundsBackfilled: roundIds.filter((id) => backfilledRoundIds.has(id)).length,
            totalRounds,
          },
          gaps: Object.fromEntries(Object.entries(gaps).map(([k, v]) => [k, v.map((r) => r.id)])),
        },
        null,
        2,
      ),
    );
    return;
  }

  const scope = roundFilter ? `round ${roundFilter}` : `${roundIds.length} round(s) with submissions`;
  console.log(`\nLegacy → atproto migration coverage — ${total} submission(s) across ${scope}`);
  console.log(`(${backfilledRoundIds.size} of ${totalRounds} rounds have a backfilled round record)\n`);

  console.log("Corpus");
  console.log(`  submissions             : ${pad(total, 5)}`);
  console.log(`  with uploaded audio     : ${pad(count((r) => r.hasAudio), 5)}`);
  console.log(`  soundcloud-only (legacy): ${pad(count((r) => r.soundcloudOnly), 5)}  (not plyr-migratable as-is)`);
  console.log(`  no audio at all         : ${pad(count((r) => !r.hasAudio && !r.soundcloudOnly), 5)}\n`);

  console.log("Pipeline (all submissions)");
  const bf = count((r) => r.backfilled);
  console.log(`  backfilled (admin record): ${pad(bf, 5)} / ${total}  (${pct(bf, total)})`);
  console.log(`  plyr track present       : ${pad(count((r) => r.plyrTrack), 5)}`);
  console.log(`  plyr re-homed to user    : ${pad(count((r) => r.plyrRehomed), 5)}`);
  console.log(`  submitter linked to bsky : ${pad(count((r) => r.linked), 5)}`);
  console.log(`  claimed (in user repo)   : ${pad(count((r) => r.claimed), 5)}\n`);

  console.log("Gaps (each line is a distinct next move)");
  console.log(`  audio but not backfilled       : ${pad(gaps.audioNotBackfilled.length, 5)}  → backfill these`);
  console.log(`  backfilled, no plyr track      : ${pad(gaps.backfilledNoPlyr.length, 5)}  → plyr-migrate`);
  console.log(`  backfilled+linked, not claimed : ${pad(gaps.claimableUnclaimed.length, 5)}  → nudge to claim (rollout)`);
  console.log(`  backfilled, submitter unlinked : ${pad(gaps.backfilledUnlinked.length, 5)}  → blocked on bsky link`);
  console.log(`  claimed, plyr still on admin   : ${pad(gaps.claimedPlyrOnAdmin.length, 5)}  → plyr re-home\n`);

  console.log("Per-round  (subs | backfilled | plyr | claimed)");
  for (const id of roundIds) {
    const rr = rows.filter((r) => r.roundId === id);
    const mark = backfilledRoundIds.has(id) ? " " : "*"; // * = round record itself missing
    console.log(
      `  r${pad(id, 3)}${mark}: ${pad(rr.length, 3)} | ${pad(rr.filter((r) => r.backfilled).length, 3)} | ` +
        `${pad(rr.filter((r) => r.plyrTrack).length, 3)} | ${pad(rr.filter((r) => r.claimed).length, 3)}`,
    );
  }
  if (roundIds.some((id) => !backfilledRoundIds.has(id))) {
    console.log("  (* = the round's own at.atjam.round record is missing)");
  }

  if (listGaps) {
    console.log("\nGap submission ids (capped at 60 each)");
    for (const [name, list] of Object.entries(gaps)) {
      if (list.length === 0) continue;
      const ids = list.slice(0, 60).map((r) => r.id).join(", ");
      console.log(`  ${name} (${list.length}): ${ids}${list.length > 60 ? " …" : ""}`);
    }
  }
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
