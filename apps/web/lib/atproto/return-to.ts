/**
 * The one rule for where the OAuth link flow may land afterward — shared by the
 * link-initiate route (which stashes returnTo in OAuth app-state) and the callback
 * (which redirects to it), so the two ends of the dance can't drift.
 */

/** Where the flow lands when no (valid) returnTo was carried. */
export const DEFAULT_RETURN_TO = "/dashboard/profile";

/**
 * Accept only a same-origin relative path — never a protocol-relative ("//host")
 * or absolute URL — so a returnTo can't become an open redirect. Anything else
 * yields undefined; callers choose their fallback.
 */
export function sanitizeReturnTo(raw: unknown): string | undefined {
  return typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//")
    ? raw
    : undefined;
}
