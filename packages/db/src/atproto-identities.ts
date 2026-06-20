/**
 * Read helpers over the `user_atproto_identities` table.
 *
 * The auth package's session-store owns WRITES and the per-user identity
 * crosswalk; this is a lightweight batch READ that any layer can use to show a
 * member's Atmosphere handle in place of their EPTSS username. It lives in the
 * db package so feature packages (comments, core services) can reach it without
 * depending on auth.
 */
import { and, inArray, isNull } from "drizzle-orm";
import { db } from "./connection";
import { userAtprotoIdentities } from "./schema";

/**
 * Batch-load active ATProto handles for many users at once.
 *
 * Returns a Map of userId → handle containing ONLY users who have an active
 * link (unlinked_at IS NULL) with a non-null handle. Users who never linked,
 * unlinked, or whose handle didn't resolve are simply absent from the map.
 */
export async function loadActiveHandles(
  userIds: string[],
): Promise<Map<string, string>> {
  const ids = [...new Set(userIds)].filter(Boolean);
  if (ids.length === 0) return new Map();

  const rows = await db
    .select({
      userId: userAtprotoIdentities.userId,
      handle: userAtprotoIdentities.handle,
    })
    .from(userAtprotoIdentities)
    .where(
      and(
        inArray(userAtprotoIdentities.userId, ids),
        isNull(userAtprotoIdentities.unlinkedAt),
      ),
    );

  const out = new Map<string, string>();
  for (const r of rows) {
    if (r.handle) out.set(r.userId, r.handle);
  }
  return out;
}

/**
 * Batch-load active ATProto identities (DID + handle) for many users at once.
 *
 * Like {@link loadActiveHandles}, but keyed on the DID — the stable identity —
 * so callers that need to know *which repo* a user's records live in (e.g. the
 * admin migration tracker) get the DID, with the handle as the human-readable
 * label (which may be null if it never resolved). Only active links
 * (unlinked_at IS NULL) are returned; unlinked users are simply absent.
 */
export async function loadActiveIdentities(
  userIds: string[],
): Promise<Map<string, { did: string; handle: string | null }>> {
  const ids = [...new Set(userIds)].filter(Boolean);
  if (ids.length === 0) return new Map();

  const rows = await db
    .select({
      userId: userAtprotoIdentities.userId,
      did: userAtprotoIdentities.did,
      handle: userAtprotoIdentities.handle,
    })
    .from(userAtprotoIdentities)
    .where(
      and(
        inArray(userAtprotoIdentities.userId, ids),
        isNull(userAtprotoIdentities.unlinkedAt),
      ),
    );

  const out = new Map<string, { did: string; handle: string | null }>();
  for (const r of rows) {
    // First active row wins; unlinked rows are already filtered out.
    if (!out.has(r.userId)) out.set(r.userId, { did: r.did, handle: r.handle ?? null });
  }
  return out;
}
