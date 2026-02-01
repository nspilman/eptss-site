/**
 * Cache Pattern Language
 *
 * A vocabulary for caching that ties durations to the NATURE of data,
 * not arbitrary numbers. Each pattern documents WHY this duration makes sense.
 *
 * Inspired by Christopher Alexander's pattern languages - each pattern
 * represents a recurring solution that balances forces in a context.
 *
 * @example
 * ```typescript
 * import { CachePatterns, buildCacheHeader } from '@eptss/core/cache/patterns';
 *
 * return NextResponse.json(data, {
 *   headers: { 'Cache-Control': buildCacheHeader(CachePatterns.roundPhase) }
 * });
 * ```
 */

export interface CachePattern {
  /** Maximum time (seconds) content is considered fresh */
  maxAge: number;
  /** Time (seconds) stale content can be served while revalidating */
  staleWhileRevalidate: number;
  /** Whether this data is user-specific (private) or shared (public) */
  scope: 'private' | 'public';
  /** Human-readable description of when to use this pattern */
  description: string;
}

/**
 * Cache patterns organized by the nature of the data they protect.
 *
 * The durations are derived from understanding how the data changes:
 * - User actions: seconds to minutes
 * - Round phases: hours to days
 * - Historical data: essentially immutable
 * - Configuration: admin-controlled, rare changes
 */
export const CachePatterns = {
  /**
   * User-specific data that changes with user action
   *
   * Examples: notifications, unread counts, user preferences
   *
   * Rationale: Users expect near-immediate feedback on their actions,
   * but can tolerate 30s of staleness for passive displays like
   * notification badges. Using 'private' scope ensures user data
   * isn't cached at the CDN level.
   */
  userAction: {
    maxAge: 30,
    staleWhileRevalidate: 60,
    scope: 'private' as const,
    description: 'User-specific data that changes with user actions',
  },

  /**
   * Round/phase data that changes on schedule
   *
   * Examples: current round info, phase status, deadlines, participant counts
   *
   * Rationale: Round phases change every few days to weeks. A 60-second
   * freshness window is imperceptible to users while dramatically reducing
   * database load. Phase transitions are scheduled, not real-time critical.
   */
  roundPhase: {
    maxAge: 60,
    staleWhileRevalidate: 300,
    scope: 'public' as const,
    description: 'Round and phase data that changes on schedule',
  },

  /**
   * Historical/archival data that rarely changes
   *
   * Examples: past rounds, completed submissions, round archives, playlists
   *
   * Rationale: Once a round completes, its data is essentially immutable.
   * The only changes would be corrections or additions, which are rare
   * and can tolerate a 5-10 minute delay in visibility.
   */
  archival: {
    maxAge: 300,
    staleWhileRevalidate: 600,
    scope: 'public' as const,
    description: 'Historical data that rarely changes after creation',
  },

  /**
   * Configuration data that changes only through admin action
   *
   * Examples: project config, terminology, business rules, feature flags
   *
   * Rationale: Admins understand there may be a delay when they change
   * configuration. These changes are deliberate and rare. If immediate
   * visibility is needed, cache can be manually purged.
   */
  configuration: {
    maxAge: 600,
    staleWhileRevalidate: 1800,
    scope: 'public' as const,
    description: 'Configuration that changes only through admin action',
  },

  /**
   * Static assets and content that almost never changes
   *
   * Examples: about page content, FAQ, static images metadata
   *
   * Rationale: This content is essentially permanent. Hour-long caching
   * is safe and significantly reduces origin load for popular pages.
   */
  static: {
    maxAge: 3600,
    staleWhileRevalidate: 7200,
    scope: 'public' as const,
    description: 'Static content that almost never changes',
  },
} as const;

/**
 * Type for cache pattern keys
 */
export type CachePatternName = keyof typeof CachePatterns;

/**
 * Builds a Cache-Control header string from a pattern
 *
 * For private (user-specific) data:
 *   "private, max-age=30, stale-while-revalidate=60"
 *
 * For public (shared) data:
 *   "public, s-maxage=60, stale-while-revalidate=300"
 *
 * Note: s-maxage is used for public data to control CDN caching
 * while allowing browsers to use their own heuristics.
 */
export function buildCacheHeader(pattern: CachePattern): string {
  if (pattern.scope === 'private') {
    return `private, max-age=${pattern.maxAge}, stale-while-revalidate=${pattern.staleWhileRevalidate}`;
  }
  return `public, s-maxage=${pattern.maxAge}, stale-while-revalidate=${pattern.staleWhileRevalidate}`;
}

/**
 * Builds cache headers object for use with NextResponse
 *
 * @example
 * ```typescript
 * return NextResponse.json(data, {
 *   headers: getCacheHeaders(CachePatterns.roundPhase)
 * });
 * ```
 */
export function getCacheHeaders(pattern: CachePattern): { 'Cache-Control': string } {
  return {
    'Cache-Control': buildCacheHeader(pattern),
  };
}
