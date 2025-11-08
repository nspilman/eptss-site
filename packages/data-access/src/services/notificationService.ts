"use server";

import { db } from "../db";
import { notifications, type Notification, type NewNotification, notificationTypeEnum } from "../db/schema";
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
