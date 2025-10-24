import { getCurrentAndPastRounds } from "@eptss/data-access";
import { db } from "@eptss/data-access/db";
import { songs, roundMetadata } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeCurrentRound = searchParams.get('excludeCurrentRound') === 'true';
    
    // Get all rounds
    const roundsResult = await getCurrentAndPastRounds();
    
    if (roundsResult.status !== 'success') {
      return NextResponse.json(
        { error: 'Failed to fetch rounds' },
        { status: 500 }
      );
    }
    
    let rounds = roundsResult.data;
    
    // If excludeCurrentRound is true, remove the most recent round
    if (excludeCurrentRound && rounds.length > 0) {
      rounds = rounds.slice(1);
    }
    
    // Ensure song data is populated for each round and format it for the client component
    const formattedRounds = await Promise.all(rounds.map(async (round) => {
      // If song data is missing, fetch it from the database
      if (!round.song?.title || !round.song?.artist) {
        // Query the song data for this round
        const songData = await db
          .select({
            title: songs.title,
            artist: songs.artist
          })
          .from(roundMetadata)
          .where(eq(roundMetadata.id, round.roundId))
          .leftJoin(songs, eq(roundMetadata.songId, songs.id));
          
        if (songData.length > 0 && songData[0].title && songData[0].artist) {
          // Return data in the format expected by ClientRoundsDisplay
          return {
            ...round,
            title: songData[0].title,
            artist: songData[0].artist,
            // Keep the song object for compatibility with other components
            song: {
              title: songData[0].title,
              artist: songData[0].artist
            }
          };
        }
      }
      
      // If we already have song data, ensure it's in the format expected by ClientRoundsDisplay
      if (round.song?.title && round.song?.artist) {
        return {
          ...round,
          title: round.song.title,
          artist: round.song.artist
        };
      }
      
      return round;
    }));
    
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
