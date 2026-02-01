import { roundProvider, COVER_PROJECT_ID, CachePatterns, getCacheHeaders } from "@eptss/core";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get the current round
    const round = await roundProvider({ projectId: COVER_PROJECT_ID });
    return NextResponse.json(round, {
      headers: getCacheHeaders(CachePatterns.roundPhase),
    });
  } catch (error) {
    console.error('Error fetching current round:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
