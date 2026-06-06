#!/usr/bin/env bun
/**
 * Backfill historical EPTSS rounds (and their submissions) to the AT Protocol
 * as at.atjam.* records, written to the EPTSS admin PDS.
 *
 * For each round it prints a summary and prompts before creating anything:
 *   [y]es   — create this round + its submissions
 *   [s]kip  — skip this round (default if you just press Enter)
 *   [a]ll   — create this one and every remaining round without prompting
 *   [q]uit  — stop
 *
 * Idempotent: rkeys are derived from Postgres IDs and written with putRecord
 * (upsert), so re-running updates rather than duplicates. Submissions are
 * written after their round so they can strong-ref its { uri, cid }.
 *
 * Env (packages/scripts/.env):
 *   DATABASE_URL          Postgres connection string (read-only is fine)
 *   ATPROTO_HANDLE        admin/project handle (e.g. everyoneplaysthesamesong.com)
 *   ATPROTO_APP_PASSWORD  app password for that handle
 *   EPTSS_JAM_URI         at:// URI of the EPTSS jam (from create-eptss-jam)
 *   EPTSS_JAM_CID         cid of the EPTSS jam
 *
 * Flags:
 *   --dry-run             plan + prompt, but never write to the PDS
 *   --project=cover       which project's rounds (cover | originals; default cover)
 *   --rounds=12,13        only these round IDs
 *   --jam-uri=… --jam-cid=…   override the jam ref from env
 *
 * Usage:
 *   bun src/atproto/backfill/backfill-rounds.ts --dry-run
 *   bun src/atproto/backfill/backfill-rounds.ts --rounds=12
 */
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import type { AtpAgent } from "@atproto/api";
import { loginAtprotoAgent } from "../agent";
import { extractRounds, type ProjectKey } from "./extract";
import {
  transformRound,
  type StrongRef,
  type SubmissionDraft,
  type TransformedRound,
} from "./transform";

const ROUND_COLLECTION = "at.atjam.round";
const SUBMISSION_COLLECTION = "at.atjam.submission";

interface Args {
  dryRun: boolean;
  project: ProjectKey;
  roundIds: number[] | null;
  jam: StrongRef | null;
}

function parseArgs(): Args {
  const args: Args = {
    dryRun: false,
    project: "cover",
    roundIds: null,
    jam:
      process.env.EPTSS_JAM_URI && process.env.EPTSS_JAM_CID
        ? { uri: process.env.EPTSS_JAM_URI, cid: process.env.EPTSS_JAM_CID }
        : null,
  };
  for (const a of process.argv.slice(2)) {
    if (a === "--dry-run") args.dryRun = true;
    else if (a.startsWith("--project=")) {
      args.project = a.split("=")[1] as ProjectKey;
    } else if (a.startsWith("--rounds=")) {
      args.roundIds = a
        .split("=")[1]
        .split(",")
        .map((n) => parseInt(n.trim(), 10))
        .filter((n) => !Number.isNaN(n));
    } else if (a.startsWith("--jam-uri=")) {
      args.jam = { uri: a.split("=")[1], cid: args.jam?.cid ?? "" };
    } else if (a.startsWith("--jam-cid=")) {
      args.jam = { uri: args.jam?.uri ?? "", cid: a.split("=")[1] };
    } else {
      console.error(`Unknown arg: ${a}`);
      process.exit(1);
    }
  }
  return args;
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";
}

function printSummary(t: TransformedRound): void {
  const r = t.record;
  const subject = r.subject as
    | { title?: string; artist?: string; selection?: { signups?: unknown[]; voteResults?: unknown[] } }
    | undefined;

  console.log(
    `\n─── Round ${t.roundId}  (rkey ${t.rkey}) ──────────────────────────`,
  );
  console.log(`  name:        ${r.name}`);
  if (subject?.title) {
    console.log(`  song:        ${subject.title} — ${subject.artist}`);
  }
  console.log(`  assignment:  ${truncate(r.assignment, 68)}`);
  console.log(
    `  milestones:  ${
      r.milestones
        .map((m) => `${m.label} ${m.date.slice(0, 10)}`)
        .join("  ·  ") || "(none)"
    }`,
  );
  if (subject?.selection) {
    const su = subject.selection.signups?.length ?? 0;
    const vr = subject.selection.voteResults?.length ?? 0;
    console.log(`  selection:   ${su} songs signed up · ${vr} with vote results`);
  }
  if (r.closingEvent) {
    console.log(`  closing:     ${(r.closingEvent as { playlistUrl?: string }).playlistUrl ?? ""}`);
  }
  console.log(`  submissions: ${t.submissions.length} with audio URL`);
  for (const s of t.submissions.slice(0, 8)) {
    console.log(`      - ${s.username ?? `#${s.sourceSubmissionId}`}: ${s.url}`);
  }
  if (t.submissions.length > 8) {
    console.log(`      … and ${t.submissions.length - 8} more`);
  }
  for (const w of t.warnings) console.log(`  ⚠ ${w}`);
}

async function writeRound(
  agent: AtpAgent,
  did: string,
  t: TransformedRound,
  dryRun: boolean,
): Promise<StrongRef> {
  if (dryRun) {
    console.log(`  [dry-run] putRecord ${ROUND_COLLECTION}/${t.rkey}`);
    return { uri: `at://${did}/${ROUND_COLLECTION}/${t.rkey}`, cid: "dry-run" };
  }
  const res = await agent.com.atproto.repo.putRecord({
    repo: did,
    collection: ROUND_COLLECTION,
    rkey: t.rkey,
    record: t.record,
  });
  return { uri: res.data.uri, cid: res.data.cid };
}

async function writeSubmission(
  agent: AtpAgent,
  did: string,
  sub: SubmissionDraft,
  round: StrongRef,
  dryRun: boolean,
): Promise<void> {
  const record = {
    $type: SUBMISSION_COLLECTION,
    round,
    url: sub.url,
    ...(sub.note ? { note: sub.note } : {}),
    createdAt: sub.createdAt,
  };
  if (dryRun) {
    console.log(`  [dry-run] putRecord ${SUBMISSION_COLLECTION}/${sub.rkey}  (${sub.url})`);
    return;
  }
  await agent.com.atproto.repo.putRecord({
    repo: did,
    collection: SUBMISSION_COLLECTION,
    rkey: sub.rkey,
    record,
  });
  // Be polite to the PDS.
  await new Promise((r) => setTimeout(r, 100));
}

async function main() {
  const args = parseArgs();
  if (!args.jam?.uri || !args.jam?.cid) {
    console.error(
      "Missing jam ref. Set EPTSS_JAM_URI + EPTSS_JAM_CID (from create-eptss-jam),\n" +
        "or pass --jam-uri=… --jam-cid=…",
    );
    process.exit(1);
  }

  const { agent, did, handle } = await loginAtprotoAgent();
  console.log(`Admin: ${handle} (${did})`);
  console.log(
    `Project: ${args.project}${args.dryRun ? "   *** DRY RUN — no writes ***" : ""}`,
  );

  const rounds = await extractRounds({
    project: args.project,
    roundIds: args.roundIds ?? undefined,
  });
  const transformed = rounds.map((r) => transformRound(r, { jam: args.jam! }));
  console.log(`Found ${transformed.length} round(s).`);

  const rl = createInterface({ input: stdin, output: stdout });
  let createdRounds = 0;
  let createdSubs = 0;
  let skipped = 0;
  let autoYes = false;

  try {
    for (const t of transformed) {
      printSummary(t);

      if (!t.valid) {
        console.log("  ⚠ INVALID — skipping (a round needs at least one milestone).");
        skipped++;
        continue;
      }

      let answer = "y";
      if (!autoYes) {
        answer = (
          await rl.question(
            "  Create this round + its submissions? [y]es / [s]kip / [a]ll / [q]uit: ",
          )
        )
          .trim()
          .toLowerCase();
      }

      if (answer === "q") {
        console.log("Quitting.");
        break;
      }
      if (answer === "a") {
        autoYes = true; // create this one and all remaining
      } else if (answer !== "y") {
        skipped++;
        console.log("  skipped.");
        continue;
      }

      const roundRef = await writeRound(agent, did, t, args.dryRun);
      createdRounds++;
      for (const sub of t.submissions) {
        await writeSubmission(agent, did, sub, roundRef, args.dryRun);
        createdSubs++;
      }
      console.log(
        `  ✓ round ${t.rkey} + ${t.submissions.length} submission(s) ${
          args.dryRun ? "(dry-run)" : "written"
        }`,
      );
    }
  } finally {
    rl.close();
  }

  const verb = args.dryRun ? "would create" : "created";
  console.log("\n=== done ===");
  if (args.dryRun) {
    console.log("  *** DRY RUN — nothing was written to the PDS ***");
  }
  console.log(`  rounds ${verb}:      ${createdRounds}`);
  console.log(`  submissions ${verb}: ${createdSubs}`);
  console.log(`  skipped:             ${skipped}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
