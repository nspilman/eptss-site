/**
 * Postgres-backed implementations of @atproto/oauth-client-node's
 * NodeSavedStateStore and NodeSavedSessionStore.
 *
 * These satisfy the SimpleStore<string, V> interface:
 *   - get(key) → V | undefined
 *   - set(key, value) → void
 *   - del(key) → void
 *
 * Values are opaque blobs from the library (DPoP key converted to JWK).
 * We treat them as `unknown` at the boundary and let the library serialize
 * its own shape into jsonb.
 *
 * State store: short-lived. We add expires_at = now + 10min on set, and
 * filter expired rows on get. The library deletes successful entries; we
 * opportunistically sweep expired ones on each get.
 *
 * Session store: long-lived. No automatic expiry — sessions persist until
 * the user unlinks (which deletes the row) or the OAuth provider revokes
 * them (in which case the library's refresh logic will fail and we'll
 * surface the error).
 */
import { eq, lt } from "drizzle-orm";
import type { NodeSavedStateStore, NodeSavedSessionStore } from "@atproto/oauth-client-node";
import { db } from "@eptss/db";
import { atprotoOauthState, atprotoOauthSessions } from "@eptss/db/schema";

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes — generous, matches library default behavior

export const stateStore: NodeSavedStateStore = {
  async get(key) {
    // Opportunistically sweep expired rows. Cheap (one extra query on get).
    await db.delete(atprotoOauthState).where(lt(atprotoOauthState.expiresAt, new Date()));

    const rows = await db
      .select({ value: atprotoOauthState.value })
      .from(atprotoOauthState)
      .where(eq(atprotoOauthState.key, key))
      .limit(1);

    // Library's NodeSavedState shape is owned by them; we stored what they gave us.
    return rows[0]?.value as Awaited<ReturnType<NodeSavedStateStore["get"]>>;
  },

  async set(key, value) {
    const expiresAt = new Date(Date.now() + STATE_TTL_MS);
    // Upsert — if the same key is reused (rare but possible during retries), overwrite.
    await db
      .insert(atprotoOauthState)
      .values({
        key,
        value: value as unknown as Parameters<typeof db.insert>[0],
        expiresAt,
      })
      .onConflictDoUpdate({
        target: atprotoOauthState.key,
        set: {
          value: value as unknown as Parameters<typeof db.insert>[0],
          expiresAt,
        },
      });
  },

  async del(key) {
    await db.delete(atprotoOauthState).where(eq(atprotoOauthState.key, key));
  },
};

export const sessionStore: NodeSavedSessionStore = {
  async get(sub) {
    const rows = await db
      .select({ value: atprotoOauthSessions.value })
      .from(atprotoOauthSessions)
      .where(eq(atprotoOauthSessions.did, sub))
      .limit(1);

    return rows[0]?.value as Awaited<ReturnType<NodeSavedSessionStore["get"]>>;
  },

  async set(sub, value) {
    // Upsert — set is called on initial save AND on every token refresh
    // (the library rotates refresh tokens per the OAuth spec).
    await db
      .insert(atprotoOauthSessions)
      .values({
        did: sub,
        value: value as unknown as Parameters<typeof db.insert>[0],
      })
      .onConflictDoUpdate({
        target: atprotoOauthSessions.did,
        set: {
          value: value as unknown as Parameters<typeof db.insert>[0],
          updatedAt: new Date(),
        },
      });
  },

  async del(sub) {
    await db.delete(atprotoOauthSessions).where(eq(atprotoOauthSessions.did, sub));
  },
};
