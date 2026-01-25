import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@eptss/core/utils/supabase/server";
import { markAsRead } from "@eptss/core/services/notificationService";

export const dynamic = "force-dynamic";

// POST /api/notifications/:id/read - Mark notification as read
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getAuthUser();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const notificationId = id;
    const success = await markAsRead(notificationId, userId);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Notification not found or already read" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
