/**
 * Single source of truth for the OAuth client metadata.
 *
 * Used by:
 *   - app/oauth-client-metadata.json/route.ts (serves the JSON document — prod only)
 *   - lib/atproto/client.ts (NodeOAuthClient constructor — dev and prod)
 *
 * Dev mode (NODE_ENV !== "production"):
 *   Uses the OAuth "loopback client" pattern (RFC 8252 + atproto OAuth spec).
 *   client_id is literally `http://localhost?...` with scope + redirect_uri as
 *   query params. NO hosted metadata document needed — the URL IS the metadata.
 *
 *   Asymmetric rule:
 *     - client_id origin must use `localhost` (the hostname)
 *     - redirect_uris must use `127.0.0.1` (the loopback IP)
 *     The OAuth spec explicitly forbids `http://localhost:port` as a redirect_uri.
 *
 * Prod mode:
 *   Uses the discoverable client pattern. client_id is the HTTPS URL where
 *   the metadata document is served. application_type = "web".
 */
import type { OAuthClientMetadataInput } from "@atproto/oauth-types";

// `fm.plyr.track` is granted so a user can re-home a cover's plyr track into
// their own repo (the in-app plyr re-home flow, see lib/atproto/plyr-actions.ts).
// Broadening this scope means existing links must re-consent (re-link) before the
// new collection write is permitted — the flow detects the denial and prompts it.
const SCOPE =
  "atproto repo?collection=at.atjam.signup&collection=at.atjam.submission&collection=fm.plyr.track";

function getProdBaseUrl(): string {
  const explicit = process.env.ATPROTO_PUBLIC_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  return "https://everyoneplaysthesamesong.com";
}

export function getClientMetadata(): OAuthClientMetadataInput {
  if (process.env.NODE_ENV === "production") {
    const baseUrl = getProdBaseUrl();
    return {
      client_id: `${baseUrl}/oauth-client-metadata.json`,
      client_name: "Everyone Plays the Same Song",
      client_uri: baseUrl,
      redirect_uris: [`${baseUrl}/api/atproto/callback`] as [string, ...string[]],
      scope: SCOPE,
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
      application_type: "web",
      dpop_bound_access_tokens: true,
    };
  }

  // Dev: loopback client. The client_id encodes metadata in its query string;
  // no hosted document is fetched. redirect_uri inside client_id must match
  // redirect_uris[0] in the metadata object.
  const devPort = process.env.PORT || "3000";
  const callbackUrl = `http://127.0.0.1:${devPort}/api/atproto/callback`;
  const clientId =
    `http://localhost?` +
    `scope=${encodeURIComponent(SCOPE)}` +
    `&redirect_uri=${encodeURIComponent(callbackUrl)}`;

  return {
    client_id: clientId,
    redirect_uris: [callbackUrl] as [string, ...string[]],
    scope: SCOPE,
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
    application_type: "native", // loopback clients are "native" per spec
    dpop_bound_access_tokens: true,
  };
}
