/**
 * Typed wrapper around the user_atproto_identities table.
 *
 * This module owns the user_id ↔ DID crosswalk. It does NOT own OAuth
 * session blobs — those live in atproto_oauth_sessions (managed by the
 * NodeOAuthClient SessionStore implementation in apps/web/src/lib/atproto/stores.ts).
 *
 * The split:
 *   - This module:   "is user X linked to which DID, and when?"
 *   - SessionStore:  "given a DID, what's the OAuth session blob?"
 *
 * Loading a session for a user is a join: loadIdentity(userId) gives DID,
 * then sessionStore.get(did) gives the blob. The library's restore(did)
 * does the second half automatically.
 *
 * IMPORTANT: This module is server-only. Never import from client components.
 */
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@eptss/db";
import { userAtprotoIdentities } from "@eptss/db/schema";

export interface AtprotoIdentity {
  userId: string;
  did: string;
  handle: string | null;
  linkedAt: Date;
}

/**
 * Load the user's currently-active ATProto identity, if any.
 * Returns null if the user has no active link (never linked, or unlinked).
 */
export async function loadIdentity(userId: string): Promise<AtprotoIdentity | null> {
  const rows = await db
    .select({
      userId: userAtprotoIdentities.userId,
      did: userAtprotoIdentities.did,
      handle: userAtprotoIdentities.handle,
      linkedAt: userAtprotoIdentities.linkedAt,
    })
    .from(userAtprotoIdentities)
    .where(
      and(
        eq(userAtprotoIdentities.userId, userId),
        isNull(userAtprotoIdentities.unlinkedAt),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

/**
 * Look up the active identity for a given DID. Used when incoming events
 * from the network arrive keyed by DID and we need to map back to EPTSS.
 */
export async function loadIdentityByDid(did: string): Promise<AtprotoIdentity | null> {
  const rows = await db
    .select({
      userId: userAtprotoIdentities.userId,
      did: userAtprotoIdentities.did,
      handle: userAtprotoIdentities.handle,
      linkedAt: userAtprotoIdentities.linkedAt,
    })
    .from(userAtprotoIdentities)
    .where(
      and(
        eq(userAtprotoIdentities.did, did),
        isNull(userAtprotoIdentities.unlinkedAt),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

/**
 * Create or update the user's active ATProto identity.
 *
 * If the user already has an active link to the same DID, this UPDATES
 * the handle (handle drift case). If no active row exists, inserts one.
 *
 * Does NOT touch the session blob — that's managed by SessionStore
 * (called separately by the library during the OAuth dance).
 */
export async function saveIdentity(params: {
  userId: string;
  did: string;
  handle: string | null;
}): Promise<void> {
  const updated = await db
    .update(userAtprotoIdentities)
    .set({ handle: params.handle })
    .where(
      and(
        eq(userAtprotoIdentities.userId, params.userId),
        eq(userAtprotoIdentities.did, params.did),
        isNull(userAtprotoIdentities.unlinkedAt),
      ),
    )
    .returning({ id: userAtprotoIdentities.id });

  if (updated.length > 0) return;

  await db.insert(userAtprotoIdentities).values({
    userId: params.userId,
    did: params.did,
    handle: params.handle,
  });
}

/**
 * Soft-delete the user's active link to a given DID.
 *
 * Sets unlinked_at = now(). Caller is responsible for also:
 *   - Calling client.revoke(did) to invalidate tokens on the OAuth server
 *   - Deleting the SessionStore row (DELETE FROM atproto_oauth_sessions WHERE did = ?)
 *
 * Re-linking the same DID later is fine; the partial unique index only
 * cares about active rows.
 */
export async function unlinkIdentity(userId: string, did: string): Promise<void> {
  await db
    .update(userAtprotoIdentities)
    .set({ unlinkedAt: new Date() })
    .where(
      and(
        eq(userAtprotoIdentities.userId, userId),
        eq(userAtprotoIdentities.did, did),
        isNull(userAtprotoIdentities.unlinkedAt),
      ),
    );
}
