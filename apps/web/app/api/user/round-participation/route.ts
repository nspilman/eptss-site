import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@eptss/core/utils/supabase/server";
import { getRoundDataForUser } from "@eptss/core/services/userParticipationService";

/**
 * GET /api/user/round-participation?roundId=123
 *
 * Returns the current user's participation status for a specific round.
 * Used for client-side hydration of user-specific state on static pages.
 *
 * Returns:
 * - hasVoted: boolean
 * - hasSignedUp: boolean
 * - hasSubmitted: boolean
 * - isAuthenticated: boolean
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roundIdParam = searchParams.get('roundId');

    if (!roundIdParam) {
      return NextResponse.json(
        { error: 'roundId is required' },
        { status: 400 }
      );
    }

    const roundId = parseInt(roundIdParam, 10);
    if (isNaN(roundId)) {
      return NextResponse.json(
        { error: 'roundId must be a number' },
        { status: 400 }
      );
    }

    const { userId } = await getAuthUser();

    // If no user is logged in, return unauthenticated state
    if (!userId) {
      return NextResponse.json({
        isAuthenticated: false,
        hasVoted: false,
        hasSignedUp: false,
        hasSubmitted: false,
      });
    }

    // Get user's participation data for this round
    const roundDetails = await getRoundDataForUser(roundId);

    return NextResponse.json({
      isAuthenticated: true,
      hasVoted: roundDetails?.hasVoted ?? false,
      hasSignedUp: roundDetails?.hasSignedUp ?? false,
      hasSubmitted: roundDetails?.hasSubmitted ?? false,
    });
  } catch (error) {
    console.error('Error fetching user round participation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participation status' },
      { status: 500 }
    );
  }
}
