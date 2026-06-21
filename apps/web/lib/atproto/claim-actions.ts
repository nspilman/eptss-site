"use server";

/**
 * Phase B write path — claiming backfilled covers.
 * See docs/atproto-migration/claiming-backfilled-submissions.md.
 *
 * Claiming brings a cover *fully* into the signed-in user's own repo, in one move:
 *   1. its `fm.plyr.track` is re-homed into the user's repo (ensurePlyrTrackOwned),
 *   2. its `at.atjam.submission` is written into the user's repo with `payload` →
 *      that owned plyr track (writeOwnedSubmission) — same rkey, round/note/createdAt
 *      carried from the admin scaffold, deliverable upgraded from the raw Supabase
 *      `url` to a strong-ref. A cover with no plyr track keeps its `url`.
 * It reads each write back to prove the new home resolves, then records the
 * submission's new location in Postgres (`claimed_at_uri`). The admin copies are
 * left intact as a backup — the claim is "tombstoned" by the pointer, not deleted;
 * the hard delete is Phase D. The claim-aware read seam (applyClaims) sources the
 * user copy.
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
import { eptssSubmissionRkey, getSubmissionRecord } from "@eptss/atproto";
import { getUserAgent } from "./agent";
import { SUBMISSION_COLLECTION, writeOwnedSubmission } from "./migrate-core";
import { ensurePlyrTrackForCover } from "./plyr-upload";

export interface ClaimResult {
  ok: boolean;
  error?: string;
  claimedAtUri?: string;
  /** Not an error — the cover simply isn't on the network yet (not backfilled). */
  skipped?: boolean;
}

/** Confirm the submission belongs to this user, with the state the migration needs. */
async function loadOwnedSubmission(
  submissionId: number,
  userId: string,
): Promise<{ claimedAtUri: string | null; plyrTrackUri: string | null } | null> {
  const rows = await db
    .select({
      claimedAtUri: submissions.claimedAtUri,
      plyrTrackUri: submissions.plyrTrackUri,
    })
    .from(submissions)
    .where(and(eq(submissions.id, submissionId), eq(submissions.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * The per-record claim core: bring a cover's plyr track + submission home, read
 * each back to prove it resolves, then record the submission's new location.
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

    // 1. Land the cover's plyr track in the user's own repo — audio uploadBlob'd (user-
    //    owned), cover art carried from the scaffold. Null when there's no uploadable
    //    audio, in which case the submission keeps its `url`.
    const plyrRef = await ensurePlyrTrackForCover({
      agent,
      did: identity.did,
      handle: identity.handle,
      submissionId,
      userId,
      plyrTrackUri: owned.plyrTrackUri,
    });

    // 2. Write the submission into the user's repo with the plyr ref as its
    //    deliverable (`payload`), reading it back to prove the new home resolves.
    const written = await writeOwnedSubmission({
      agent,
      did: identity.did,
      submissionId,
      source: source.value,
      plyrRef,
    });

    // 3. Record the new location (the tombstone signal). Admin copy stays a backup.
    await db
      .update(submissions)
      .set({ claimedAtUri: written.uri, claimedAt: new Date() })
      .where(eq(submissions.id, submissionId));

    console.log(
      `[claim] #${submissionId} claimed -> ${written.uri} (${plyrRef ? "plyr payload" : "url"})`,
    );
    return { ok: true, claimedAtUri: written.uri };
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
