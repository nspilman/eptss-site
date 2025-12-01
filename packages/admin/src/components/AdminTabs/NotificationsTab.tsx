"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@eptss/ui";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { NotificationWithUser } from "@eptss/data-access";

type NotificationsTabProps = {
  allNotifications: NotificationWithUser[];
  unseenNotifications: NotificationWithUser[];
  totalNotificationsCount: number;
  unseenNotificationsCount: number;
};

const notificationIcons: Record<string, string> = {
  signup_confirmation: "✅",
  vote_confirmation: "🗳️",
  submission_confirmation: "🎸",
  round_opened: "🎵",
  round_voting_opened: "📊",
  round_covering_begins: "🎤",
  round_covers_due: "⏰",
  comment_received: "💬",
  comment_reply_received: "💬",
  comment_upvoted: "❤️",
  mention_received: "👋",
  admin_announcement: "📢",
  test_notification: "🔔",
};

function getNotificationDestination(notification: NotificationWithUser): string | null {
  try {
    const metadata = notification.metadata ? JSON.parse(notification.metadata) : {};

    // Comment notifications
    if (['comment_received', 'comment_reply_received', 'comment_upvoted'].includes(notification.type)) {
      const { commentId, roundId, userContentId, contentId } = metadata;
      if (!commentId) return null;

      // Round discussion comment
      if (roundId) {
        return `/discussions#comment-${commentId}`;
      }

      // Reflection comment (note: would need slug lookup in production)
      if (userContentId || contentId) {
        return `/reflections/[slug]#comment-${commentId}`;
      }
    }

    // Round notifications
    if (['round_opened', 'round_voting_opened', 'round_covering_begins', 'round_covers_due'].includes(notification.type)) {
      return '/dashboard';
    }

    // Submission notification
    if (notification.type === 'submission_confirmation') {
      const { roundId } = metadata;
      if (roundId) {
        return `/rounds/${roundId}/submissions`;
      }
      return '/dashboard';
    }

    // Vote notification
    if (notification.type === 'vote_confirmation') {
      const { roundId } = metadata;
      if (roundId) {
        return `/rounds/${roundId}`;
      }
      return '/dashboard';
    }

    // Admin announcement
    if (notification.type === 'admin_announcement') {
      return '/dashboard';
    }

    return null;
  } catch (error) {
    return null;
  }
}

function NotificationList({ notifications }: { notifications: NotificationWithUser[] }) {
  if (notifications.length === 0) {
    return (
      <p className="text-secondary text-center py-8">No notifications to display</p>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const icon = notificationIcons[notification.type] || "🔔";
        const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
          addSuffix: true,
        });
        const destination = getNotificationDestination(notification);

        return (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border transition-colors ${
              !notification.isRead
                ? "bg-primary/5 border-primary/20"
                : "bg-background-tertiary/30 border-background-tertiary/50"
            }`}
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0 text-2xl">{icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-medium text-primary">
                    {notification.title}
                  </h4>
                  {!notification.isRead && (
                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full flex-shrink-0">
                      Unread
                    </span>
                  )}
                </div>
                <p className="text-xs text-secondary break-words mb-2">
                  {notification.message}
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 text-xs text-tertiary">
                    <span>{timeAgo}</span>
                    <span>•</span>
                    <Link
                      href={`/profile/${notification.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary hover:underline transition-colors"
                      title={`View profile: /profile/${notification.username}`}
                    >
                      User: {notification.displayName ? `${notification.displayName} (@${notification.username})` : notification.username}
                    </Link>
                    <span>•</span>
                    <span className="font-mono">{notification.type}</span>
                  </div>
                  {destination && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-tertiary">Destination:</span>
                      <Link
                        href={destination}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 hover:underline transition-colors font-mono"
                      >
                        {destination}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function NotificationsTab({
  allNotifications,
  unseenNotifications,
  totalNotificationsCount,
  unseenNotificationsCount,
}: NotificationsTabProps) {
  const [viewMode, setViewMode] = useState<"unseen" | "all">("unseen");

  const displayedNotifications =
    viewMode === "unseen" ? unseenNotifications : allNotifications;
  const displayedCount =
    viewMode === "unseen" ? unseenNotificationsCount : totalNotificationsCount;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Unseen Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {unseenNotificationsCount}
            </div>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Total Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {totalNotificationsCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Section */}
      <section className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-primary">
            Recent Notifications
          </h2>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "unseen" ? "default" : "outline"}
              onClick={() => setViewMode("unseen")}
              size="sm"
            >
              Unseen ({unseenNotificationsCount})
            </Button>
            <Button
              variant={viewMode === "all" ? "default" : "outline"}
              onClick={() => setViewMode("all")}
              size="sm"
            >
              All ({totalNotificationsCount})
            </Button>
          </div>
        </div>

        <NotificationList notifications={displayedNotifications} />

        {displayedCount > displayedNotifications.length && (
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary">
              Showing {displayedNotifications.length} of {displayedCount}{" "}
              notifications
            </p>
            <p className="text-xs text-tertiary mt-1">
              Pagination will be implemented in a future update
            </p>
          </div>
        )}
      </section>
    </motion.div>
  );
}
