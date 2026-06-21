/**
 * Pure helpers for the in-app plyr re-home flow (no DB, no network, no server
 * action) — shared by the profile page (to derive UI state) and the server
 * action (to validate). Kept out of the "use server" module so it can export
 * synchronous functions and be imported by a server component freely.
 *
 * AT-URI parsing lives in @eptss/atproto (atUriDid / atUriRkey); this module
 * holds only what's specific to the EPTSS plyr re-home — the collection, the
 * admin custodian URI, and the three-state ownership read.
 *
 * See docs/atproto-migration/claiming-plyr-tracks.md.
 */
import { EPTSS_DID, atUriDid, type PlyrTrack } from "@eptss/atproto";

export const PLYR_TRACK_COLLECTION = "fm.plyr.track";

/**
 * The shape of a plyr track *copied into a claimer's repo*: plyr's R2 `audioUrl`
 * (repo-independent — it streams the same whoever holds the record) plus metadata,
 * with `artist` re-stamped to the claimer. The original `audioBlob` is intentionally
 * dropped — it's repo-scoped, and carrying it would need a broader (blob) OAuth grant
 * for no gain, since the R2 url is the playable source. One definition, so the in-app
 * re-home and the cover migration can't drift on what a re-homed track is.
 */
export function buildRehomedTrackRecord(
  source: PlyrTrack,
  claimerHandle: string | null,
): Record<string, unknown> {
  const record: Record<string, unknown> = {
    $type: PLYR_TRACK_COLLECTION,
    title: source.title,
    artist: claimerHandle ?? source.artist,
    audioUrl: source.audioUrl,
    duration: source.duration,
    fileType: source.fileType,
    imageUrl: source.imageUrl,
    createdAt: source.createdAt ?? new Date().toISOString(),
  };
  for (const k of Object.keys(record)) {
    if (record[k] === undefined) delete record[k];
  }
  return record;
}

export type PlyrOwnership = "none" | "eptss" | "mine";

/** Reconstruct the admin (custodian) track URI for a given rkey. */
export function adminPlyrUri(rkey: string): string {
  return `at://${EPTSS_DID}/${PLYR_TRACK_COLLECTION}/${rkey}`;
}

/**
 * Where a cover's plyr track currently lives, for the re-home UI:
 *  - "none"  — no plyr track at all (nothing to move)
 *  - "eptss" — still on the EPTSS admin scaffold (movable)
 *  - "mine"  — already re-homed into this user's own repo
 */
export function plyrOwnership(
  plyrTrackUri: string | null | undefined,
  userDid: string,
): PlyrOwnership {
  const did = atUriDid(plyrTrackUri);
  if (!did) return "none";
  if (did === userDid) return "mine";
  if (did === EPTSS_DID) return "eptss";
  return "none";
}
