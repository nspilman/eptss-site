/**
 * AT URI parsing — the one home for pulling a repo DID or rkey out of an
 * `at://<did>/<collection>/<rkey>` string. This shape was inlined in a handful of
 * places; a single small center keeps it honest and testable.
 */

/** The DID authority of an `at://` URI — the repo it lives in — or null. */
export function atUriDid(uri: string | null | undefined): string | null {
  return uri?.match(/^at:\/\/([^/]+)\//)?.[1] ?? null;
}

/** The rkey (last path segment) of an `at://` URI. */
export function atUriRkey(uri: string): string {
  return uri.split("/").pop() ?? uri;
}
