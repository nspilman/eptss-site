/**
 * Round Endpoint Factory
 *
 * Creates standardized round API endpoint handlers with consistent:
 * - Cache headers (using phase-aware CachePatterns)
 * - Error handling
 * - Response formatting
 *
 * This pattern addresses the near-duplication between /api/round-info and /api/round/current
 * by extracting the common structure into a reusable factory.
 */

import { roundProvider, COVER_PROJECT_ID, CachePatterns, buildCacheHeader, type CachePattern } from "@eptss/core";
import { NextRequest, NextResponse } from "next/server";

/**
 * Phase-Aware Cache Duration
 *
 * Returns appropriate cache settings based on the round's current phase.
 * This addresses Christopher Alexander's observation that fixed durations
 * are a "compromise" - caching should adapt to the rhythm of the data.
 *
 * - celebration: Round is complete, data is essentially archival
 * - covering: Active phase but changes come from user submissions (low frequency)
 * - voting: Votes aggregate but individual votes don't need to be reflected immediately
 * - signups: Users are signing up, slightly fresher data is nice but not critical
 */
function getPhaseAwareCachePattern(round: any): CachePattern {
  const phase = round?.phase as string | undefined;

  switch (phase) {
    case 'celebration':
      // Round is complete - data is essentially archival
      return CachePatterns.archival;

    case 'covering':
      // Active but submission-based changes are user-triggered
      return {
        maxAge: 120, // 2 minutes
        staleWhileRevalidate: 300,
        scope: 'public',
        description: 'Covering phase - changes when users submit',
      };

    case 'voting':
      // Aggregate vote counts change but individual votes not critical
      return CachePatterns.roundPhase;

    case 'signups':
      // Active signups - slightly fresher to show accurate counts
      return {
        maxAge: 45,
        staleWhileRevalidate: 120,
        scope: 'public',
        description: 'Signup phase - frequent but not real-time changes',
      };

    default:
      // Fallback to standard roundPhase pattern
      return CachePatterns.roundPhase;
  }
}

/**
 * Parameters that can be extracted from a round endpoint request
 */
export interface RoundEndpointParams {
  /** Round slug to fetch a specific round */
  slug?: string;
  /** Project ID to use instead of default */
  projectId?: string;
}

export interface RoundEndpointOptions {
  /**
   * Whether to use phase-aware caching
   * When true, cache duration adapts based on round phase
   * @default true
   */
  phaseAwareCaching?: boolean;

  /**
   * Transform the round data before sending response
   */
  transform?: (round: any) => any;

  /**
   * Extract round query params from request
   * Return { slug } to fetch by slug, or {} for current round
   */
  getParams?: (request: NextRequest) => RoundEndpointParams;
}

/**
 * Creates a GET handler for round endpoints
 *
 * @example
 * // Simple current round endpoint with phase-aware caching
 * export const GET = createRoundHandler();
 *
 * @example
 * // Round by slug with transformation
 * export const GET = createRoundHandler({
 *   getParams: (req) => ({ slug: new URL(req.url).searchParams.get('slug') ?? undefined }),
 *   transform: (round) => ({ ...round, formattedDate: new Date(round.signupOpens).toLocaleDateString() }),
 * });
 */
export function createRoundHandler(options: RoundEndpointOptions = {}) {
  const {
    phaseAwareCaching = true,
    transform = (round) => round,
    getParams = (): RoundEndpointParams => ({}),
  } = options;

  return async function GET(request: NextRequest) {
    try {
      const params = getParams(request);
      const projectId = params.projectId || COVER_PROJECT_ID;

      const round = params.slug
        ? await roundProvider({ slug: params.slug, projectId })
        : await roundProvider({ projectId });

      const responseData = transform(round);

      // Determine cache pattern based on round phase if enabled
      const cachePattern = phaseAwareCaching
        ? getPhaseAwareCachePattern(round)
        : CachePatterns.roundPhase;

      return NextResponse.json(responseData, {
        headers: {
          'Cache-Control': buildCacheHeader(cachePattern),
        },
      });
    } catch (error) {
      console.error(`Error in round endpoint:`, error);
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 500 }
      );
    }
  };
}
