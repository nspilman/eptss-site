"use client";

import { Button } from "@eptss/ui";
import { Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@eptss/data-access/db/schema";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const notificationIcons: Record<string, string> = {
  signup_confirmation: "✅",
  vote_confirmation: "🗳️",
  submission_confirmation: "🎸",
  round_opened: "🎵",
  round_voting_opened: "📊",
  round_covering_begins: "🎤",
  round_covers_due: "⏰",
  comment_received: "💬",
  mention_received: "👋",
  admin_announcement: "📢",
  test_notification: "🔔",
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const icon = notificationIcons[notification.type] || "🔔";
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      className={`p-4 hover:bg-background-secondary/50 transition-colors ${
        !notification.isRead ? "bg-primary/5" : ""
      }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 text-2xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-primary">
              {notification.title}
            </h4>
            <div className="flex gap-1">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-6 w-6 flex-shrink-0"
                  title="Mark as read"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(notification.id)}
                className="h-6 w-6 flex-shrink-0 hover:text-red-500"
                title="Delete"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-secondary mt-1 break-words">
            {notification.message}
          </p>
          <p className="text-xs text-tertiary mt-2">{timeAgo}</p>
        </div>
      </div>
    </div>
  );
}
