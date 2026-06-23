/**
 * Where a cover's plyr track lives relative to the signed-in user — the read the
 * link→migrate flow uses to decide what still needs homing. Pure (no DB, no network),
 * so a server component can call it freely while rendering.
 *
 * AT-URI parsing lives in @eptss/atproto (atUriDid); this holds only the EPTSS-specific
 * three-state ownership read against the admin custodian DID.
 */
import { EPTSS_DID, atUriDid } from "@eptss/atproto";

export type PlyrOwnership = "none" | "eptss" | "mine";

/**
 * Where a cover's plyr track currently lives:
 *  - "none"  — no plyr track at all (nothing to move)
 *  - "eptss" — still on the EPTSS admin scaffold (movable — the migration homes it)
 *  - "mine"  — already in this user's own repo
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
