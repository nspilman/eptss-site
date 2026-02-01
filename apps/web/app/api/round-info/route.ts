import { createRoundHandler } from "@/app/api/_shared/roundEndpoint";

/**
 * GET /api/round-info
 *
 * Returns round information for the cover project.
 * - With ?slug=xxx: Returns the specific round
 * - Without slug: Returns the current round
 *
 * Uses the unified round endpoint factory for consistent caching and error handling.
 */
export const GET = createRoundHandler({
  getParams: (request) => {
    const slug = new URL(request.url).searchParams.get('slug') ?? undefined;
    return { slug };
  },
});