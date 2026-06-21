/**
 * Shared write-cores for moving a cover's records into the signed-in user's repo.
 *
 * Two "use server" entry points compose these so the submission record and its
 * plyr track always travel together and stay in lockstep:
 *   - the cover migration (claim-actions.ts), and
 *   - the standalone plyr re-home (plyr-actions.ts).
 *
 * The shape we're building toward, per cover, in the user's OWN repo:
 *   fm.plyr.track/<rkey>          — the audio, owned by the user
 *   at.atjam.submission/eptss-sub<id>  — with `payload` → that track
 *
 * Before this, a migrated cover left two *unlinked* records: the submission carried
 * the raw Supabase `url` and the plyr track sat off to the side. `payload` makes the
 * submission reference a first-class record instead of raw storage; the `url` is
 * only kept as a fallback for a cover that has no plyr track at all.
 *
 * No "use server": these are internal helpers, not RPC endpoints. They take a live
 * Agent so the caller restores the OAuth session once and owns the page refresh.
 */
import type { Agent } from "@atproto/api";
import { db, submissions, eq } from "@eptss/db";
import {
  EPTSS_DID,
  atUriDid,
  atUriRkey,
  eptssSubmissionRkey,
  getPlyrTrackRecord,
  type StrongRef,
  type Submission,
} from "@eptss/atproto";
import { PLYR_TRACK_COLLECTION, buildRehomedTrackRecord } from "./plyr-rehome";

export const SUBMISSION_COLLECTION = "at.atjam.submission";

/** Does this look like the PDS refusing the write for lack of OAuth scope? */
export function looksLikeScopeError(err: unknown): boolean {
  const m = err instanceof Error ? err.message : String(err);
  return /scope|forbidden|insufficient|not permitted|invalidtoken|bad token/i.test(m);
}

/** Fill in a strong-ref's cid from the network when the pointer only had the uri. */
async function refWithCid(uri: string, cid: string | null): Promise<StrongRef> {
  if (cid) return { uri, cid };
  const did = atUriDid(uri);
  const rec = did ? await getPlyrTrackRecord(did, atUriRkey(uri)) : null;
  return { uri, cid: rec?.cid ?? "" };
}

/**
 * Make a cover's plyr track live in the user's repo, returning the ref to record on
 * the submission (or null when the cover has no plyr track — the submission then
 * falls back to its `url`). The audio never moves: plyr's R2 url is repo-independent,
 * so only the record is copied (see plyr-actions.ts header).
 *
 * Best-effort full ownership — it always yields a *valid* plyr ref, owned when it can:
 *  - already the user's     → their ref (no write)
 *  - on the admin scaffold  → duplicate it in, repoint the Postgres pointer, theirs
 *  - re-home write failed    → the admin copy's ref (the cover still references plyr;
 *                              the re-home button stays the place to fully own it)
 */
export async function ensurePlyrTrackOwned(opts: {
  agent: Agent;
  did: string;
  handle: string | null;
  submissionId: number;
  plyrTrackUri: string | null;
  plyrTrackCid: string | null;
}): Promise<StrongRef | null> {
  const { agent, did, handle, submissionId, plyrTrackUri, plyrTrackCid } = opts;
  const trackDid = atUriDid(plyrTrackUri);
  if (!plyrTrackUri || !trackDid) return null;

  // Already in the user's own repo, or hosted somewhere we can't re-home from —
  // record it as-is (a valid plyr ref either way).
  if (trackDid !== EPTSS_DID) {
    return refWithCid(plyrTrackUri, plyrTrackCid);
  }

  const rkey = atUriRkey(plyrTrackUri);
  const source = await getPlyrTrackRecord(EPTSS_DID, rkey);
  if (!source) {
    // The pointer names a track that isn't on the scaffold — record it as-is.
    return { uri: plyrTrackUri, cid: plyrTrackCid ?? "" };
  }

  try {
    const put = await agent.com.atproto.repo.putRecord({
      repo: did,
      collection: PLYR_TRACK_COLLECTION,
      rkey,
      record: buildRehomedTrackRecord(source.value, handle),
    });
    // Prove the new home resolves, then repoint the pointer; admin copy stays a backup.
    await agent.com.atproto.repo.getRecord({
      repo: did,
      collection: PLYR_TRACK_COLLECTION,
      rkey,
    });
    await db
      .update(submissions)
      .set({ plyrTrackUri: put.data.uri, plyrTrackCid: put.data.cid })
      .where(eq(submissions.id, submissionId));
    console.log(`[migrate] #${submissionId} plyr track re-homed -> ${put.data.uri}`);
    return { uri: put.data.uri, cid: put.data.cid };
  } catch (err) {
    // Re-home is best-effort: the cover should still migrate referencing a plyr
    // record (the admin copy we just read), not hard-fail on the track move.
    const why = looksLikeScopeError(err) ? "scope denied — re-link to own it" : "error";
    console.warn(`[migrate] #${submissionId} plyr re-home skipped (${why}) — using EPTSS ref`, err);
    return { uri: plyrTrackUri, cid: plyrTrackCid ?? source.cid };
  }
}

/**
 * Write the cover's at.atjam.submission into the user's repo (upsert at its stable
 * rkey, read back to prove it resolves). Round / note / createdAt come from the
 * scaffold copy the backfill wrote — only the *deliverable* changes: the plyr
 * strong-ref when there is one, else the scaffold's legacy `url`, so a cover always
 * carries exactly one deliverable. Returns the written ref.
 */
export async function writeOwnedSubmission(opts: {
  agent: Agent;
  did: string;
  submissionId: number;
  source: Submission;
  plyrRef: StrongRef | null;
}): Promise<StrongRef> {
  const { agent, did, submissionId, source, plyrRef } = opts;
  const rkey = eptssSubmissionRkey(submissionId);

  const record: Record<string, unknown> = {
    $type: SUBMISSION_COLLECTION,
    round: source.round,
    ...(source.note ? { note: source.note } : {}),
    createdAt: source.createdAt,
  };
  // Prefer the plyr record as the artifact; the raw `url` is only a fallback for a
  // cover with no plyr track (an at.atjam.submission needs a deliverable).
  if (plyrRef) record.payload = plyrRef;
  else if (source.url) record.url = source.url;

  const put = await agent.com.atproto.repo.putRecord({
    repo: did,
    collection: SUBMISSION_COLLECTION,
    rkey,
    record,
  });
  await agent.com.atproto.repo.getRecord({
    repo: did,
    collection: SUBMISSION_COLLECTION,
    rkey,
  });
  return { uri: put.data.uri, cid: put.data.cid };
}
