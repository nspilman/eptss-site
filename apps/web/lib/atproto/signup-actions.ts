"use server";

/**
 * Bring a signup home — the signup analogue of migrateOneCover.
 *
 * A signup record is thin and fully rebuildable from Postgres, so unlike covers
 * there is no admin scaffold to claim from: we build the `at.atjam.signup` record
 * straight from the `sign_ups` row and write it into the user's own repo. The only
 * thing not in the row is the round's strong-ref, which we read off the (already
 * backfilled) round record on the scaffold.
 *
 * PRIVACY: the nominated song never leaves Postgres. The record carries only the
 * round strong-ref, the original timestamp, and the free-text note (additional
 * comments) — `song_id` and `youtube_link` are deliberately not read here. The
 * lexicon has no song field, so this is privacy by construction.
 *
 * Self-verifying (read-back before the pointer is set) and idempotent (stable
 * `eptss-sig<id>` rkey, so a re-run upserts). Revalidation-free: the migration
 * card drives the loop and refreshes once at the end.
 */

import { getAuthUser } from "@eptss/auth/server";
import { loadIdentity } from "@eptss/auth/atproto";
import { db, signUps, eq, and } from "@eptss/db";
import { eptssSignupRkey, eptssRoundRkey, getRoundRecord } from "@eptss/atproto";
import { getUserAgent } from "./agent";

const SIGNUP_COLLECTION = "at.atjam.signup";

export interface SignupMigrateResult {
  ok: boolean;
  error?: string;
  claimedAtUri?: string;
  /** Not an error — the round isn't on the network yet, so there's no strong-ref. */
  skipped?: boolean;
}

/** Confirm the signup is this user's, and report its round + note. */
async function loadOwnedSignup(
  signupId: number,
  userId: string,
): Promise<{ roundId: number; createdAt: Date | null; note: string | null } | null> {
  const rows = await db
    .select({
      roundId: signUps.roundId,
      createdAt: signUps.createdAt,
      note: signUps.additionalComments,
    })
    .from(signUps)
    .where(and(eq(signUps.id, signupId), eq(signUps.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Migrate one signup into the signed-in user's repo. Idempotent: a re-run of an
 * already-migrated signup is a no-op success.
 */
export async function migrateOneSignup(
  signupId: number,
): Promise<SignupMigrateResult> {
  try {
    const { userId } = await getAuthUser();
    if (!userId) return { ok: false, error: "Not signed in." };

    const identity = await loadIdentity(userId);
    if (!identity) return { ok: false, error: "Link your Bluesky account first." };

    const owned = await loadOwnedSignup(signupId, userId);
    if (!owned) return { ok: false, error: "That signup isn't yours to migrate." };

    // The round strong-ref lives on the scaffold (rounds were backfilled). The cid
    // is a content hash we can't derive, so we fetch the record to get { uri, cid }.
    const roundRec = await getRoundRecord(eptssRoundRkey(owned.roundId));
    if (!roundRec) {
      return {
        ok: false,
        skipped: true,
        error: "That round isn't on the network yet, so there's nothing to link to.",
      };
    }

    // Song-free by construction — see the file header. Canonical shape mirrors
    // create-user-signup.ts buildSignupRecord: { round, createdAt, note? }.
    const record: Record<string, unknown> = {
      $type: SIGNUP_COLLECTION,
      round: { uri: roundRec.uri, cid: roundRec.cid },
      createdAt: (owned.createdAt ?? new Date()).toISOString(),
    };
    if (owned.note) record.note = owned.note;

    let agent;
    try {
      agent = await getUserAgent(identity.did);
    } catch (err) {
      console.error(`[signup-migrate] #${signupId} session restore failed`, err);
      return { ok: false, error: "Your Bluesky session expired — re-link to migrate." };
    }

    const rkey = eptssSignupRkey(signupId);
    const put = await agent.com.atproto.repo.putRecord({
      repo: identity.did,
      collection: SIGNUP_COLLECTION,
      rkey,
      record,
    });

    // Prove the new home resolves before we treat it as done. The stable rkey
    // makes this idempotent — a re-run upserts the same record. No DB pointer:
    // the repo itself records that this signup is now home (see getClaimableSignups).
    await agent.com.atproto.repo.getRecord({
      repo: identity.did,
      collection: SIGNUP_COLLECTION,
      rkey,
    });

    console.log(`[signup-migrate] #${signupId} -> ${put.data.uri}`);
    return { ok: true, claimedAtUri: put.data.uri };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error(`[signup-migrate] #${signupId} FAILED:`, err);
    return { ok: false, error: `Signup migration failed: ${message}` };
  }
}
