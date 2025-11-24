"use client";

import { Button, EmptyState } from "@eptss/ui";
import { CheckCheck, RefreshCw } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import type { NotificationWithUrl } from "./NotificationBell";

interface NotificationDropdownProps {
  notifications: NotificationWithUrl[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  onClose: () => void;
}

export function NotificationDropdown({
  notifications,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onRefresh,
  onClose,
}: NotificationDropdownProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-semibold text-sm text-primary">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-secondary">
              {unreadCount} unread
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMarkAllAsRead}
              className="h-8 w-8"
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto flex-1">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-pulse text-secondary text-sm">Loading...</div>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No notifications"
            description="You're all caught up!"
            className="py-8"
          />
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
