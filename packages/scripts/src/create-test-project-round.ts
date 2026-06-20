/**
 * create-test-project-round.ts — stand up the isolated `atmosphere-test-project`
 * and an OPEN (covering-phase) round inside it, for end-to-end bsky submission testing.
 *
 * Why a separate project: round selection is projectId-scoped — each project resolves
 * its own "current round" (roundService.queryCurrentRound: signupOpens <= now <=
 * listeningParty, ORDER BY listeningParty ASC LIMIT 1). So a round here runs FULLY IN
 * PARALLEL with the live cover round and cannot hijack it or leak into its lists.
 *
 * What it writes (all in our Postgres — nothing on atproto/plyr):
 *   1. a `projects` row for atmosphere-test-project (config defaults fill in on read)
 *   2. a `songs` row for the round's song (reused if it already exists)
 *   3. a `round_metadata` row whose phase dates put it in the COVERING (submission-open)
 *      window right now, so the submit page accepts covers immediately.
 *
 * It is idempotent: the project + song are upserted, and a round is only created if one
 * with the same (project, slug) doesn't already exist.
 *
 * Credentialed: needs DATABASE_URL. Run it yourself — I don't have your DB creds.
 *
 * Usage (from packages/scripts):
 *   set -a; source ../../apps/web/.env; set +a            # provides DATABASE_URL
 *   bun src/create-test-project-round.ts --dry-run
 *   bun src/create-test-project-round.ts --song-title="Wish You Were Here" --song-artist="Pink Floyd"
 *   bun src/create-test-project-round.ts --round-slug=atmo-test-2 --days-open=21
 *
 * Flags:
 *   --song-title=<text>   round's song title   (default "Atmosphere Test Song")
 *   --song-artist=<text>  round's song artist  (default "EPTSS")
 *   --round-slug=<text>   round slug, unique per project (default "atmo-test-1")
 *   --days-open=<n>       days the covering window stays open from now (default 14)
 *   --dry-run             print the plan, write nothing
 *
 * Note: the network-canonical `at.atjam.round` record ("by the EPTSS account") is a
 * SEPARATE artifact written by create-eptss-round.ts. The submit flow reads this DB
 * round, so this script is DB-only; create the atproto round record separately if you
 * want the round mirrored to the EPTSS PDS.
 *
 * Prerequisite for testers: submitCover keys rows by the EPTSS userId from getAuthUser(),
 * so each bsky test account must be signed in to an EPTSS account with a linked atproto
 * identity (via the in-app /api/atproto/link flow) before it can submit here.
 */
import "dotenv/config";
import {
  db,
  projects,
  songs,
  roundMetadata,
  eq,
  and,
  sql,
  TEST_PROJECT_ID,
} from "@eptss/db";

const PROJECT_SLUG = "atmosphere-test-project";
const PROJECT_NAME = "Atmosphere Test Project";
const DAY = 24 * 60 * 60 * 1000;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

function strFlag(name: string, fallback: string): string {
  const a = args.find((x) => x.startsWith(`${name}=`));
  return a ? a.slice(name.length + 1) : fallback;
}
function numFlag(name: string, fallback: number): number {
  const raw = args.find((x) => x.startsWith(`${name}=`));
  if (!raw) return fallback;
  const n = Number(raw.slice(name.length + 1));
  return Number.isFinite(n) ? n : fallback;
}

const songTitle = strFlag("--song-title", "Atmosphere Test Song");
const songArtist = strFlag("--song-artist", "EPTSS");
const roundSlug = strFlag("--round-slug", "atmo-test-1");
const daysOpen = numFlag("--days-open", 14);

// Phase dates relative to now → lands the round in the COVERING (submission-open) phase.
const now = Date.now();
const dates = {
  signupOpens: new Date(now - 14 * DAY),
  votingOpens: new Date(now - 10 * DAY),
  coveringBegins: new Date(now - 7 * DAY),
  coversDue: new Date(now + daysOpen * DAY),
  listeningParty: new Date(now + (daysOpen + 7) * DAY),
};

/** Mirror of dateService.getCurrentPhase, for a printed sanity check. */
function phaseOf(d: typeof dates, at: number): string {
  if (at < d.votingOpens.getTime()) return "signups";
  if (at < d.coveringBegins.getTime()) return "voting";
  if (at < d.coversDue.getTime()) return "covering";
  return "celebration";
}

/** Ensure the test project row exists. Returns true if it was created now. */
async function ensureProject(): Promise<boolean> {
  const existing = await db
    .select({ id: projects.id, archivedAt: projects.archivedAt })
    .from(projects)
    .where(eq(projects.id, TEST_PROJECT_ID))
    .limit(1);

  if (existing.length > 0) {
    if (existing[0].archivedAt) {
      console.warn(
        `  ! project ${PROJECT_SLUG} exists but is archived — its public routes will 404. Clear archived_at to use it.`,
      );
    }
    return false;
  }

  // config/isActive/timestamps all have DB defaults; config '{}' parses to full defaults on read.
  await db.insert(projects).values({
    id: TEST_PROJECT_ID,
    name: PROJECT_NAME,
    slug: PROJECT_SLUG,
  });
  return true;
}

/** Find or create the song. Returns its id. */
async function ensureSong(): Promise<number> {
  const existing = await db
    .select({ id: songs.id })
    .from(songs)
    .where(and(eq(songs.title, songTitle), eq(songs.artist, songArtist)))
    .limit(1);
  if (existing.length > 0) return existing[0].id;

  const id = Date.now();
  await db.insert(songs).values({ id, title: songTitle, artist: songArtist });
  return id;
}

/** Next global round id (round_metadata.id is a global PK; createRound increments the max). */
async function nextRoundId(): Promise<number> {
  const res = await db.select({ maxId: sql<string | null>`MAX(${roundMetadata.id})` }).from(roundMetadata);
  const max = res[0]?.maxId;
  return max ? Number(max) + 1 : 1;
}

async function main(): Promise<void> {
  console.log(`[test-round] project : ${PROJECT_NAME} (${PROJECT_SLUG} / ${TEST_PROJECT_ID})`);
  console.log(`[test-round] song    : "${songTitle}" — ${songArtist}`);
  console.log(`[test-round] round   : slug="${roundSlug}", phase=${phaseOf(dates, now)} (open for ${daysOpen}d)`);
  console.log(
    `[test-round] window  : signup ${dates.signupOpens.toISOString().slice(0, 10)} → ` +
      `covers due ${dates.coversDue.toISOString().slice(0, 10)} → ` +
      `listening ${dates.listeningParty.toISOString().slice(0, 10)}`,
  );

  if (dryRun) {
    console.log("[test-round] dry run — nothing written.");
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set. Source your env first (e.g. set -a; source ../../apps/web/.env; set +a).");
    process.exit(1);
  }

  // 1. Project
  const projectCreated = await ensureProject();
  console.log(`[test-round] ${projectCreated ? "created" : "found"} project row`);

  // 2. Guard against duplicate round (unique on project+slug). Re-running with the same
  //    slug is a no-op rather than a unique-violation crash.
  const dupe = await db
    .select({ id: roundMetadata.id })
    .from(roundMetadata)
    .where(and(eq(roundMetadata.projectId, TEST_PROJECT_ID), eq(roundMetadata.slug, roundSlug)))
    .limit(1);
  if (dupe.length > 0) {
    console.log(`[test-round] round "${roundSlug}" already exists (id=${dupe[0].id}) — leaving it as-is.`);
    printLinks(dupe[0].id);
    return;
  }

  // Warn (don't block) if another active round already exists in the test project —
  // two overlapping windows would shadow each other (singular current-round per project).
  const active = await db
    .select({ id: roundMetadata.id, slug: roundMetadata.slug })
    .from(roundMetadata)
    .where(
      and(
        eq(roundMetadata.projectId, TEST_PROJECT_ID),
        sql`${roundMetadata.signupOpens} <= ${new Date(now).toISOString()}`,
        sql`${roundMetadata.listeningParty} >= ${new Date(now).toISOString()}`,
      ),
    );
  if (active.length > 0) {
    console.warn(
      `  ! ${active.length} other active round(s) already in this project ` +
        `(${active.map((r) => r.slug).join(", ")}). The one ending soonest wins "current".`,
    );
  }

  // 3. Song + round
  const songId = await ensureSong();
  const roundId = await nextRoundId();
  await db.insert(roundMetadata).values({
    id: roundId,
    projectId: TEST_PROJECT_ID,
    slug: roundSlug,
    songId,
    signupOpens: dates.signupOpens,
    votingOpens: dates.votingOpens,
    coveringBegins: dates.coveringBegins,
    coversDue: dates.coversDue,
    listeningParty: dates.listeningParty,
  });

  console.log(`[test-round] ✓ created round id=${roundId} (song id=${songId})`);
  printLinks(roundId);
}

function printLinks(roundId: number): void {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  console.log("");
  console.log(`  submit (current) : ${base}/projects/${PROJECT_SLUG}/submit`);
  console.log(`  submit (by id)   : ${base}/projects/${PROJECT_SLUG}/submit/${roundId}`);
  console.log(`  dashboard        : ${base}/projects/${PROJECT_SLUG}/dashboard`);
  console.log("");
  console.log("  Reminder: each bsky tester must be signed in to an EPTSS account with a linked");
  console.log("  atproto identity (in-app /api/atproto/link) before they can submit.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
