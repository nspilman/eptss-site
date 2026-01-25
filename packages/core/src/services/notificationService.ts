"use server";

import { db } from "../db";
import { notifications, users, type Notification, type NewNotification, notificationTypeEnum } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { logger } from "@eptss/logger/server";

export type NotificationType = typeof notificationTypeEnum.enumValues[number];

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

interface GetNotificationsOptions {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  metadata,
}: CreateNotificationParams): Promise<Notification | null> {
  try {
    const metadataString = metadata ? JSON.stringify(metadata) : null;

    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        title,
        message,
        metadata: metadataString,
      })
      .returning();

    logger.info("Notification created", {
      notificationId: notification.id,
      userId,
      type,
    });

    return notification;
  } catch (error) {
    logger.error("Failed to create notification", {
      error,
      userId,
      type,
    });
    return null;
  }
}

export async function getUserNotifications(
  userId: string,
  options: GetNotificationsOptions = {}
): Promise<Notification[]> {
  try {
    const { unreadOnly = false, limit = 50, offset = 0 } = options;

    const conditions = [
      eq(notifications.userId, userId),
      eq(notifications.isDeleted, false),
    ];

    if (unreadOnly) {
      conditions.push(eq(notifications.isRead, false));
    }

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return userNotifications;
  } catch (error) {
    logger.error("Failed to get user notifications", { error, userId });
    return [];
  }
}

export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    const [updated] = await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      )
      .returning();

    if (updated) {
      logger.info("Notification marked as read", {
        notificationId,
        userId,
      });
      return true;
    }

    return false;
  } catch (error) {
    logger.error("Failed to mark notification as read", {
      error,
      notificationId,
      userId,
    });
    return false;
  }
}

export async function markAllAsRead(userId: string): Promise<number> {
  try {
    const updated = await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
          eq(notifications.isDeleted, false)
        )
      )
      .returning();

    logger.info("All notifications marked as read", {
      userId,
      count: updated.length,
    });

    return updated.length;
  } catch (error) {
    logger.error("Failed to mark all notifications as read", {
      error,
      userId,
    });
    return 0;
  }
}

export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    const [updated] = await db
      .update(notifications)
      .set({
        isDeleted: true,
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      )
      .returning();

    if (updated) {
      logger.info("Notification soft deleted", {
        notificationId,
        userId,
      });
      return true;
    }

    return false;
  } catch (error) {
    logger.error("Failed to delete notification", {
      error,
      notificationId,
      userId,
    });
    return false;
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const unreadNotifications = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
          eq(notifications.isDeleted, false)
        )
      );

    return unreadNotifications.length;
  } catch (error) {
    logger.error("Failed to get unread count", { error, userId });
    return 0;
  }
}

/**
 * Delete all notifications associated with a comment
 * This includes notifications for:
 * - comment_received (top-level comments)
 * - comment_reply_received (replies)
 * - comment_upvoted (upvotes)
 */
export async function deleteNotificationsByCommentId(
  commentId: string
): Promise<number> {
  try {
    // Find all notifications where commentId is in the metadata
    const allNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.isDeleted, false));

    // Filter notifications that have this commentId in their metadata
    const notificationsToDelete = allNotifications.filter(notification => {
      if (!notification.metadata) return false;

      try {
        const metadata = JSON.parse(notification.metadata);
        // Check if this notification is about the deleted comment
        // or if the deleted comment is the parent
        return metadata.commentId === commentId ||
               metadata.parentCommentId === commentId;
      } catch {
        return false;
      }
    });

    // Soft delete all matching notifications
    let deleteCount = 0;
    for (const notification of notificationsToDelete) {
      const success = await deleteNotification(notification.id, notification.userId);
      if (success) deleteCount++;
    }

    logger.info("Deleted notifications for comment", {
      commentId,
      count: deleteCount,
    });

    return deleteCount;
  } catch (error) {
    logger.error("Failed to delete notifications by comment ID", {
      error,
      commentId,
    });
    return 0;
  }
}

interface GetAllNotificationsOptions {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

export type NotificationWithUser = Notification & {
  username: string;
  displayName: string | null;
};

/**
 * Get all notifications across all users (admin view)
 * Supports filtering by unseen only and pagination
 * Includes username and display name for linking to user profiles
 */
export async function getAllNotifications(
  options: GetAllNotificationsOptions = {}
): Promise<NotificationWithUser[]> {
  try {
    const { unreadOnly = false, limit = 50, offset = 0 } = options;

    const conditions = [eq(notifications.isDeleted, false)];

    if (unreadOnly) {
      conditions.push(eq(notifications.isRead, false));
    }

    const allNotifications = await db
      .select({
        id: notifications.id,
        userId: notifications.userId,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        metadata: notifications.metadata,
        isRead: notifications.isRead,
        isDeleted: notifications.isDeleted,
        createdAt: notifications.createdAt,
        readAt: notifications.readAt,
        username: users.username,
        displayName: users.publicDisplayName,
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.userId, users.userid))
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return allNotifications as NotificationWithUser[];
  } catch (error) {
    logger.error("Failed to get all notifications", { error });
    return [];
  }
}

/**
 * Get count of all notifications (admin view)
 */
export async function getAllNotificationsCount(unreadOnly: boolean = false): Promise<number> {
  try {
    const conditions = [eq(notifications.isDeleted, false)];

    if (unreadOnly) {
      conditions.push(eq(notifications.isRead, false));
    }

    const result = await db
      .select()
      .from(notifications)
      .where(and(...conditions));

    return result.length;
  } catch (error) {
    logger.error("Failed to get all notifications count", { error });
    return 0;
  }
}
