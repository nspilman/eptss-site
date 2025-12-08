import { NextRequest, NextResponse } from 'next/server';
import { getCurrentRound, getFutureRounds, createRound, getNextQuarterlyRounds, COVER_PROJECT_ID } from '@eptss/data-access';

/**
 * API route to automatically create future rounds
 * This should be called by a cron job (GitHub Actions) daily
 *
 * Query parameters:
 * - projectId: (required) The project ID to create rounds for
 *
 * Logic:
 * 1. Get the current round
 * 2. Count how many future rounds exist
 * 3. If less than 2 future rounds, create the missing ones
 * 4. Future rounds are quarterly and created without songs
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the request is authorized
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken) {
      console.error('[create-future-rounds] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${expectedToken}`) {
      console.warn('[create-future-rounds] Unauthorized request attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract projectId from query parameters
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      console.error('[create-future-rounds] projectId query parameter is required');
      return NextResponse.json(
        { error: 'projectId query parameter is required' },
        { status: 400 }
      );
    }

    console.log(`[create-future-rounds] Creating rounds for project: ${projectId}`);

    // Get the current round
    const currentRoundResult = await getCurrentRound(COVER_PROJECT_ID);
    
    if (currentRoundResult.status !== 'success') {
      console.log('[create-future-rounds] No current round found');
      return NextResponse.json(
        { 
          success: true, 
          message: 'No current round found - cannot create future rounds without a current round',
          action: 'none'
        },
        { status: 200 }
      );
    }

    const currentRound = currentRoundResult.data;
    console.log(`[create-future-rounds] Current round: ${currentRound.slug} (ID: ${currentRound.roundId})`);

    // Get existing future rounds
    const futureRoundsResult = await getFutureRounds(COVER_PROJECT_ID);
    const existingFutureRounds = futureRoundsResult.status === 'success' ? futureRoundsResult.data : [];
    
    console.log(`[create-future-rounds] Found ${existingFutureRounds.length} existing future rounds`);

    const REQUIRED_FUTURE_ROUNDS = 2;
    const roundsToCreate = REQUIRED_FUTURE_ROUNDS - existingFutureRounds.length;

    if (roundsToCreate <= 0) {
      console.log(`[create-future-rounds] Already have ${existingFutureRounds.length} future rounds - no action needed`);
      return NextResponse.json(
        { 
          success: true, 
          message: `Already have ${existingFutureRounds.length} future rounds`,
          action: 'none',
          existingFutureRounds: existingFutureRounds.map(r => ({
            id: r.roundId,
            slug: r.slug,
            signupOpens: r.signupOpens.toISOString(),
            votingOpens: r.votingOpens.toISOString(),
          }))
        },
        { status: 200 }
      );
    }

    console.log(`[create-future-rounds] Need to create ${roundsToCreate} future round(s)`);

    // Determine the starting point for new rounds
    // If there are existing future rounds, start from the last one
    // Otherwise, start from the current round
    let startFromDate: Date;
    if (existingFutureRounds.length > 0) {
      const lastFutureRound = existingFutureRounds[existingFutureRounds.length - 1];
      startFromDate = lastFutureRound.votingOpens; // Use voting opens as the reference point
      console.log(`[create-future-rounds] Starting from last future round: ${lastFutureRound.slug}`);
    } else {
      startFromDate = currentRound.votingOpens;
      console.log(`[create-future-rounds] Starting from current round: ${currentRound.slug}`);
    }

    // Generate the next quarterly rounds
    const newRoundDates = getNextQuarterlyRounds(startFromDate, roundsToCreate);
    
    const createdRounds = [];
    const errors = [];

    for (const roundDates of newRoundDates) {
      try {
        console.log(`[create-future-rounds] Creating round: ${roundDates.slug}`);
        
        const createResult = await createRound({
          projectId,
          slug: roundDates.slug,
          // No song for future rounds
          signupOpens: roundDates.signupOpens,
          votingOpens: roundDates.votingOpens,
          coveringBegins: roundDates.coveringBegins,
          coversDue: roundDates.coversDue,
          listeningParty: roundDates.listeningParty,
        });

        if (createResult.status === 'success') {
          console.log(`[create-future-rounds] Successfully created round: ${roundDates.slug}`);
          createdRounds.push({
            slug: roundDates.slug,
            id: createResult.data.roundId,
            signupOpens: roundDates.signupOpens.toISOString(),
            votingOpens: roundDates.votingOpens.toISOString(),
            coveringBegins: roundDates.coveringBegins.toISOString(),
            coversDue: roundDates.coversDue.toISOString(),
            listeningParty: roundDates.listeningParty.toISOString(),
          });
        } else {
          console.error(`[create-future-rounds] Failed to create round ${roundDates.slug}:`, createResult.message);
          errors.push({
            slug: roundDates.slug,
            error: createResult.message
          });
        }
      } catch (error) {
        console.error(`[create-future-rounds] Error creating round ${roundDates.slug}:`, error);
        errors.push({
          slug: roundDates.slug,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    if (createdRounds.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to create any future rounds',
          errors
        },
        { status: 500 }
      );
    }

    console.log(`[create-future-rounds] Successfully created ${createdRounds.length} round(s)`);

    return NextResponse.json(
      { 
        success: true, 
        message: `Successfully created ${createdRounds.length} future round(s)`,
        action: 'created',
        createdRounds,
        ...(errors.length > 0 && { errors })
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[create-future-rounds] Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Optional: Support GET for manual testing (only in development)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'GET method not allowed in production' },
      { status: 405 }
    );
  }

  // In development, allow GET requests for testing
  return POST(request);
}
