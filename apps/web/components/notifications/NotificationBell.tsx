"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button, Popover, PopoverTrigger, PopoverContent, Badge } from "@eptss/ui";
import { NotificationDropdown } from "./NotificationDropdown";
import type { Notification } from "@eptss/db";
import { getNotificationNavigation } from "@/lib/notification-navigation";

// Poll every 5 minutes instead of 30 seconds to reduce CPU usage
const POLL_INTERVAL_MS = 5 * 60 * 1000;

export interface NotificationWithUrl extends Notification {
  resolvedUrl?: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationWithUrl[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notifications?limit=10");
      if (response.ok) {
        const data = await response.json();
        const notificationsData: Notification[] = data.notifications;

        // Preload URLs for all notifications in parallel
        const notificationsWithUrls = await Promise.all(
          notificationsData.map(async (notification) => {
            try {
              const navigationResult = await getNotificationNavigation(notification);
              return {
                ...notification,
                resolvedUrl: navigationResult.url || undefined,
              };
            } catch (error) {
              console.error("Failed to resolve URL for notification:", notification.id, error);
              return notification;
            }
          })
        );

        setNotifications(notificationsWithUrls);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (!notifications.find((n) => n.id === notificationId)?.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // Store interval reference for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  // Memoized fetch function to avoid recreating on each render
  const fetchUnreadCountMemoized = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/unread-count");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
        lastFetchRef.current = Date.now();
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, []);

  useEffect(() => {
    // Fetch notifications and unread count on mount
    fetchNotifications();
    fetchUnreadCountMemoized();

    // Start polling with visibility-aware interval
    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(fetchUnreadCountMemoized, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Handle visibility changes - pause polling when tab is hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // If it's been more than 1 minute since last fetch, fetch immediately
        const timeSinceLastFetch = Date.now() - lastFetchRef.current;
        if (timeSinceLastFetch > 60000) {
          fetchUnreadCountMemoized();
        }
        startPolling();
      } else {
        stopPolling();
      }
    };

    // Handle focus - fetch when tab regains focus
    const handleFocus = () => {
      const timeSinceLastFetch = Date.now() - lastFetchRef.current;
      if (timeSinceLastFetch > 60000) {
        fetchUnreadCountMemoized();
      }
    };

    // Only poll if tab is visible
    if (document.visibilityState === "visible") {
      startPolling();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchUnreadCountMemoized]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      // Mark all notifications as read when opening the dropdown
      if (unreadCount > 0) {
        markAllAsRead();
      }
    }
  }, [isOpen]);

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <NotificationDropdown
          notifications={notifications}
          isLoading={isLoading}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onRefresh={fetchNotifications}
          onClose={closeDropdown}
        />
      </PopoverContent>
    </Popover>
  );
}
