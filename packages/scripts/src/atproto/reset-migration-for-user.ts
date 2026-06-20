import "dotenv/config";
import {
  db,
  submissions,
  userAtprotoIdentities,
  loadActiveIdentities,
  eq,
  and,
  desc,
  isNull,
} from "@eptss/db";
import { isNotNull } from "drizzle-orm";
import { eptssSubmissionRkey } from "@eptss/atproto";
import { loginAtprotoAgent } from "./agent";

/**
 * Put one EPTSS user back to "first-timer" state so the link→migrate flow can be
 * re-tested end to end. Your own account, once linked + claimed, is used up as a
 * fixture; this hands you a clean replay.
 *
 * The teardown is the exact inverse of a migration, in this order:
 *   1. Delete the `at.atjam.submission` copies from the USER's repo. Repo writes
 *      must be authored by the repo owner, so this logs in AS the user (their
 *      handle + app password from env — never the EPTSS admin identity). It only
 *      ever deletes the `eptss-sub<id>` rkeys EPTSS itself wrote, never anything
 *      else in the repo.
 *   2. Clear the Postgres pointers (`claimed_at_uri` / `claimed_at`). This is the
 *      bit the migration card keys on — once null, the cover reads as "held by
 *      EPTSS" again and is eligible to re-migrate.
 *   3. Soft-unlink the identity (`unlinked_at = now()`), so the profile shows the
 *      unlinked first-timer Link form rather than the re-link state.
 *
 * Then: log in, re-link, and the "Bring your covers home" card recreates each
 * record fresh from the admin scaffold (which this NEVER touches — it is the
 * eternal source, so this is safe and repeatable as many times as you like).
 *
 * Unlike the seed scripts, this DEFAULTS TO A DRY RUN, because it deletes records.
 * Re-run with --apply to execute.
 *
 * Env:
 *   DATABASE_URL                 — always required.
 *   RESET_USER_HANDLE            — the target user's bsky handle  ┐ required only when
 *   RESET_USER_APP_PASSWORD      — an app password for that handle ┘ actually deleting
 *                                  (--apply without --no-delete).
 *
 * Flags:
 *   --did=<did>        identify the user by their linked DID …
 *   --user-id=<uuid>   … or by their EPTSS user id (one of the two is required).
 *   --limit=<n>        only the n most-recent claimed covers (default: all). Handy
 *                      for a light test: reset 2, watch those 2 re-migrate.
 *   --keep-link        clear pointers + delete repo copies but stay linked. Re-link
 *                      via "refresh permissions" then still auto-migrates.
 *   --no-delete        skip the repo deletes (pointer-only reset; recreate upserts
 *                      over the existing records). Needs no app password.
 *   --apply            actually execute. Omit for a dry run.
 *   --verbose          per-record logging.
 *
 * Example (reset your two most-recent covers, full teardown):
 *   RESET_USER_HANDLE=you.bsky.social RESET_USER_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx \
 *     bun src/atproto/reset-migration-for-user.ts --did=did:plc:… --limit=2 --apply
 */

const SUBMISSION_COLLECTION = "at.atjam.submission";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const keepLink = args.includes("--keep-link");
const noDelete = args.includes("--no-delete");
const verbose = args.includes("--verbose");
const flag = (name: string) =>
  args.find((a) => a.startsWith(`${name}=`))?.slice(name.length + 1);
const didArg = flag("--did");
const userIdArg = flag("--user-id");
const limitArg = flag("--limit");
const limit = limitArg != null ? Number(limitArg) : undefined;

/** Resolve the active link to the { userId, did, handle } the teardown needs. */
async function resolveTarget(): Promise<{
  userId: string;
  did: string;
  handle: string | null;
}> {
  if (userIdArg) {
    const identities = await loadActiveIdentities([userIdArg]);
    const id = identities.get(userIdArg);
    if (!id) {
      throw new Error(
        `User ${userIdArg} has no active linked identity — nothing to reset.`,
      );
    }
    return { userId: userIdArg, did: id.did, handle: id.handle };
  }
  if (didArg) {
    const rows = await db
      .select({ userId: userAtprotoIdentities.userId, handle: userAtprotoIdentities.handle })
      .from(userAtprotoIdentities)
      .where(
        and(eq(userAtprotoIdentities.did, didArg), isNull(userAtprotoIdentities.unlinkedAt)),
      )
      .limit(1);
    const active = rows[0];
    if (!active) {
      throw new Error(`No active identity row for DID ${didArg} — nothing to reset.`);
    }
    return { userId: active.userId, did: didArg, handle: active.handle };
  }
  throw new Error("Pass --did=<did> or --user-id=<uuid> to identify the user.");
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
  if (limitArg != null && (!Number.isInteger(limit) || (limit as number) < 1)) {
    console.error(`--limit must be a positive integer (got "${limitArg}").`);
    process.exit(1);
  }

  const target = await resolveTarget();

  // The covers currently homed in the user's repo (claimed). Newest first so
  // --limit takes the most-recent, which are the ones you most likely just tested.
  const claimed = await db
    .select({ id: submissions.id })
    .from(submissions)
    .where(and(eq(submissions.userId, target.userId), isNotNull(submissions.claimedAtUri)))
    .orderBy(desc(submissions.id))
    .limit(limit ?? 1_000_000);

  const ids = claimed.map((r) => r.id);
  const rkeys = ids.map((id) => eptssSubmissionRkey(id));

  // ---- Plan ----
  const banner = apply ? "APPLY" : "DRY RUN";
  console.log(`\n[reset] ${banner} — reset migration for one user`);
  console.log(`  user:   ${target.userId}`);
  console.log(`  did:    ${target.did}${target.handle ? ` (@${target.handle})` : ""}`);
  console.log(`  covers: ${ids.length} claimed${limit != null ? ` (capped at --limit=${limit})` : ""}`);
  console.log(`  delete repo copies: ${noDelete ? "no (--no-delete)" : ids.length === 0 ? "n/a" : "yes"}`);
  console.log(`  unlink identity:    ${keepLink ? "no (--keep-link)" : "yes"}`);
  if (verbose && ids.length > 0) {
    console.log("  rkeys:");
    for (const rkey of rkeys) console.log(`    ${rkey}`);
  }

  if (ids.length === 0) {
    console.log(
      "\n[reset] No claimed covers for this user — there's nothing to re-migrate.",
    );
  }

  if (!apply) {
    console.log("\n[reset] DRY RUN — re-run with --apply to execute.\n");
    return;
  }

  // ---- 1. Delete the repo copies (authored by the user). ----
  if (!noDelete && ids.length > 0) {
    const { agent, did: sessionDid, handle } = await loginAtprotoAgent({
      handleEnv: "RESET_USER_HANDLE",
      passwordEnv: "RESET_USER_APP_PASSWORD",
    });
    // Never delete from the wrong repo: the login must BE the target user.
    if (sessionDid !== target.did) {
      throw new Error(
        `Logged in as ${sessionDid} (@${handle}) but the target user's DID is ` +
          `${target.did}. Set RESET_USER_HANDLE/RESET_USER_APP_PASSWORD to the ` +
          `target account and re-run.`,
      );
    }
    let deleted = 0;
    let missing = 0;
    for (const rkey of rkeys) {
      try {
        await agent.com.atproto.repo.deleteRecord({
          repo: target.did,
          collection: SUBMISSION_COLLECTION,
          rkey,
        });
        deleted++;
        if (verbose) console.log(`  deleted ${rkey}`);
      } catch (err) {
        // An already-absent record is fine — the pointer clear below is what
        // matters, and recreate upserts regardless.
        missing++;
        if (verbose) {
          const msg = err instanceof Error ? err.message : String(err);
          console.log(`  skip ${rkey} (${msg})`);
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
  console.log(`[reset] cleared claimed pointers on ${ids.length} cover(s)`);

  // ---- 3. Soft-unlink the identity. ----
  if (!keepLink) {
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
  }

  console.log(
    "\n[reset] done. Now sign in, open /dashboard/profile, " +
      (keepLink ? "re-link to refresh permissions" : "link your Bluesky account") +
      ", and watch the covers re-migrate.\n",
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
