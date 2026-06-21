/**
 * The EPTSS backfill identity scheme — the ONE place it is encoded.
 *
 * Every backfilled record is keyed by its Postgres id, so the rkey is a stable,
 * derivable name and putRecord upserts instead of duplicating:
 *
 *   round      → at.atjam.round/eptss-r<id>
 *   submission → at.atjam.submission/eptss-sub<id>
 *   signup     → at.atjam.signup/eptss-sig<id>
 *
 * The writer (backfill), the reader (off-network reads), and the claim flow all
 * import these helpers, so the encode and decode cannot drift apart. If they
 * did, attribution would break silently — the reader would fail to recover the
 * Postgres id a record was written under. The round-trip is pinned by
 * eptss-rkey.test.ts.
 */

/** rkey a backfilled submission is stored under, from its Postgres submissions.id. */
export function eptssSubmissionRkey(submissionId: number): string {
  return `eptss-sub${submissionId}`;
}

/** rkey a backfilled round is stored under, from its Postgres round_metadata.id. */
export function eptssRoundRkey(roundId: number): string {
  return `eptss-r${roundId}`;
}

/** rkey a migrated signup is stored under, from its Postgres sign_ups.id. */
export function eptssSignupRkey(signupId: number): string {
  return `eptss-sig${signupId}`;
}

/** Last path segment of an AT URI, or the input unchanged if it has no slash. */
function rkeyOf(uriOrRkey: string): string {
  return uriOrRkey.split("/").pop() ?? uriOrRkey;
}

/**
 * Recover the Postgres submissions.id from a backfilled submission's rkey or
 * full AT URI. Returns null when it isn't a backfilled submission key.
 */
export function eptssSubmissionId(submissionUriOrRkey: string): number | null {
  const m = /^eptss-sub(\d+)$/.exec(rkeyOf(submissionUriOrRkey));
  return m ? Number(m[1]) : null;
}

/**
 * Recover the Postgres round_metadata.id from a backfilled round's rkey or full
 * AT URI. Returns null when it isn't a backfilled round key.
 */
export function eptssRoundId(roundUriOrRkey: string): number | null {
  const m = /^eptss-r(\d+)$/.exec(rkeyOf(roundUriOrRkey));
  return m ? Number(m[1]) : null;
}

/**
 * Recover the Postgres sign_ups.id from a migrated signup's rkey or full AT URI.
 * Returns null when it isn't a migrated signup key.
 */
export function eptssSignupId(signupUriOrRkey: string): number | null {
  const m = /^eptss-sig(\d+)$/.exec(rkeyOf(signupUriOrRkey));
  return m ? Number(m[1]) : null;
}
