import { NextRequest, NextResponse } from "next/server";
import { db } from "@eptss/data-access/db";
import { roundMetadata } from "@eptss/data-access/db/schema";
import { eq } from "drizzle-orm";

/**
 * PATCH /api/admin/rounds/[roundId]
 * Updates a round's dates
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
) {
  try {
    const { roundId } = await params;
    const updates = await request.json();

    const roundIdNum = parseInt(roundId, 10);
    if (isNaN(roundIdNum)) {
      return NextResponse.json(
        { error: "Invalid round ID" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: Record<string, Date | null> = {};
    if (updates.signupOpens) updateData.signupOpens = new Date(updates.signupOpens);
    if (updates.votingOpens) updateData.votingOpens = new Date(updates.votingOpens);
    if (updates.coveringBegins) updateData.coveringBegins = new Date(updates.coveringBegins);
    if (updates.coversDue) updateData.coversDue = new Date(updates.coversDue);
    if (updates.listeningParty) updateData.listeningParty = new Date(updates.listeningParty);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid date fields provided" },
        { status: 400 }
      );
    }

    await db
      .update(roundMetadata)
      .set(updateData)
      .where(eq(roundMetadata.id, roundIdNum));

    return NextResponse.json({
      success: true,
      message: "Round updated successfully",
      roundId: roundIdNum,
      updates: updateData,
    });
  } catch (error) {
    console.error("Failed to update round:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update round",
      },
      { status: 500 }
    );
  }
}
