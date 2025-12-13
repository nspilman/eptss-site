import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrentRound,
  getFutureRounds,
  createRound,
  getNextQuarterlyRounds,
  getAllProjects,
  type ProjectSlug
} from '@eptss/data-access';
import { getProjectAutomation } from '@eptss/project-config';

/**
 * API route to automatically create future rounds
 * This should be called by a cron job (GitHub Actions) daily
 *
 * Logic:
 * 1. Loop through all active projects
 * 2. Check if round auto-creation is enabled for each project
 * 3. Get the current round for each enabled project
 * 4. Count how many future rounds exist
 * 5. If less than 2 future rounds, create the missing ones
 * 6. Future rounds are quarterly and created without songs
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

    // Get all active projects
    const allProjects = await getAllProjects();
    const activeProjects = allProjects.filter(p => p.isActive);

    console.log(`[create-future-rounds] Processing ${activeProjects.length} active project(s)`);

    const projectResults = [];
    let totalRoundsCreated = 0;

    // Loop through each project
    for (const project of activeProjects) {
      try {
        // Check if round auto-creation is enabled for this project
        const automation = await getProjectAutomation(project.slug as ProjectSlug);

        if (!automation.enableRoundAutoCreation) {
          console.log(`[create-future-rounds] Round auto-creation disabled for project: ${project.slug}`);
          projectResults.push({
            project: project.slug,
            skipped: true,
            reason: 'Round auto-creation disabled'
          });
          continue;
        }

        console.log(`[create-future-rounds] [${project.slug}] Processing project`);

        // Get the current round
        const currentRoundResult = await getCurrentRound(project.id);

        if (currentRoundResult.status !== 'success') {
          console.log(`[create-future-rounds] [${project.slug}] No current round found`);
          projectResults.push({
            project: project.slug,
            skipped: true,
            reason: 'No current round - cannot create future rounds without a current round'
          });
          continue;
        }

        const currentRound = currentRoundResult.data;
        console.log(`[create-future-rounds] [${project.slug}] Current round: ${currentRound.slug} (ID: ${currentRound.roundId})`);

        // Get existing future rounds
        const futureRoundsResult = await getFutureRounds(project.id);
        const existingFutureRounds = futureRoundsResult.status === 'success' ? futureRoundsResult.data : [];

        console.log(`[create-future-rounds] [${project.slug}] Found ${existingFutureRounds.length} existing future rounds`);

        const REQUIRED_FUTURE_ROUNDS = 2;
        const roundsToCreate = REQUIRED_FUTURE_ROUNDS - existingFutureRounds.length;

        if (roundsToCreate <= 0) {
          console.log(`[create-future-rounds] [${project.slug}] Already have ${existingFutureRounds.length} future rounds - no action needed`);
          projectResults.push({
            project: project.slug,
            action: 'none',
            message: `Already have ${existingFutureRounds.length} future rounds`,
            existingFutureRounds: existingFutureRounds.map(r => ({
              id: r.roundId,
              slug: r.slug,
              signupOpens: r.signupOpens.toISOString(),
              votingOpens: r.votingOpens.toISOString(),
            }))
          });
          continue;
        }

        console.log(`[create-future-rounds] [${project.slug}] Need to create ${roundsToCreate} future round(s)`);

        // Determine the starting point for new rounds
        // If there are existing future rounds, start from the last one
        // Otherwise, start from the current round
        let startFromDate: Date;
        if (existingFutureRounds.length > 0) {
          const lastFutureRound = existingFutureRounds[existingFutureRounds.length - 1];
          startFromDate = lastFutureRound.votingOpens; // Use voting opens as the reference point
          console.log(`[create-future-rounds] [${project.slug}] Starting from last future round: ${lastFutureRound.slug}`);
        } else {
          startFromDate = currentRound.votingOpens;
          console.log(`[create-future-rounds] [${project.slug}] Starting from current round: ${currentRound.slug}`);
        }

        // Generate the next quarterly rounds
        const newRoundDates = getNextQuarterlyRounds(startFromDate, roundsToCreate);

        const createdRounds = [];
        const errors = [];

        for (const roundDates of newRoundDates) {
          try {
            console.log(`[create-future-rounds] [${project.slug}] Creating round: ${roundDates.slug}`);

            const createResult = await createRound({
              projectId: project.id,
              slug: roundDates.slug,
              // No song for future rounds
              signupOpens: roundDates.signupOpens,
              votingOpens: roundDates.votingOpens,
              coveringBegins: roundDates.coveringBegins,
              coversDue: roundDates.coversDue,
              listeningParty: roundDates.listeningParty,
            });

            if (createResult.status === 'success') {
              console.log(`[create-future-rounds] [${project.slug}] Successfully created round: ${roundDates.slug}`);
              createdRounds.push({
                slug: roundDates.slug,
                id: createResult.data.roundId,
                signupOpens: roundDates.signupOpens.toISOString(),
                votingOpens: roundDates.votingOpens.toISOString(),
                coveringBegins: roundDates.coveringBegins.toISOString(),
                coversDue: roundDates.coversDue.toISOString(),
                listeningParty: roundDates.listeningParty.toISOString(),
              });
              totalRoundsCreated++;
            } else {
              console.error(`[create-future-rounds] [${project.slug}] Failed to create round ${roundDates.slug}:`, createResult.message);
              errors.push({
                slug: roundDates.slug,
                error: createResult.message
              });
            }
          } catch (error) {
            console.error(`[create-future-rounds] [${project.slug}] Error creating round ${roundDates.slug}:`, error);
            errors.push({
              slug: roundDates.slug,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }

        console.log(`[create-future-rounds] [${project.slug}] Successfully created ${createdRounds.length} round(s)`);

        projectResults.push({
          project: project.slug,
          action: 'created',
          createdRounds,
          ...(errors.length > 0 && { errors })
        });

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[create-future-rounds] Error processing project ${project.slug}:`, errorMsg);
        projectResults.push({
          project: project.slug,
          error: errorMsg
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Processed ${activeProjects.length} project(s), created ${totalRoundsCreated} total round(s)`,
        projectResults
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
