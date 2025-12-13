import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrentRound,
  setRoundSong,
  getDetailedVoteResults,
  getSongByTitleAndArtist,
  getAllProjects,
  type ProjectSlug
} from '@eptss/data-access';
import { getProjectAutomation } from '@eptss/project-config';
import { sendAdminSongAssignmentNotification } from '@eptss/email';

/**
 * API route to automatically assign the winning song to a round when voting closes
 * This should be called by a cron job (GitHub Actions or Vercel Cron)
 *
 * Logic:
 * 1. Loop through all active projects
 * 2. Check if song auto-assignment is enabled for each project
 * 3. Check if current round has started covering phase (now >= coveringBegins)
 * 4. Check if round already has a song assigned
 * 5. If not, get vote results and assign the highest-voted song
 * 6. Tie-breaking: highest average, then fewest 1-star votes
 * 7. Send admin notification email
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the request is authorized
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken) {
      console.error('[assign-round-song] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${expectedToken}`) {
      console.warn('[assign-round-song] Unauthorized request attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all active projects
    const allProjects = await getAllProjects();
    const activeProjects = allProjects.filter(p => p.isActive);

    console.log(`[assign-round-song] Processing ${activeProjects.length} active project(s)`);

    const projectResults = [];
    let totalSongsAssigned = 0;
    const now = new Date();

    // Loop through each project
    for (const project of activeProjects) {
      try {
        // Check if song auto-assignment is enabled for this project
        const automation = await getProjectAutomation(project.slug as ProjectSlug);

        if (!automation.enableSongAssignment) {
          console.log(`[assign-round-song] Song auto-assignment disabled for project: ${project.slug}`);
          projectResults.push({
            project: project.slug,
            skipped: true,
            reason: 'Song auto-assignment disabled'
          });
          continue;
        }

        console.log(`[assign-round-song] [${project.slug}] Processing project`);

        // Get the current round
        const currentRoundResult = await getCurrentRound(project.id);

        if (currentRoundResult.status !== 'success') {
          console.log(`[assign-round-song] [${project.slug}] No current round found`);
          projectResults.push({
            project: project.slug,
            skipped: true,
            reason: 'No current round found'
          });
          continue;
        }

        const round = currentRoundResult.data;

        // Check if we've reached the covering phase
        const hasReachedCoveringPhase = now >= round.coveringBegins;

        if (!hasReachedCoveringPhase) {
          console.log(`[assign-round-song] [${project.slug}] Round ${round.roundId} (${round.slug}) has not reached covering phase yet`);
          projectResults.push({
            project: project.slug,
            action: 'none',
            reason: 'Round has not reached covering phase yet',
            roundPhase: {
              coveringBegins: round.coveringBegins.toISOString(),
              now: now.toISOString()
            }
          });
          continue;
        }

        // Check if round already has a song assigned
        if (round.song.title && round.song.artist) {
          console.log(`[assign-round-song] [${project.slug}] Round ${round.roundId} (${round.slug}) already has song assigned: ${round.song.title} - ${round.song.artist}`);
          projectResults.push({
            project: project.slug,
            action: 'none',
            reason: 'Round already has song assigned',
            assignedSong: round.song
          });
          continue;
        }

        // Get detailed vote results for this round (includes 1-star counts)
        const voteResults = await getDetailedVoteResults(round.roundId);

        if (voteResults.length === 0) {
          console.warn(`[assign-round-song] [${project.slug}] No votes found for round ${round.roundId} (${round.slug})`);
          projectResults.push({
            project: project.slug,
            action: 'none',
            reason: 'No votes found for round'
          });
          continue;
        }

        // Find the winning song
        // Tie-breaking: highest average, then fewest 1-star votes
        const sortedResults = [...voteResults].sort((a, b) => {
          // First, sort by average (descending)
          if (b.average !== a.average) {
            return b.average - a.average;
          }
          // If averages are equal, sort by fewest 1-star votes (ascending)
          return a.oneStarCount - b.oneStarCount;
        });

        const winningSong = sortedResults[0];

        console.log(`[assign-round-song] [${project.slug}] Winning song for round ${round.roundId} (${round.slug}): ${winningSong.title} - ${winningSong.artist} (avg: ${winningSong.average}, votes: ${winningSong.votesCount}, 1-star: ${winningSong.oneStarCount})`);

        // Find the song ID in the database
        const songId = await getSongByTitleAndArtist(winningSong.title, winningSong.artist);

        if (!songId) {
          console.error(`[assign-round-song] [${project.slug}] Song not found in database: ${winningSong.title} - ${winningSong.artist}`);
          projectResults.push({
            project: project.slug,
            error: 'Winning song not found in database',
            winningSong
          });
          continue;
        }

        // Assign the song to the round
        const setResult = await setRoundSong(round.roundId, songId);

        if (setResult.status !== 'success') {
          console.error(`[assign-round-song] [${project.slug}] Failed to set song for round ${round.roundId}:`, setResult.message);
          projectResults.push({
            project: project.slug,
            error: setResult.message || 'Failed to assign song to round'
          });
          continue;
        }

        console.log(`[assign-round-song] [${project.slug}] Successfully assigned song to round ${round.roundId} (${round.slug})`);
        totalSongsAssigned++;

        // Send admin notification email
        try {
          const emailResult = await sendAdminSongAssignmentNotification({
            roundName: round.slug || `Round ${round.roundId}`,
            roundSlug: round.slug || round.roundId.toString(),
            assignedSong: {
              title: winningSong.title,
              artist: winningSong.artist,
              average: winningSong.average,
              votesCount: winningSong.votesCount,
              oneStarCount: winningSong.oneStarCount
            },
            allResults: sortedResults.map(r => ({
              title: r.title,
              artist: r.artist,
              average: r.average,
              votesCount: r.votesCount,
              oneStarCount: r.oneStarCount
            }))
          });

          if (emailResult.success) {
            console.log(`[assign-round-song] [${project.slug}] Admin notification email sent successfully`);
          } else {
            console.warn(`[assign-round-song] [${project.slug}] Failed to send admin notification email:`, emailResult.error);
          }
        } catch (error) {
          console.error(`[assign-round-song] [${project.slug}] Error sending admin notification email:`, error);
          // Don't fail the whole operation if email fails
        }

        projectResults.push({
          project: project.slug,
          action: 'assigned',
          round: {
            id: round.roundId,
            slug: round.slug
          },
          assignedSong: {
            title: winningSong.title,
            artist: winningSong.artist,
            average: winningSong.average,
            votesCount: winningSong.votesCount,
            oneStarCount: winningSong.oneStarCount
          }
        });

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[assign-round-song] Error processing project ${project.slug}:`, errorMsg);
        projectResults.push({
          project: project.slug,
          error: errorMsg
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Processed ${activeProjects.length} project(s), assigned ${totalSongsAssigned} song(s)`,
        projectResults
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[assign-round-song] Unexpected error:', error);
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
