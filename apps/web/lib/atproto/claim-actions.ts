"use server";

/**
 * Phase B write path — claiming backfilled covers.
 * See docs/atproto-migration/claiming-backfilled-submissions.md.
 *
 * Claiming copies a cover's at.atjam.submission record from the EPTSS admin
 * scaffold into the signed-in user's own repo (same rkey + content), reads it
 * back to prove the new home resolves, then records the new location in Postgres
 * (`claimed_at_uri`). The admin copy is left intact as a backup — the claim is
 * "tombstoned" by the pointer, not deleted; the hard delete is Phase D. The
 * claim-aware read seam (applyClaims) then sources the user copy.
 *
 * Self-verifying, no curation gate: EPTSS's own DB confirms the submission is
 * this user's, and OAuth has proven they control the DID.
 *
 * Every step is reversible until Phase D: unclaimSubmission clears the pointer
 * (the reader reverts to the admin copy) and best-effort removes the user copy.
 */

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@eptss/auth/server";
import { loadIdentity } from "@eptss/auth/atproto";
import { db, submissions, eq, and } from "@eptss/db";
import { EPTSS_DID, eptssSubmissionRkey, getSubmissionRecord } from "@eptss/atproto";
import { getUserAgent } from "./agent";

const SUBMISSION_COLLECTION = "at.atjam.submission";

export interface ClaimResult {
  ok: boolean;
  error?: string;
  claimedAtUri?: string;
  /** Not an error — the cover simply isn't on the network yet (not backfilled). */
  skipped?: boolean;
}

export interface ClaimAllResult {
  ok: boolean;
  error?: string;
  claimed: number;
  skipped: number;
  failed: number;
  /** Per-cover notes (why each was skipped/failed), for visible diagnostics. */
  details?: string[];
}

/** Confirm the submission belongs to this user and report its claim state. */
async function loadOwnedSubmission(
  submissionId: number,
  userId: string,
): Promise<{ claimedAtUri: string | null } | null> {
  const rows = await db
    .select({ claimedAtUri: submissions.claimedAtUri })
    .from(submissions)
    .where(and(eq(submissions.id, submissionId), eq(submissions.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Claim one backfilled cover into the signed-in user's repo. Idempotent:
 * re-claiming an already-claimed cover is a no-op success.
 */
export async function claimSubmission(
  submissionId: number,
): Promise<ClaimResult> {
  try {
    const { userId } = await getAuthUser();
    if (!userId) return { ok: false, error: "Not signed in." };

    const identity = await loadIdentity(userId);
    if (!identity) {
      return { ok: false, error: "Link your Bluesky account first." };
    }

    const owned = await loadOwnedSubmission(submissionId, userId);
    if (!owned) return { ok: false, error: "That cover isn't yours to claim." };
    if (owned.claimedAtUri) {
      console.log(`[claim] #${submissionId} already claimed -> ${owned.claimedAtUri}`);
      return { ok: true, claimedAtUri: owned.claimedAtUri };
    }

    const rkey = eptssSubmissionRkey(submissionId);

    // The canonical content lives on the admin scaffold (public read).
    const source = await getSubmissionRecord(rkey);
    if (!source) {
      console.log(`[claim] #${submissionId} (${rkey}) not on the network — skipped`);
      return {
        ok: false,
        skipped: true,
        error: "This cover isn't on the network yet, so there's nothing to claim.",
      };
    }

    let agent;
    try {
      agent = await getUserAgent(identity.did);
    } catch (err) {
      console.error(`[claim] #${submissionId} session restore failed`, err);
      return { ok: false, error: "Your Bluesky session expired — re-link to claim." };
    }

    // Write an identical copy into the user's own repo (same rkey, same value).
    const put = await agent.com.atproto.repo.putRecord({
      repo: identity.did,
      collection: SUBMISSION_COLLECTION,
      rkey,
      record: source.value as unknown as Record<string, unknown>,
    });
    console.log(`[claim] #${submissionId} putRecord -> ${put.data.uri}`);

    // Prove the new home resolves BEFORE we treat it as canonical.
    await agent.com.atproto.repo.getRecord({
      repo: identity.did,
      collection: SUBMISSION_COLLECTION,
      rkey,
    });

    // Record the new location (the tombstone signal). Admin copy stays as backup.
    await db
      .update(submissions)
      .set({ claimedAtUri: put.data.uri, claimedAt: new Date() })
      .where(eq(submissions.id, submissionId));

    revalidatePath("/dashboard/profile");
    console.log(`[claim] #${submissionId} claimed OK`);
    return { ok: true, claimedAtUri: put.data.uri };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error(`[claim] #${submissionId} FAILED:`, err);
    return { ok: false, error: `Claim failed: ${message}` };
  }
}

/**
 * Reverse a claim: clear the Postgres pointer (the reader reverts to the admin
 * scaffold immediately) and best-effort delete the user-repo copy. Nothing was
 * destroyed on the admin side, so re-claiming later is safe.
 */
export async function unclaimSubmission(
  submissionId: number,
): Promise<ClaimResult> {
  const { userId } = await getAuthUser();
  if (!userId) return { ok: false, error: "Not signed in." };

  const identity = await loadIdentity(userId);
  if (!identity) return { ok: false, error: "Link your Bluesky account first." };

  const owned = await loadOwnedSubmission(submissionId, userId);
  if (!owned) return { ok: false, error: "That cover isn't yours." };

  // Reader reverts to the admin scaffold the moment the pointer is cleared.
  await db
    .update(submissions)
    .set({ claimedAtUri: null, claimedAt: null })
    .where(eq(submissions.id, submissionId));

  // Best-effort cleanup of the user-repo copy; non-fatal if the session is gone.
  try {
    const agent = await getUserAgent(identity.did);
    await agent.com.atproto.repo.deleteRecord({
      repo: identity.did,
      collection: SUBMISSION_COLLECTION,
      rkey: eptssSubmissionRkey(submissionId),
    });
  } catch {
    // The pointer is already cleared; an orphaned user copy is harmless and a
    // future claim upserts it.
  }

  revalidatePath("/dashboard/profile");
  return { ok: true };
}

/**
 * Claim a user's whole backfilled history in one pass. Reuses the verified
 * single-claim path per submission, so it inherits its safety (read-back before
 * the pointer is set, admin copy kept as backup). Idempotent + resumable: only
 * not-yet-claimed covers are attempted, so a partial run can simply be re-run.
 * Covers not on the network yet are skipped, not failed.
 */
export async function claimAllMine(): Promise<ClaimAllResult> {
  const empty = { claimed: 0, skipped: 0, failed: 0 };
  console.log("[claim] claimAllMine start");
  try {
    const { userId } = await getAuthUser();
    if (!userId) return { ok: false, error: "Not signed in.", ...empty };

    const identity = await loadIdentity(userId);
    if (!identity) {
      return { ok: false, error: "Link your Bluesky account first.", ...empty };
    }

    const rows = await db
      .select({ id: submissions.id, claimedAtUri: submissions.claimedAtUri })
      .from(submissions)
      .where(eq(submissions.userId, userId));
    const todo = rows.filter((r) => !r.claimedAtUri).map((r) => r.id);
    console.log(
      `[claim] claimAllMine: ${rows.length} cover(s) total, ${todo.length} to claim`,
      todo,
    );
    if (todo.length === 0) {
      return {
        ok: true,
        ...empty,
        details: ["Nothing to claim — all your covers are already claimed."],
      };
    }

    let claimed = 0;
    let skipped = 0;
    let failed = 0;
    const details: string[] = [];
    for (const id of todo) {
      const res = await claimSubmission(id);
      if (res.ok) {
        claimed++;
      } else if (res.skipped) {
        skipped++;
        details.push(`#${id}: not on the network yet`);
      } else {
        failed++;
        details.push(`#${id}: ${res.error ?? "failed"}`);
      }
    }

    revalidatePath("/dashboard/profile");
    console.log(
      `[claim] claimAllMine done: ${claimed} claimed, ${skipped} skipped, ${failed} failed`,
    );
    return { ok: true, claimed, skipped, failed, details };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[claim] claimAllMine FAILED:", err);
    return { ok: false, error: `Claim all failed: ${message}`, ...empty };
  }
}
