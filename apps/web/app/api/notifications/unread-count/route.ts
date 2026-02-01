import { NextResponse } from "next/server";
import { getAuthUser } from "@eptss/core/utils/supabase/server";
import { getUnreadCount } from "@eptss/core/services/notificationService";
import { CachePatterns, getCacheHeaders } from "@eptss/core";

export const dynamic = "force-dynamic";

// GET /api/notifications/unread-count - Get unread count
export async function GET() {
  try {
    const { userId } = await getAuthUser();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const count = await getUnreadCount(userId);

    return NextResponse.json(
      { count },
      { headers: getCacheHeaders(CachePatterns.userAction) }
    );
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}
