import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@eptss/data-access/utils/supabase/server";
import { deleteNotification } from "@eptss/data-access/services/notificationService";

export const dynamic = "force-dynamic";

// DELETE /api/notifications/:id - Delete notification
export async function DELETE(
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
    const success = await deleteNotification(notificationId, userId);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
