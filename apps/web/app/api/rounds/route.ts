import { getCurrentAndPastRounds, COVER_PROJECT_ID } from "@eptss/data-access";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeCurrentRound = searchParams.get('excludeCurrentRound') === 'true';
    const projectId = searchParams.get('projectId') || COVER_PROJECT_ID;

    // Get all rounds for the specified project
    const roundsResult = await getCurrentAndPastRounds(projectId);
    
    if (roundsResult.status !== 'success') {
      console.error('Failed to fetch rounds:', roundsResult);
      return NextResponse.json(
        { error: 'Failed to fetch rounds', details: roundsResult.status === 'error' ? roundsResult.error : 'No data' },
        { status: 500 }
      );
    }
    
    let rounds = roundsResult.data;
    
    // If excludeCurrentRound is true, remove the most recent round
    if (excludeCurrentRound && rounds.length > 0) {
      rounds = rounds.slice(1);
    }
    
    // Format rounds for the client component
    const formattedRounds = rounds.map((round) => {
      // Ensure song data is in the format expected by ClientRoundsDisplay
      if (round.song?.title && round.song?.artist) {
        return {
          ...round,
          title: round.song.title,
          artist: round.song.artist
        };
      }
      
      return round;
    });
    
    return NextResponse.json({
      roundContent: formattedRounds
    });
  } catch (error) {
    console.error('Error fetching rounds:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
