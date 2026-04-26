#!/usr/bin/env bun
/**
 * Backfill non-user-attributed EPTSS records to the AT Protocol.
 * Publishes under the EPTSS service account (handle: everyoneplaysthesamesong.com).
 *
 * Phases run in dependency order:
 *   1. project     → site.eptss.project
 *   2. song        → site.eptss.song
 *   3. round       → site.eptss.round
 *   4. prompt      → site.eptss.roundPrompt
 *   5. voteResult  → site.eptss.voteResult  (only for rounds past voting close)
 *
 * Stable rkeys derived from Postgres IDs + putRecord (upsert) make re-runs
 * idempotent — safe to run repeatedly while iterating on lexicons.
 *
 * Env:
 *   DATABASE_URL          Postgres connection string (read-only is fine)
 *   ATPROTO_SERVICE       PDS URL (default: https://bsky.social)
 *   ATPROTO_IDENTIFIER    Handle, e.g. everyoneplaysthesamesong.com
 *   ATPROTO_APP_PASSWORD  App password — NOT the main account password
 *
 * Flags:
 *   --dry-run             Read + plan, do not write to PDS
 *   --phase=<name>        Only run one phase (project|song|round|prompt|voteResult|all). Default: all
 *   --limit=<n>           Cap records per phase (useful while iterating)
 */

import * as dotenv from "dotenv";
dotenv.config();

import { AtpAgent } from "@atproto/api";
import { isNotNull } from "drizzle-orm";
import {
  db,
  projects,
  songs,
  roundMetadata,
  roundPrompts,
  sql,
  and,
  lt,
} from "@eptss/db";

const COLLECTIONS = {
  project: "site.eptss.project",
  song: "site.eptss.song",
  round: "site.eptss.round",
  prompt: "site.eptss.roundPrompt",
  voteResult: "site.eptss.voteResult",
} as const;

type PhaseName = keyof typeof COLLECTIONS | "all";

interface Args {
  dryRun: boolean;
  phase: PhaseName;
  limit: number | null;
}

interface PhaseStats {
  attempted: number;
  written: number;
  failed: number;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { dryRun: false, phase: "all", limit: null };
  for (const a of argv.slice(2)) {
    if (a === "--dry-run") args.dryRun = true;
    else if (a.startsWith("--phase=")) args.phase = a.split("=")[1] as PhaseName;
    else if (a.startsWith("--limit=")) args.limit = parseInt(a.split("=")[1], 10);
    else throw new Error(`Unknown arg: ${a}`);
  }
  return args;
}

function rkeyFor(kind: keyof typeof COLLECTIONS, parts: (string | number)[]): string {
  const tail = parts.join("-");
  switch (kind) {
    case "project": return tail;                    // "cover" | "originals"
    case "song": return `s-${tail}`;
    case "round": return `r-${tail}`;
    case "prompt": return `p-${tail}`;
    case "voteResult": return `vr-${tail}`;         // "vr-{roundId}-{songId}"
  }
}

function uriFor(did: string, kind: keyof typeof COLLECTIONS, rkey: string): string {
  return `at://${did}/${COLLECTIONS[kind]}/${rkey}`;
}

async function putRecord(
  agent: AtpAgent,
  did: string,
  collection: string,
  rkey: string,
  record: Record<string, unknown>,
  dryRun: boolean,
): Promise<void> {
  if (dryRun) {
    console.log(`  [dry-run] putRecord ${collection}/${rkey}`);
    return;
  }
  await agent.com.atproto.repo.putRecord({
    repo: did,
    collection,
    rkey,
    record: { $type: collection, ...record },
  });
  // Be polite to the PDS — backfill volume is small but no need to hammer.
  await new Promise((r) => setTimeout(r, 100));
}

async function backfillProjects(agent: AtpAgent, did: string, args: Args): Promise<PhaseStats> {
  const stats: PhaseStats = { attempted: 0, written: 0, failed: 0 };
  const rows = await db.select().from(projects);
  const target = args.limit ? rows.slice(0, args.limit) : rows;

  for (const p of target) {
    stats.attempted++;
    const rkey = rkeyFor("project", [p.slug]);
    try {
      await putRecord(agent, did, COLLECTIONS.project, rkey, {
        name: p.name,
        slug: p.slug,
        isActive: p.isActive,
        createdAt: p.createdAt.toISOString(),
      }, args.dryRun);
      stats.written++;
      console.log(`  project/${rkey}  (${p.name})`);
    } catch (err) {
      stats.failed++;
      console.error(`  project/${rkey}  FAILED:`, err);
    }
  }
  return stats;
}

async function backfillSongs(agent: AtpAgent, did: string, args: Args): Promise<PhaseStats> {
  const stats: PhaseStats = { attempted: 0, written: 0, failed: 0 };
  const rows = await db.select().from(songs).orderBy(songs.id);
  const target = args.limit ? rows.slice(0, args.limit) : rows;

  for (const s of target) {
    stats.attempted++;
    const rkey = rkeyFor("song", [s.id]);
    try {
      await putRecord(agent, did, COLLECTIONS.song, rkey, {
        title: s.title,
        artist: s.artist,
        createdAt: (s.createdAt ?? new Date()).toISOString(),
      }, args.dryRun);
      stats.written++;
    } catch (err) {
      stats.failed++;
      console.error(`  song/${rkey}  FAILED:`, err);
    }
  }
  console.log(`  ${stats.written}/${stats.attempted} songs written`);
  return stats;
}

async function backfillRounds(agent: AtpAgent, did: string, args: Args): Promise<PhaseStats> {
  const stats: PhaseStats = { attempted: 0, written: 0, failed: 0 };
  // Need project slugs to build project AT-URI refs.
  const projectRows = await db.select().from(projects);
  const projectSlugById = new Map(projectRows.map((p) => [p.id, p.slug]));

  const rows = await db.select().from(roundMetadata).orderBy(roundMetadata.id);
  const target = args.limit ? rows.slice(0, args.limit) : rows;

  for (const r of target) {
    stats.attempted++;
    const projectSlug = projectSlugById.get(r.projectId);
    if (!projectSlug) {
      stats.failed++;
      console.error(`  round/${r.id}  FAILED: unknown projectId ${r.projectId}`);
      continue;
    }
    const rkey = rkeyFor("round", [r.id]);
    const record: Record<string, unknown> = {
      project: uriFor(did, "project", rkeyFor("project", [projectSlug])),
      slug: r.slug ?? String(r.id),
      createdAt: (r.createdAt ?? new Date()).toISOString(),
    };
    if (r.songId) record.song = uriFor(did, "song", rkeyFor("song", [r.songId]));
    if (r.playlistUrl) record.playlistUrl = r.playlistUrl;
    if (r.signupOpens) record.signupOpens = r.signupOpens.toISOString();
    if (r.votingOpens) record.votingOpens = r.votingOpens.toISOString();
    if (r.coveringBegins) record.coveringBegins = r.coveringBegins.toISOString();
    if (r.coversDue) record.coversDue = r.coversDue.toISOString();
    if (r.listeningParty) record.listeningParty = r.listeningParty.toISOString();

    try {
      await putRecord(agent, did, COLLECTIONS.round, rkey, record, args.dryRun);
      stats.written++;
      console.log(`  round/${rkey}  (${projectSlug}/${record.slug})`);
    } catch (err) {
      stats.failed++;
      console.error(`  round/${rkey}  FAILED:`, err);
    }
  }
  return stats;
}

async function backfillPrompts(agent: AtpAgent, did: string, args: Args): Promise<PhaseStats> {
  const stats: PhaseStats = { attempted: 0, written: 0, failed: 0 };
  const rows = await db.select().from(roundPrompts).orderBy(roundPrompts.id);
  const target = args.limit ? rows.slice(0, args.limit) : rows;

  for (const p of target) {
    stats.attempted++;
    const rkey = rkeyFor("prompt", [p.id]);
    try {
      await putRecord(agent, did, COLLECTIONS.prompt, rkey, {
        round: uriFor(did, "round", rkeyFor("round", [p.roundId])),
        promptText: p.promptText,
        createdAt: p.createdAt.toISOString(),
      }, args.dryRun);
      stats.written++;
    } catch (err) {
      stats.failed++;
      console.error(`  prompt/${rkey}  FAILED:`, err);
    }
  }
  console.log(`  ${stats.written}/${stats.attempted} prompts written`);
  return stats;
}

interface VoteAggregateRow extends Record<string, unknown> {
  round_id: number;
  song_id: number;
  average: number;
  count: number;
  distribution: number[];
}

async function backfillVoteResults(agent: AtpAgent, did: string, args: Args): Promise<PhaseStats> {
  const stats: PhaseStats = { attempted: 0, written: 0, failed: 0 };

  // Only publish aggregates for rounds where voting has closed (coveringBegins in the past).
  // Publishing in-flight tallies could influence the active vote.
  const now = new Date();
  const finishedRounds = await db
    .select({ id: roundMetadata.id })
    .from(roundMetadata)
    .where(and(
      isNotNull(roundMetadata.coveringBegins),
      lt(roundMetadata.coveringBegins, now),
    ));
  const finishedIds = new Set(finishedRounds.map((r) => r.id));
  if (finishedIds.size === 0) {
    console.log("  no finished rounds to aggregate");
    return stats;
  }

  // Aggregate per (round, song): average, count, distribution histogram (buckets 1..10).
  const rows = await db.execute<VoteAggregateRow>(sql`
    SELECT
      round_id,
      song_id,
      AVG(vote)::float8 AS average,
      COUNT(*)::int AS count,
      ARRAY[
        COUNT(*) FILTER (WHERE vote = 1)::int,
        COUNT(*) FILTER (WHERE vote = 2)::int,
        COUNT(*) FILTER (WHERE vote = 3)::int,
        COUNT(*) FILTER (WHERE vote = 4)::int,
        COUNT(*) FILTER (WHERE vote = 5)::int,
        COUNT(*) FILTER (WHERE vote = 6)::int,
        COUNT(*) FILTER (WHERE vote = 7)::int,
        COUNT(*) FILTER (WHERE vote = 8)::int,
        COUNT(*) FILTER (WHERE vote = 9)::int,
        COUNT(*) FILTER (WHERE vote = 10)::int
      ] AS distribution
    FROM song_selection_votes
    WHERE round_id IS NOT NULL AND song_id IS NOT NULL
    GROUP BY round_id, song_id
    ORDER BY round_id, song_id
  `);

  const filtered = (rows as unknown as VoteAggregateRow[]).filter((r) => finishedIds.has(r.round_id));
  const target = args.limit ? filtered.slice(0, args.limit) : filtered;

  for (const r of target) {
    stats.attempted++;
    const rkey = rkeyFor("voteResult", [r.round_id, r.song_id]);
    try {
      await putRecord(agent, did, COLLECTIONS.voteResult, rkey, {
        round: uriFor(did, "round", rkeyFor("round", [r.round_id])),
        song: uriFor(did, "song", rkeyFor("song", [r.song_id])),
        average: r.average,
        count: r.count,
        distribution: r.distribution,
        publishedAt: now.toISOString(),
      }, args.dryRun);
      stats.written++;
    } catch (err) {
      stats.failed++;
      console.error(`  voteResult/${rkey}  FAILED:`, err);
    }
  }
  console.log(`  ${stats.written}/${stats.attempted} vote-results written`);
  return stats;
}

async function main() {
  const args = parseArgs(process.argv);

  const requiredEnv = ["DATABASE_URL", "ATPROTO_IDENTIFIER", "ATPROTO_APP_PASSWORD"];
  const missing = requiredEnv.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(", ")}`);
    process.exit(1);
  }

  const service = process.env.ATPROTO_SERVICE ?? "https://bsky.social";
  const agent = new AtpAgent({ service });

  console.log(`Logging in to ${service} as ${process.env.ATPROTO_IDENTIFIER}…`);
  await agent.login({
    identifier: process.env.ATPROTO_IDENTIFIER!,
    password: process.env.ATPROTO_APP_PASSWORD!,
  });
  const did = agent.session?.did;
  if (!did) throw new Error("Login succeeded but no DID on session — bailing.");
  console.log(`Logged in. Publishing as ${did}`);
  if (args.dryRun) console.log("DRY RUN — no records will be written.\n");

  const phases: Array<[PhaseName, (a: AtpAgent, d: string, ar: Args) => Promise<PhaseStats>]> = [
    ["project", backfillProjects],
    ["song", backfillSongs],
    ["round", backfillRounds],
    ["prompt", backfillPrompts],
    ["voteResult", backfillVoteResults],
  ];

  const summary: Record<string, PhaseStats> = {};
  for (const [name, fn] of phases) {
    if (args.phase !== "all" && args.phase !== name) continue;
    console.log(`\n— phase: ${name} —`);
    summary[name] = await fn(agent, did, args);
  }

  console.log("\n=== summary ===");
  for (const [name, s] of Object.entries(summary)) {
    console.log(`  ${name.padEnd(12)}  written=${s.written}  failed=${s.failed}  attempted=${s.attempted}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
