import { createRoundHandler } from "@/app/api/_shared/roundEndpoint";

/**
 * GET /api/round/current
 *
 * Returns the current round for the cover project.
 * This is a convenience endpoint - equivalent to /api/round-info with no slug.
 *
 * Uses the unified round endpoint factory for consistent caching and error handling.
 */
export const GET = createRoundHandler({
  // Uses default roundPhase caching
  // Uses default COVER_PROJECT_ID
  // No transformation needed
});
