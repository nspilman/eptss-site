/**
 * The claim-aware read seam — the "location index" the Build Plan describes.
 * See docs/atproto-migration/claiming-backfilled-submissions.md.
 *
 * The read layer (getEptssData) lists the EPTSS admin repo — the backfill
 * scaffold. When a participant has *claimed* a cover, its canonical record now
 * lives in their own repo. This function re-homes those records in a read
 * result, but stays **DB-free and pure**: the claim index (Postgres
 * `claimed_at_uri`, keyed by submissions.id) is passed in as a plain map, so
 * the package never touches the database.
 *
 * Because a claimed record keeps the same rkey and the same content, only its
 * *home* changes — so re-homing is just swapping `uri` to the user-repo URI.
 * No re-fetch from the user's PDS is needed for display, and there is no
 * duplicate to dedupe (the package only ever read the admin copy).
 *
 * This is the seam that lets Postgres answer "where does this submission live"
 * today and a backlinks-derived map answer it later — with no caller change.
 */
import type { RecordEnvelope, Submission } from "./types";
import { eptssSubmissionId } from "./eptss-rkey";

export function applyClaims(
  submissions: RecordEnvelope<Submission>[],
  claimedUriById: Map<number, string>,
): RecordEnvelope<Submission>[] {
  if (claimedUriById.size === 0) return submissions;
  return submissions.map((s) => {
    const id = eptssSubmissionId(s.uri);
    const claimedUri = id != null ? claimedUriById.get(id) : undefined;
    return claimedUri ? { ...s, uri: claimedUri } : s;
  });
}
