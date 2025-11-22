"use client";

import { Button } from "@eptss/ui";
import { Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { NotificationWithUrl } from "./NotificationBell";
import { isNotificationClickable } from "@/lib/notification-navigation";

interface NotificationItemProps {
  notification: NotificationWithUrl;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
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
  comment_reply_received: "💬",
  comment_upvoted: "❤️",
  mention_received: "👋",
  admin_announcement: "📢",
  test_notification: "🔔",
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClose,
}: NotificationItemProps) {
  const icon = notificationIcons[notification.type] || "🔔";
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  const isClickable = isNotificationClickable(notification.type);
  const hasUrl = !!notification.resolvedUrl;

  const handleLinkClick = () => {
    // Mark as read when clicking the link
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    // Close the dropdown
    onClose();
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    // Prevent link navigation when clicking action buttons
    e.preventDefault();
    e.stopPropagation();
  };

  const content = (
    <div className="flex gap-3">
      <div className="flex-shrink-0 text-2xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-primary">
            {notification.title}
          </h4>
          <div className="flex gap-1" onClick={handleButtonClick}>
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
  );

  if (isClickable && hasUrl) {
    return (
      <Link
        href={notification.resolvedUrl}
        onClick={handleLinkClick}
        className={`block p-4 transition-colors ${
          !notification.isRead ? "bg-primary/5" : ""
        } hover:bg-background-secondary/50`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={`p-4 transition-colors ${
        !notification.isRead ? "bg-primary/5" : ""
      }`}
    >
      {content}
    </div>
  );
}
