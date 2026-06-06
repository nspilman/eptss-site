/**
 * NodeOAuthClient singleton.
 *
 * Cached on globalThis to survive Next.js HMR in dev and module-reload
 * cycles. In production we instantiate once per server process; the
 * caching is harmless.
 *
 * The same instance is used by both /api/atproto/link (calls .authorize)
 * and /api/atproto/callback (calls .callback). It internally talks to
 * stateStore + sessionStore to persist its working set across requests.
 */
import { NodeOAuthClient } from "@atproto/oauth-client-node";
import { getClientMetadata } from "./metadata";
import { stateStore, sessionStore } from "./stores";

const globalForOAuth = globalThis as unknown as {
  oauthClient: NodeOAuthClient | undefined;
};

export function getOAuthClient(): NodeOAuthClient {
  if (globalForOAuth.oauthClient) return globalForOAuth.oauthClient;

  const client = new NodeOAuthClient({
    clientMetadata: getClientMetadata(),
    stateStore,
    sessionStore,
  });

  // Cache in dev so HMR doesn't create a fresh client every reload (which
  // would lose in-memory state and complicate debugging). In production
  // the cache is harmless — one instance per process is what we want.
  globalForOAuth.oauthClient = client;
  return client;
}

/**
 * Resolve a DID to its current handle via plc.directory.
 *
 * Lightweight — pure HTTP, no extra SDK dependency. Returns null if the
 * DID method isn't did:plc, if the directory request fails, or if the
 * document doesn't have an alsoKnownAs handle.
 *
 * Note: the handle resolved here may become stale if the user changes
 * their handle on bsky. Refresh policy is a future concern; for v1 we
 * just capture at link time.
 */
export async function resolveHandleForDid(did: string): Promise<string | null> {
  if (!did.startsWith("did:plc:")) {
    // did:web et al. use a different resolution mechanism. Skip for v1.
    return null;
  }
  try {
    const res = await fetch(`https://plc.directory/${did}`);
    if (!res.ok) return null;
    const doc = (await res.json()) as { alsoKnownAs?: unknown };
    const aka = Array.isArray(doc.alsoKnownAs) ? doc.alsoKnownAs : [];
    for (const entry of aka) {
      if (typeof entry === "string") {
        const match = entry.match(/^at:\/\/(.+)$/);
        if (match) return match[1] ?? null;
      }
    }
    return null;
  } catch {
    return null;
  }
}
