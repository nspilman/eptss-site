import "dotenv/config";
import {
  db,
  submissions,
  userAtprotoIdentities,
  eq,
  and,
  isNull,
} from "@eptss/db";
import { isNotNull } from "drizzle-orm";
import type { AtpAgent } from "@atproto/api";
import { atUriDid, atUriRkey } from "@eptss/atproto";
import { loginAtprotoAgent } from "./agent";

/**
 * Put one EPTSS user back to "first-timer" state so the link→migrate flow can be
 * re-tested end to end. Your own account, once linked + claimed, is used up as a
 * fixture; this hands you a clean replay.
 *
 * Repo-driven, not DB-driven. It LISTS your repo and deletes what's actually there
 * — so it catches orphaned records (in the repo but no longer pointed at by the DB)
 * and signups (which carry server-generated TID rkeys the DB can't reconstruct).
 * Repo writes must be authored by the repo owner, so it logs in AS the user (their
 * handle + app password from env — never the EPTSS admin identity), and refuses to
 * touch any repo whose DID isn't the target's.
 *
 * Teardown, in order:
 *   1. Delete `at.atjam.submission` records whose rkey starts with `eptss-sub`
 *      (the EPTSS-written copies; a future native submission with a TID rkey is
 *      spared). With --include-signups, also delete every `at.atjam.signup` record.
 *      With --include-plyr, also delete the `fm.plyr.track` records that live in YOUR
 *      OWN repo (the ones `plyr_track_uri` points at your DID — native plyr uploads
 *      and the EPTSS scaffold copies are left alone).
 *   2. Clear the Postgres pointers (`claimed_at_uri` / `claimed_at`). This is the
 *      bit the migration card keys on — once null, the cover reads as "held by
 *      EPTSS" again and is eligible to re-migrate. With --include-plyr, also clear
 *      `plyr_track_uri` / `plyr_track_cid`, so a cover with no plyr track re-uploads
 *      from scratch instead of re-pointing at a deleted track.
 *   3. Soft-unlink the identity (`unlinked_at = now()`), so the profile shows the
 *      unlinked first-timer Link form rather than the re-link state.
 *
 * The admin scaffold (EPTSS_DID) is NEVER touched — it is the eternal source, so a
 * re-link recreates your SUBMISSIONS fresh from it. Signups do NOT come back on
 * link (only covers re-migrate); restore them by re-running the signup backfill.
 *
 * Postgres rows are NEVER deleted — only PDS records and the pointer columns. Your
 * submissions/sign_ups rows stay put, which is exactly why this is safe to repeat.
 *
 * Unlike the seed scripts, this DEFAULTS TO A DRY RUN, because it deletes records.
 * Re-run with --apply to execute.
 *
 * Env:
 *   DATABASE_URL                 — always required.
 *   RESET_USER_HANDLE            — the target user's bsky handle  ┐ required whenever
 *   RESET_USER_APP_PASSWORD      — an app password for that handle ┘ the repo is read
 *                                  or written (i.e. unless --no-delete) — including a
 *                                  dry run, which lists the repo to preview.
 *
 * Flags:
 *   --did=<did>          identify the user by their linked DID …
 *   --user-id=<uuid>     … or by their EPTSS user id (one of the two is required).
 *   --include-signups    also delete every at.atjam.signup record (default: only
 *                        submissions). They won't return on link — see above.
 *   --include-plyr       also delete your own fm.plyr.track records + clear the
 *                        plyr_track_uri/cid pointers, so covers re-upload to plyr
 *                        from scratch on the next link (full E2E replay).
 *   --keep-link          delete repo records + clear pointers but stay linked.
 *   --no-delete          skip repo deletes entirely (pointer-only reset; recreate
 *                        upserts over the existing records). Needs no app password.
 *   --apply              actually execute. Omit for a dry run.
 *   --verbose            per-record logging.
 *
 * Example (full teardown — covers + signups):
 *   RESET_USER_HANDLE=you.bsky.social RESET_USER_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx \
 *     bun src/atproto/reset-migration-for-user.ts --did=did:plc:… --include-signups --apply
 */

const SUBMISSION_COLLECTION = "at.atjam.submission";
const SIGNUP_COLLECTION = "at.atjam.signup";
const PLYR_TRACK_COLLECTION = "fm.plyr.track";
const SUBMISSION_RKEY_PREFIX = "eptss-sub";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const keepLink = args.includes("--keep-link");
const noDelete = args.includes("--no-delete");
const includeSignups = args.includes("--include-signups");
const includePlyr = args.includes("--include-plyr");
const verbose = args.includes("--verbose");
const flag = (name: string) =>
  args.find((a) => a.startsWith(`${name}=`))?.slice(name.length + 1);
const didArg = flag("--did");
const userIdArg = flag("--user-id");

/**
 * Resolve { userId, did, handle } from the crosswalk — WITHOUT requiring the link
 * to still be active. A prior reset may have already unlinked it; we can (and
 * should) still clean the repo + clear pointers, and the unlink step becomes a
 * no-op. We prefer the active row, else the most recently linked one.
 */
async function resolveTarget(): Promise<{
  userId: string;
  did: string;
  handle: string | null;
  alreadyUnlinked: boolean;
}> {
  const rows = await db
    .select({
      userId: userAtprotoIdentities.userId,
      did: userAtprotoIdentities.did,
      handle: userAtprotoIdentities.handle,
      linkedAt: userAtprotoIdentities.linkedAt,
      unlinkedAt: userAtprotoIdentities.unlinkedAt,
    })
    .from(userAtprotoIdentities)
    .where(
      userIdArg
        ? eq(userAtprotoIdentities.userId, userIdArg)
        : eq(userAtprotoIdentities.did, didArg!),
    );
  if (rows.length === 0) {
    const who = userIdArg ? `user ${userIdArg}` : `DID ${didArg}`;
    throw new Error(
      `No identity row for ${who} — it was never linked, so there's nothing to reset.`,
    );
  }
  const active = rows.find((r) => r.unlinkedAt === null);
  const chosen =
    active ?? [...rows].sort((a, b) => b.linkedAt.getTime() - a.linkedAt.getTime())[0];
  return {
    userId: chosen.userId,
    did: chosen.did,
    handle: chosen.handle,
    alreadyUnlinked: chosen.unlinkedAt !== null,
  };
}

/** Every rkey in a collection for a repo, paginated through the cursor. */
async function listRkeys(
  agent: AtpAgent,
  did: string,
  collection: string,
  keep?: (rkey: string) => boolean,
): Promise<string[]> {
  const rkeys: string[] = [];
  let cursor: string | undefined;
  do {
    const res = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection,
      limit: 100,
      cursor,
    });
    for (const r of res.data.records) {
      const rkey = r.uri.split("/").pop()!;
      if (!keep || keep(rkey)) rkeys.push(rkey);
    }
    cursor = res.data.cursor;
  } while (cursor);
  return rkeys;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL not set. Source your env (set -a; source ../../apps/web/.env; set +a).",
    );
    process.exit(1);
  }
  if (Boolean(didArg) === Boolean(userIdArg)) {
    console.error("Pass exactly one of --did=<did> or --user-id=<uuid>.");
    process.exit(1);
  }

  const target = await resolveTarget();

  // How many DB pointers we'll clear (the migration-eligible signal). Read-only.
  const claimedRows = await db
    .select({ id: submissions.id })
    .from(submissions)
    .where(and(eq(submissions.userId, target.userId), isNotNull(submissions.claimedAtUri)));
  const claimedCount = claimedRows.length;

  // Gather the repo records to delete by LISTING the repo (so orphans + TID-keyed
  // signups are caught). Read-only — runs in dry runs too, to preview the truth.
  let agent: AtpAgent | null = null;
  let toDelete: { collection: string; rkey: string }[] = [];
  if (!noDelete) {
    const session = await loginAtprotoAgent({
      handleEnv: "RESET_USER_HANDLE",
      passwordEnv: "RESET_USER_APP_PASSWORD",
    });
    // Never read/delete from the wrong repo: the login must BE the target user.
    if (session.did !== target.did) {
      throw new Error(
        `Logged in as ${session.did} (@${session.handle}) but the target user's ` +
          `DID is ${target.did}. Set RESET_USER_HANDLE/RESET_USER_APP_PASSWORD to ` +
          `the target account and re-run.`,
      );
    }
    agent = session.agent;
    const subRkeys = await listRkeys(agent, target.did, SUBMISSION_COLLECTION, (rk) =>
      rk.startsWith(SUBMISSION_RKEY_PREFIX),
    );
    toDelete.push(...subRkeys.map((rkey) => ({ collection: SUBMISSION_COLLECTION, rkey })));
    if (includeSignups) {
      const sigRkeys = await listRkeys(agent, target.did, SIGNUP_COLLECTION);
      toDelete.push(...sigRkeys.map((rkey) => ({ collection: SIGNUP_COLLECTION, rkey })));
    }
  }

  // Plyr tracks: read the user's plyr pointers so we can clear them, and delete the
  // records that live in the user's OWN repo — identified precisely via the pointer's
  // DID, so native plyr uploads and the EPTSS scaffold copies are spared.
  let plyrPointerCount = 0;
  if (includePlyr) {
    const plyrRows = await db
      .select({ plyrTrackUri: submissions.plyrTrackUri })
      .from(submissions)
      .where(and(eq(submissions.userId, target.userId), isNotNull(submissions.plyrTrackUri)));
    plyrPointerCount = plyrRows.length;
    if (agent) {
      for (const r of plyrRows) {
        if (r.plyrTrackUri && atUriDid(r.plyrTrackUri) === target.did) {
          toDelete.push({ collection: PLYR_TRACK_COLLECTION, rkey: atUriRkey(r.plyrTrackUri) });
        }
      }
    }
  }

  const subCount = toDelete.filter((r) => r.collection === SUBMISSION_COLLECTION).length;
  const sigCount = toDelete.filter((r) => r.collection === SIGNUP_COLLECTION).length;
  const plyrRecCount = toDelete.filter((r) => r.collection === PLYR_TRACK_COLLECTION).length;

  // ---- Plan ----
  const banner = apply ? "APPLY" : "DRY RUN";
  console.log(`\n[reset] ${banner} — reset migration for one user`);
  console.log(`  user:   ${target.userId}`);
  console.log(`  did:    ${target.did}${target.handle ? ` (@${target.handle})` : ""}`);
  if (noDelete) {
    console.log("  repo records:    leaving in place (--no-delete)");
  } else {
    console.log(`  submissions to delete: ${subCount} (${SUBMISSION_RKEY_PREFIX}* in ${SUBMISSION_COLLECTION})`);
    console.log(
      `  signups to delete:     ${includeSignups ? `${sigCount} (all of ${SIGNUP_COLLECTION})` : "0 (pass --include-signups)"}`,
    );
    console.log(
      `  plyr tracks to delete: ${includePlyr ? `${plyrRecCount} (your-repo records in ${PLYR_TRACK_COLLECTION})` : "0 (pass --include-plyr)"}`,
    );
  }
  console.log(`  clear claimed pointers: ${claimedCount} cover(s)`);
  console.log(
    `  clear plyr pointers:    ${includePlyr ? `${plyrPointerCount} cover(s)` : "0 (pass --include-plyr)"}`,
  );
  console.log(
    `  unlink identity:        ${keepLink ? "no (--keep-link)" : target.alreadyUnlinked ? "already unlinked" : "yes"}`,
  );
  if (verbose && toDelete.length > 0) {
    console.log("  records:");
    for (const r of toDelete) console.log(`    ${r.collection}/${r.rkey}`);
  }

  if (!apply) {
    console.log("\n[reset] DRY RUN — re-run with --apply to execute.\n");
    return;
  }

  // ---- 1. Delete the repo records (authored by the user). ----
  if (agent && toDelete.length > 0) {
    let deleted = 0;
    let missing = 0;
    for (const { collection, rkey } of toDelete) {
      try {
        await agent.com.atproto.repo.deleteRecord({ repo: target.did, collection, rkey });
        deleted++;
        if (verbose) console.log(`  deleted ${collection}/${rkey}`);
      } catch (err) {
        // An already-absent record is fine; the pointer clear below is what the
        // migration card keys on, and a recreate upserts regardless.
        missing++;
        if (verbose) {
          const msg = err instanceof Error ? err.message : String(err);
          console.log(`  skip ${collection}/${rkey} (${msg})`);
        }
      }
    }
    console.log(`[reset] repo: ${deleted} deleted, ${missing} already gone`);
  }

  // ---- 2. Clear the Postgres pointers (the migration-eligible signal). ----
  await db
    .update(submissions)
    .set({ claimedAtUri: null, claimedAt: null })
    .where(and(eq(submissions.userId, target.userId), isNotNull(submissions.claimedAtUri)));
  console.log(`[reset] cleared claimed pointers on ${claimedCount} cover(s)`);

  // ---- 2b. Clear the plyr pointers, so covers re-upload from scratch (--include-plyr). ----
  if (includePlyr) {
    await db
      .update(submissions)
      .set({ plyrTrackUri: null, plyrTrackCid: null })
      .where(and(eq(submissions.userId, target.userId), isNotNull(submissions.plyrTrackUri)));
    console.log(`[reset] cleared plyr pointers on ${plyrPointerCount} cover(s)`);
  }

  // ---- 3. Soft-unlink the identity (skip if already unlinked). ----
  if (!keepLink && !target.alreadyUnlinked) {
    await db
      .update(userAtprotoIdentities)
      .set({ unlinkedAt: new Date() })
      .where(
        and(
          eq(userAtprotoIdentities.userId, target.userId),
          isNull(userAtprotoIdentities.unlinkedAt),
        ),
      );
    console.log("[reset] soft-unlinked identity (set unlinked_at = now())");
  } else if (!keepLink && target.alreadyUnlinked) {
    console.log("[reset] identity already unlinked — left as is");
  }

  console.log(
    "\n[reset] done. Now sign in, open /dashboard/profile, " +
      (keepLink ? "re-link to refresh permissions" : "link your Bluesky account") +
      ", and watch the covers re-migrate." +
      (includePlyr ? " (Covers now have no plyr track, so they re-upload to plyr on link.)" : "") +
      (includeSignups
        ? " (Signups won't return on link — re-run the signup backfill to restore them.)"
        : "") +
      "\n",
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
