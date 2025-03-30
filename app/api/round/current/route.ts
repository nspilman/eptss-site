import { roundProvider } from "@/providers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get the current round
    const round = await roundProvider();
    return NextResponse.json(round);
  } catch (error) {
    console.error('Error fetching current round:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
