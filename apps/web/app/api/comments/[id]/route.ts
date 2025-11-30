import { NextRequest, NextResponse } from "next/server";
import { getCommentWithAssociation } from "@eptss/data-access/services/commentService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }

    const result = await getCommentWithAssociation(commentId);

    if (!result) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userId: result.comment.userId,
      userContentId: result.userContentId,
      roundId: result.roundId,
    });
  } catch (error) {
    console.error("Error fetching comment:", error);
    return NextResponse.json(
      { error: "Failed to fetch comment" },
      { status: 500 }
    );
  }
}
