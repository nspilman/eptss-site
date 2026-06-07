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
import { EPTSS_DID, atUriDid } from "@eptss/atproto";

export const PLYR_TRACK_COLLECTION = "fm.plyr.track";

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
