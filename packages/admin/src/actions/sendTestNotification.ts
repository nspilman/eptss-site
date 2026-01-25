"use server";

import { getAuthUser } from "@eptss/core/utils/supabase/server";
import { createNotification } from "@eptss/core/services/notificationService";

export async function sendTestNotification() {
  try {
    const { userId, email } = await getAuthUser();

    if (!userId) {
      return {
        success: false,
        error: "No user ID found for current user",
      };
    }

    const notification = await createNotification({
      userId: userId,
      type: "test_notification",
      title: "Test Notification",
      message: `This is a test notification sent to ${email}. If you can see this, the notification system is working correctly!`,
      metadata: {
        timestamp: new Date().toISOString(),
        source: "admin_tools",
      },
    });

    if (notification) {
      return {
        success: true,
        message: `Test notification created for ${email}`,
      };
    } else {
      return {
        success: false,
        error: "Failed to create notification",
      };
    }
  } catch (error) {
    console.error("Error sending test notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
