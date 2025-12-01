import { Suspense } from "react";
import { Metadata } from 'next/types';
import { getAllNotifications, getAllNotificationsCount, type NotificationWithUser } from "@eptss/data-access";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@eptss/ui";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Notifications | Admin",
  description: "View all system notifications",
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

async function NotificationsContent() {
  const [allNotifications, unseenNotifications, totalCount, unseenCount] = await Promise.all([
    getAllNotifications({ limit: 50, offset: 0 }),
    getAllNotifications({ unreadOnly: true, limit: 50, offset: 0 }),
    getAllNotificationsCount(false),
    getAllNotificationsCount(true),
  ]);

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-primary mb-2">Notifications</h2>
        <p className="text-secondary">View all recent system notifications across all users</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Unread Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{unseenCount}</div>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Total Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Unread Notifications Section */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-xl">Unread Notifications ({unseenCount})</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationList notifications={unseenNotifications} />
          {unseenCount > unseenNotifications.length && (
            <div className="mt-4 text-center">
              <p className="text-sm text-secondary">
                Showing {unseenNotifications.length} of {unseenCount} unread notifications
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Notifications Section */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-xl">All Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationList notifications={allNotifications} />
          {totalCount > allNotifications.length && (
            <div className="mt-4 text-center">
              <p className="text-sm text-secondary">
                Showing {allNotifications.length} of {totalCount} total notifications
              </p>
              <p className="text-xs text-tertiary mt-1">
                Showing most recent 50 notifications
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-12 bg-background-secondary/30 animate-pulse rounded" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-background-secondary/30 animate-pulse rounded" />
            ))}
          </div>
          <div className="h-96 bg-background-secondary/30 animate-pulse rounded" />
        </div>
      }
    >
      <NotificationsContent />
    </Suspense>
  );
}
