/**
 * GET /api/atproto/callback
 *
 * The OAuth redirect destination. The user's PDS calls this after they
 * authorize (or decline). We:
 *   1. Hand the query params to client.callback() — the library validates
 *      the code, exchanges for a session, internally writes to sessionStore,
 *      and returns the OAuthSession + our custom app-state.
 *   2. Parse app-state to recover the userId we stashed at link-initiate.
 *   3. Resolve handle via plc.directory (best-effort).
 *   4. Write the (user_id, did, handle) row in user_atproto_identities.
 *   5. Redirect to /dashboard/profile with status query params.
 *
 * Failure modes (each becomes a query param on the profile redirect):
 *
 *   ?linked_error=oauth_denied
 *     OAuth provider returned ?error=... — usually because the user
 *     clicked "deny" on the consent screen.
 *
 *   ?linked_error=callback_failed
 *     client.callback() threw — most likely state expired (user idle
 *     > 10min on consent screen), or bsky's token endpoint is unreachable,
 *     or the code/state pair is invalid (replay attempt, etc).
 *
 *   ?linked_error=invalid_state
 *     OAuth round-trip succeeded but our custom state blob is missing or
 *     malformed. Shouldn't happen unless someone hits the callback URL
 *     by hand with cooked params.
 *
 *   ?linked_error=different_identity&existing_did=did:plc:...
 *     User already has an active link to a *different* DID. UI surfaces
 *     this with an "unlink first or keep this new one" choice. We don't
 *     auto-resolve to avoid silently switching identities.
 *
 *   ?linked=success
 *     Happy path. Profile UI reads this and shows a confirmation toast.
 *
 * Note: the library's sessionStore.set() has ALREADY written the session
 * blob to atproto_oauth_sessions by the time we get the session back.
 * Our job from here is just the (user, DID) crosswalk.
 */
import { NextRequest, NextResponse } from "next/server";
import { getOAuthClient, resolveHandleForDid } from "@/lib/atproto/client";
import { loadIdentity, saveIdentity } from "@eptss/auth/atproto";

export const dynamic = "force-dynamic";

function profileRedirect(origin: string, params: Record<string, string>): NextResponse {
  const url = new URL("/dashboard/profile", origin);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const params = url.searchParams;

  // The PDS may redirect with ?error=... if the user denied (or something
  // went wrong server-side before token exchange).
  const oauthError = params.get("error");
  if (oauthError) {
    return profileRedirect(url.origin, {
      linked_error: oauthError === "access_denied" ? "oauth_denied" : oauthError,
    });
  }

  // Complete the OAuth dance. Library validates code, exchanges for tokens,
  // stores session via sessionStore.set() internally.
  let session, appState: string | null | undefined;
  try {
    const client = getOAuthClient();
    const result = await client.callback(params);
    session = result.session;
    appState = result.state;
  } catch (err) {
    console.error("OAuth callback failed:", err);
    return profileRedirect(url.origin, { linked_error: "callback_failed" });
  }

  // Parse the userId we stashed at link-initiate.
  let userId: string | undefined;
  if (typeof appState === "string") {
    try {
      const parsed = JSON.parse(appState) as { userId?: unknown };
      if (typeof parsed.userId === "string") userId = parsed.userId;
    } catch {
      // appState malformed — fall through to invalid_state error.
    }
  }
  if (!userId) {
    return profileRedirect(url.origin, { linked_error: "invalid_state" });
  }

  const did = session.did;

  // Reject if the user already has an active link to a different DID.
  // We don't silently switch identities; UI must explicitly resolve.
  const existing = await loadIdentity(userId);
  if (existing && existing.did !== did) {
    return profileRedirect(url.origin, {
      linked_error: "different_identity",
      existing_did: existing.did,
    });
  }

  // Best-effort handle resolution. Null is fine; UI degrades gracefully.
  const handle = await resolveHandleForDid(did);

  await saveIdentity({ userId, did, handle });

  return profileRedirect(url.origin, { linked: "success" });
}
