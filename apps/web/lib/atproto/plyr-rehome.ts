/**
 * Pure helpers for the in-app plyr re-home flow (no DB, no network, no server
 * action) — shared by the profile page (to derive UI state) and the server
 * action (to validate). Kept out of the "use server" module so it can export
 * synchronous functions and be imported by a server component freely.
 *
 * See docs/atproto-migration/claiming-plyr-tracks.md.
 */
import { EPTSS_DID } from "@eptss/atproto";

export const PLYR_TRACK_COLLECTION = "fm.plyr.track";

export type PlyrOwnership = "none" | "eptss" | "mine";

/** The DID authority of an `at://` URI, or null if it doesn't parse. */
export function didOfUri(uri: string | null | undefined): string | null {
  return uri?.match(/^at:\/\/([^/]+)\//)?.[1] ?? null;
}

/** The rkey (last path segment) of an `at://` URI. */
export function rkeyOfUri(uri: string): string {
  return uri.split("/").pop() ?? uri;
}

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
  const did = didOfUri(plyrTrackUri);
  if (!did) return "none";
  if (did === userDid) return "mine";
  if (did === EPTSS_DID) return "eptss";
  return "none";
}
