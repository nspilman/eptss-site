import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrentRound,
  setRoundSong,
  getDetailedVoteResults,
  getSongByTitleAndArtist,
  COVER_PROJECT_ID
} from '@eptss/data-access';
import { sendAdminSongAssignmentNotification } from '@eptss/email';

/**
 * API route to automatically assign the winning song to a round when voting closes
 * This should be called by a cron job (GitHub Actions or Vercel Cron)
 * 
 * Logic:
 * 1. Check if current round has started covering phase (now >= coveringBegins)
 * 2. Check if round already has a song assigned
 * 3. If not, get vote results and assign the highest-voted song
 * 4. Tie-breaking: highest average, then fewest 1-star votes
 * 5. Log results (email notification removed for now)
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

    // Get the current round
    const currentRoundResult = await getCurrentRound(COVER_PROJECT_ID);
    
    if (currentRoundResult.status !== 'success') {
      console.log('[assign-round-song] No current round found');
      return NextResponse.json(
        { 
          success: true, 
          message: 'No current round found',
          action: 'none'
        },
        { status: 200 }
      );
    }

    const round = currentRoundResult.data;
    const now = new Date();

    // Check if we've reached the covering phase
    const hasReachedCoveringPhase = now >= round.coveringBegins;

    if (!hasReachedCoveringPhase) {
      console.log(`[assign-round-song] Round ${round.roundId} (${round.slug}) has not reached covering phase yet`);
      return NextResponse.json(
        { 
          success: true, 
          message: `Round ${round.slug} has not reached covering phase yet`,
          action: 'none',
          roundPhase: {
            coveringBegins: round.coveringBegins.toISOString(),
            now: now.toISOString()
          }
        },
        { status: 200 }
      );
    }

    // Check if round already has a song assigned
    if (round.song.title && round.song.artist) {
      console.log(`[assign-round-song] Round ${round.roundId} (${round.slug}) already has song assigned: ${round.song.title} - ${round.song.artist}`);
      return NextResponse.json(
        { 
          success: true, 
          message: `Round ${round.slug} already has song assigned`,
          action: 'none',
          assignedSong: round.song
        },
        { status: 200 }
      );
    }

    // Get detailed vote results for this round (includes 1-star counts)
    const voteResults = await getDetailedVoteResults(round.roundId);

    if (voteResults.length === 0) {
      console.warn(`[assign-round-song] No votes found for round ${round.roundId} (${round.slug})`);
      return NextResponse.json(
        { 
          success: false, 
          message: `No votes found for round ${round.slug}`,
          action: 'none'
        },
        { status: 200 }
      );
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

    console.log(`[assign-round-song] Winning song for round ${round.roundId} (${round.slug}): ${winningSong.title} - ${winningSong.artist} (avg: ${winningSong.average}, votes: ${winningSong.votesCount}, 1-star: ${winningSong.oneStarCount})`);

    // Find the song ID in the database
    const songId = await getSongByTitleAndArtist(winningSong.title, winningSong.artist);

    if (!songId) {
      console.error(`[assign-round-song] Song not found in database: ${winningSong.title} - ${winningSong.artist}`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Winning song not found in database',
          winningSong
        },
        { status: 500 }
      );
    }

    // Assign the song to the round
    const setResult = await setRoundSong(round.roundId, songId);

    if (setResult.status !== 'success') {
      console.error(`[assign-round-song] Failed to set song for round ${round.roundId}:`, setResult.message);
      return NextResponse.json(
        { 
          success: false, 
          error: setResult.message || 'Failed to assign song to round'
        },
        { status: 500 }
      );
    }

    console.log(`[assign-round-song] Successfully assigned song to round ${round.roundId} (${round.slug})`);

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
        console.log(`[assign-round-song] Admin notification email sent successfully`);
      } else {
        console.warn(`[assign-round-song] Failed to send admin notification email:`, emailResult.error);
      }
    } catch (error) {
      console.error(`[assign-round-song] Error sending admin notification email:`, error);
      // Don't fail the whole operation if email fails
    }

    return NextResponse.json(
      { 
        success: true, 
        message: `Successfully assigned song to round ${round.slug}`,
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
