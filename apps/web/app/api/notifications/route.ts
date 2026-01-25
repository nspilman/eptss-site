import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@eptss/core/utils/supabase/server";
import {
  getUserNotifications,
  markAllAsRead,
} from "@eptss/core/services/notificationService";

export const dynamic = "force-dynamic";

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuthUser();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const notifications = await getUserNotifications(userId, {
      unreadOnly,
      limit,
      offset,
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications/read-all - Mark all as read
export async function POST() {
  try {
    const { userId } = await getAuthUser();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const count = await markAllAsRead(userId);

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Error marking all as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all as read" },
      { status: 500 }
    );
  }
}
