"use server";

/**
 * Phase B write path — claiming backfilled covers.
 * See docs/atproto-migration/claiming-backfilled-submissions.md.
 *
 * Claiming brings a cover *fully* into the signed-in user's own repo, in one move:
 *   1. its `fm.plyr.track` is re-created in the user's repo — the audio uploaded as a blob
 *      to their PDS, with the existing R2 url + duration + trusted cover carried along
 *      (ensurePlyrTrackForCover),
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
 * Claiming only ever moves records INTO the user's repo. The reverse — unclaiming,
 * deleting the user copy — is a teardown/admin concern handled by the reset script
 * (packages/scripts/.../reset-migration-for-user.ts), not something the app exposes.
 */

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@eptss/auth/server";
import { loadIdentity } from "@eptss/auth/atproto";
import { db, submissions, eq, and } from "@eptss/db";
import {
  eptssSubmissionRkey,
  getSubmissionRecord,
  getPlyrTrackRecord,
  atUriRkey,
  type StrongRef,
} from "@eptss/atproto";
import { getUserAgent } from "./agent";
import { writeOwnedSubmission } from "./migrate-core";
import { ensurePlyrTrackForCover } from "./plyr-upload";
import { plyrOwnership } from "./plyr-ownership";

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
): Promise<{
  claimedAtUri: string | null;
  plyrTrackUri: string | null;
  plyrTrackCid: string | null;
} | null> {
  const rows = await db
    .select({
      claimedAtUri: submissions.claimedAtUri,
      plyrTrackUri: submissions.plyrTrackUri,
      plyrTrackCid: submissions.plyrTrackCid,
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
 * N covers should not mean N page rebuilds. Idempotent and self-healing: a cover
 * already fully home (claimed, plyr track in the user's repo) is a no-op success; a
 * claimed cover whose plyr track never made it home (e.g. a mid-claim upload failure)
 * is topped up — the track homed and the submission's payload re-stamped.
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

    const alreadyClaimed = Boolean(owned.claimedAtUri);
    const ownership = plyrOwnership(owned.plyrTrackUri, identity.did);

    // Already fully home: the submission is claimed AND its plyr track lives in the user's
    // repo (or there's no plyr track to move). Nothing to do — idempotent no-op.
    if (alreadyClaimed && ownership !== "eptss") {
      return { ok: true, claimedAtUri: owned.claimedAtUri! };
    }

    const rkey = eptssSubmissionRkey(submissionId);

    // The canonical content lives on the admin scaffold (public read).
    const source = await getSubmissionRecord(rkey);
    if (!source) {
      // A claimed cover whose scaffold is gone is degenerate — leave it be. An unclaimed
      // one simply isn't on the network yet, so there's nothing to claim.
      if (alreadyClaimed) return { ok: true, claimedAtUri: owned.claimedAtUri! };
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

    // 1. Resolve the cover's plyr deliverable, landing it in the user's repo when it isn't
    //    there yet. ensurePlyrTrackForCover createRecords a NEW track each call, so a track
    //    already in the user's repo ("mine" — a cover moved before it was claimed) must be
    //    reused, never re-uploaded, or we'd duplicate it. "eptss"/"none" means we upload
    //    (audio uploadBlob'd user-owned, with the existing R2 url + duration + plyr-hosted
    //    cover carried so plyr serves it audio_storage="both"); null when there's no
    //    uploadable audio, in which case the submission keeps its `url`.
    let plyrRef: StrongRef | null;
    if (ownership === "mine" && owned.plyrTrackUri) {
      const cid =
        owned.plyrTrackCid ??
        (await getPlyrTrackRecord(identity.did, atUriRkey(owned.plyrTrackUri)))?.cid ??
        null;
      plyrRef = cid ? { uri: owned.plyrTrackUri, cid } : null;
    } else {
      plyrRef = await ensurePlyrTrackForCover({
        agent,
        did: identity.did,
        handle: identity.handle,
        submissionId,
        userId,
      });
    }

    // 2. Write (or re-stamp) the submission in the user's repo with the plyr ref as its
    //    deliverable (`payload`), reading it back to prove the new home resolves. For an
    //    already-claimed cover this just updates the payload to the freshly-homed track.
    const written = await writeOwnedSubmission({
      agent,
      did: identity.did,
      submissionId,
      source: source.value,
      plyrRef,
    });

    // 3. Record the new location (the tombstone signal) on first claim; a top-up of an
    //    already-claimed cover leaves claimed_at_uri as-is. Admin copy stays a backup.
    if (!alreadyClaimed) {
      await db
        .update(submissions)
        .set({ claimedAtUri: written.uri, claimedAt: new Date() })
        .where(eq(submissions.id, submissionId));
    }

    console.log(
      `[claim] #${submissionId} ${alreadyClaimed ? "topped up" : "claimed"} -> ${written.uri} (${plyrRef ? "plyr payload" : "url"})`,
    );
    return { ok: true, claimedAtUri: alreadyClaimed ? owned.claimedAtUri! : written.uri };
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
