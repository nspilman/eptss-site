"use server";

import { db } from "../db";
import {
  notifications,
  notificationEmailsSent,
  users,
  userPrivacySettings,
} from "../db/schema";
import { eq, and, lt, gt, isNull, or, desc } from "drizzle-orm";
import { logger } from "@eptss/logger/server";
import {
  sendNewNotificationsEmail,
  sendOutstandingNotificationsEmail,
  type EmailResult,
} from "@eptss/email";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://eptss.com";
const OUTSTANDING_THRESHOLD_DAYS = 3;
const NEW_EMAIL_COOLDOWN_DAYS = 7; // Changed from 24 hours to 7 days
const REMINDER_COOLDOWN_DAYS = 7; // Changed from 3 days to 7 days

interface NotificationEmailResult {
  success: boolean;
  emailsSent: number;
  errors: string[];
}

/**
 * Process all users and send notification emails where appropriate
 * Called by the cron job every 8 hours
 */
export async function processNotificationEmails(): Promise<NotificationEmailResult> {
  const result: NotificationEmailResult = {
    success: true,
    emailsSent: 0,
    errors: [],
  };

  try {
    // Get all users with email notifications enabled
    const usersWithEmailsEnabled = await getUsersWithEmailsEnabled();

    logger.info("Processing notification emails", {
      userCount: usersWithEmailsEnabled.length,
    });

    for (const user of usersWithEmailsEnabled) {
      try {
        // Check for new notifications
        const shouldSendNew = await shouldSendNewNotificationsEmail(user.userid);
        if (shouldSendNew) {
          const emailResult = await sendNewNotificationsEmailForUser(user.userid);
          if (emailResult.success) {
            result.emailsSent++;
          } else {
            result.errors.push(`Failed to send new notifications email to ${user.email}: ${emailResult.error}`);
          }
          continue; // Don't send reminder if we just sent a new notification email
        }

        // Check for outstanding notifications
        const shouldSendReminder = await shouldSendOutstandingReminder(user.userid);
        if (shouldSendReminder) {
          const emailResult = await sendOutstandingReminderForUser(user.userid);
          if (emailResult.success) {
            result.emailsSent++;
          } else {
            result.errors.push(`Failed to send reminder email to ${user.email}: ${emailResult.error}`);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        result.errors.push(`Error processing user ${user.userid}: ${errorMsg}`);
        logger.error("Error processing notification emails for user", {
          userId: user.userid,
          error,
        });
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
    }

    logger.info("Notification email processing complete", {
      emailsSent: result.emailsSent,
      errorCount: result.errors.length,
    });

    return result;
  } catch (error) {
    logger.error("Fatal error processing notification emails", { error });
    return {
      success: false,
      emailsSent: result.emailsSent,
      errors: [...result.errors, error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

/**
 * Get all users who have notification emails enabled
 */
async function getUsersWithEmailsEnabled() {
  try {
    const result = await db
      .select({
        userid: users.userid,
        email: users.email,
        username: users.username,
        publicDisplayName: users.publicDisplayName,
      })
      .from(users)
      .leftJoin(userPrivacySettings, eq(users.userid, userPrivacySettings.userId))
      .where(
        or(
          // User has explicitly enabled emails
          eq(userPrivacySettings.notificationEmailsEnabled, true),
          // User has no privacy settings row (default is enabled)
          isNull(userPrivacySettings.id)
        )
      );

    return result;
  } catch (error) {
    logger.error("Failed to get users with emails enabled", { error });
    return [];
  }
}

/**
 * Check if we should send a "new notifications" email to a user
 * Criteria:
 * - User has unread notifications created AFTER the last notification email was sent
 */
async function shouldSendNewNotificationsEmail(userId: string): Promise<boolean> {
  try {
    // Get the most recent successful notification email sent to this user
    const recentNewEmail = await db
      .select()
      .from(notificationEmailsSent)
      .where(
        and(
          eq(notificationEmailsSent.userId, userId),
          eq(notificationEmailsSent.emailType, "new_notifications"),
          eq(notificationEmailsSent.success, true)
        )
      )
      .orderBy(desc(notificationEmailsSent.sentAt))
      .limit(1);

    // Check for unread notifications created AFTER the last email
    if (recentNewEmail.length > 0) {
      // Only consider notifications created after the last email was sent
      const lastEmailSentAt = new Date(recentNewEmail[0].sentAt);

      const newUnreadNotifications = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false),
            eq(notifications.isDeleted, false),
            gt(notifications.createdAt, lastEmailSentAt) // Only NEW notifications
          )
        )
        .limit(1);

      return newUnreadNotifications.length > 0;
    } else {
      // No previous email - check if there are any unread notifications
      const unreadNotifications = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false),
            eq(notifications.isDeleted, false)
          )
        )
        .limit(1);

      return unreadNotifications.length > 0;
    }
  } catch (error) {
    logger.error("Error checking if should send new notifications email", {
      userId,
      error,
    });
    return false;
  }
}

/**
 * Check if we should send an "outstanding reminder" email to a user
 * Criteria:
 * - User has unread notifications older than OUTSTANDING_THRESHOLD_DAYS
 * - Haven't sent a reminder in the last REMINDER_COOLDOWN_DAYS
 * - Haven't sent a "new notifications" email in the last 7 days
 */
async function shouldSendOutstandingReminder(userId: string): Promise<boolean> {
  try {
    // Check for old unread notifications
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - OUTSTANDING_THRESHOLD_DAYS);

    const oldUnreadNotifications = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
          eq(notifications.isDeleted, false),
          lt(notifications.createdAt, cutoffDate)
        )
      )
      .limit(1);

    if (oldUnreadNotifications.length === 0) {
      return false;
    }

    // Check if we've sent a reminder recently
    const reminderCutoff = new Date();
    reminderCutoff.setDate(reminderCutoff.getDate() - REMINDER_COOLDOWN_DAYS);

    const recentReminder = await db
      .select()
      .from(notificationEmailsSent)
      .where(
        and(
          eq(notificationEmailsSent.userId, userId),
          eq(notificationEmailsSent.emailType, "outstanding_reminder"),
          eq(notificationEmailsSent.success, true)
        )
      )
      .orderBy(desc(notificationEmailsSent.sentAt))
      .limit(1);

    if (recentReminder.length > 0) {
      const lastSentAt = new Date(recentReminder[0].sentAt);
      if (lastSentAt > reminderCutoff) {
        return false; // Too soon since last reminder
      }
    }

    // Also check we haven't sent a new notifications email very recently
    const newEmailCutoff = new Date();
    newEmailCutoff.setDate(newEmailCutoff.getDate() - NEW_EMAIL_COOLDOWN_DAYS);

    const recentNewEmail = await db
      .select()
      .from(notificationEmailsSent)
      .where(
        and(
          eq(notificationEmailsSent.userId, userId),
          eq(notificationEmailsSent.emailType, "new_notifications"),
          eq(notificationEmailsSent.success, true)
        )
      )
      .orderBy(desc(notificationEmailsSent.sentAt))
      .limit(1);

    if (recentNewEmail.length > 0) {
      const lastSentAt = new Date(recentNewEmail[0].sentAt);
      if (lastSentAt > newEmailCutoff) {
        return false; // Just sent a new notifications email
      }
    }

    return true;
  } catch (error) {
    logger.error("Error checking if should send outstanding reminder", {
      userId,
      error,
    });
    return false;
  }
}

/**
 * Send a "new notifications" email to a specific user
 */
async function sendNewNotificationsEmailForUser(userId: string): Promise<EmailResult> {
  try {
    // Get user info
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.userid, userId))
      .limit(1);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Get unread notifications
    const unreadNotifications = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
          eq(notifications.isDeleted, false)
        )
      )
      .orderBy(notifications.createdAt)
      .limit(10); // Get up to 10 to show in email

    if (unreadNotifications.length === 0) {
      return {
        success: false,
        error: "No unread notifications",
      };
    }

    const notificationIds = unreadNotifications.map((n) => n.id);
    const unsubscribeUrl = `${BASE_URL}/settings/privacy?unsubscribe=notifications`;

    // Send email
    const emailResult = await sendNewNotificationsEmail({
      userEmail: user.email,
      userName: user.publicDisplayName || user.username,
      notifications: unreadNotifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        createdAt: new Date(n.createdAt),
        type: n.type,
      })),
      baseUrl: BASE_URL,
      unsubscribeUrl,
    });

    // Record that we sent the email
    await db.insert(notificationEmailsSent).values({
      userId,
      emailType: "new_notifications",
      notificationIds,
      success: emailResult.success,
      errorMessage: emailResult.error || null,
    });

    logger.info("Sent new notifications email", {
      userId,
      email: user.email,
      notificationCount: unreadNotifications.length,
      success: emailResult.success,
    });

    return emailResult;
  } catch (error) {
    logger.error("Failed to send new notifications email for user", {
      userId,
      error,
    });

    // Record the failure
    try {
      await db.insert(notificationEmailsSent).values({
        userId,
        emailType: "new_notifications",
        notificationIds: [],
        success: false,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    } catch (recordError) {
      logger.error("Failed to record email send failure", { recordError });
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send an "outstanding reminder" email to a specific user
 */
async function sendOutstandingReminderForUser(userId: string): Promise<EmailResult> {
  try {
    // Get user info
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.userid, userId))
      .limit(1);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Get old unread notifications
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - OUTSTANDING_THRESHOLD_DAYS);

    const oldUnreadNotifications = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
          eq(notifications.isDeleted, false),
          lt(notifications.createdAt, cutoffDate)
        )
      )
      .orderBy(notifications.createdAt);

    if (oldUnreadNotifications.length === 0) {
      return {
        success: false,
        error: "No old unread notifications",
      };
    }

    const oldestNotification = oldUnreadNotifications[0];
    const notificationIds = oldUnreadNotifications.map((n) => n.id);
    const unsubscribeUrl = `${BASE_URL}/settings/privacy?unsubscribe=notifications`;

    // Send email
    const emailResult = await sendOutstandingNotificationsEmail({
      userEmail: user.email,
      userName: user.publicDisplayName || user.username,
      notificationCount: oldUnreadNotifications.length,
      oldestNotificationDate: new Date(oldestNotification.createdAt),
      baseUrl: BASE_URL,
      unsubscribeUrl,
    });

    // Record that we sent the email
    await db.insert(notificationEmailsSent).values({
      userId,
      emailType: "outstanding_reminder",
      notificationIds,
      success: emailResult.success,
      errorMessage: emailResult.error || null,
    });

    logger.info("Sent outstanding notifications reminder", {
      userId,
      email: user.email,
      notificationCount: oldUnreadNotifications.length,
      success: emailResult.success,
    });

    return emailResult;
  } catch (error) {
    logger.error("Failed to send outstanding reminder for user", {
      userId,
      error,
    });

    // Record the failure
    try {
      await db.insert(notificationEmailsSent).values({
        userId,
        emailType: "outstanding_reminder",
        notificationIds: [],
        success: false,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    } catch (recordError) {
      logger.error("Failed to record email send failure", { recordError });
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Manually trigger notification email for a specific user (for testing)
 */
export async function sendNotificationEmailForUser(
  userId: string,
  type: "new" | "reminder"
): Promise<EmailResult> {
  if (type === "new") {
    return sendNewNotificationsEmailForUser(userId);
  } else {
    return sendOutstandingReminderForUser(userId);
  }
}
