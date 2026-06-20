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
 * The per-record claim core: copy the admin scaffold record into the user's repo,
 * read it back to prove the new home resolves, then record the new location.
 *
 * Deliberately free of revalidation so callers control when the page refreshes:
 * `claimSubmission` refreshes immediately (a manual single claim), while the
 * guided link→migrate loop drives many of these and refreshes once at the end —
 * N covers should not mean N page rebuilds. Idempotent: re-claiming an
 * already-claimed cover is a no-op success.
 */
async function claimOne(submissionId: number): Promise<ClaimResult> {
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

    console.log(`[claim] #${submissionId} claimed OK`);
    return { ok: true, claimedAtUri: put.data.uri };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error(`[claim] #${submissionId} FAILED:`, err);
    return { ok: false, error: `Claim failed: ${message}` };
  }
}

/** Claim one cover and refresh the profile immediately (manual single claim). */
export async function claimSubmission(
  submissionId: number,
): Promise<ClaimResult> {
  const res = await claimOne(submissionId);
  if (res.ok) revalidatePath("/dashboard/profile");
  return res;
}

/**
 * Claim one cover as a step in the guided link→migrate flow. Identical move to
 * `claimSubmission`, but the client drives the loop and calls `router.refresh()`
 * once it finishes — so this skips the per-record revalidate. See CoverMigration.
 */
export async function migrateOneCover(
  submissionId: number,
): Promise<ClaimResult> {
  return claimOne(submissionId);
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
