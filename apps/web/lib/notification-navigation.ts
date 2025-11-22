/**
 * Notification Navigation System
 *
 * This module provides a flexible system for navigating to different content
 * based on notification types. Each notification type can define its own
 * navigation logic.
 */

import type { Notification } from "@eptss/data-access/db/schema";

/**
 * Navigation result from a notification handler
 */
export interface NavigationResult {
  /** The URL to navigate to */
  url?: string;
  /** Whether to mark the notification as read before navigating */
  markAsRead?: boolean;
  /** Error message if navigation cannot be determined */
  error?: string;
}

/**
 * Handler function for a notification type
 */
export type NotificationNavigationHandler = (
  metadata: Record<string, any>
) => Promise<NavigationResult> | NavigationResult;

/**
 * Registry of navigation handlers by notification type
 */
const navigationHandlers: Record<string, NotificationNavigationHandler> = {};

/**
 * Register a navigation handler for a notification type
 */
export function registerNavigationHandler(
  notificationType: string,
  handler: NotificationNavigationHandler
) {
  navigationHandlers[notificationType] = handler;
}

/**
 * Get navigation info for a notification
 */
export async function getNotificationNavigation(
  notification: Notification
): Promise<NavigationResult> {
  const handler = navigationHandlers[notification.type];

  if (!handler) {
    // No handler registered - notification is not clickable
    return {};
  }

  // Parse metadata with error handling
  let metadata: Record<string, any> = {};
  try {
    metadata = notification.metadata ? JSON.parse(notification.metadata) : {};
  } catch (parseError) {
    console.error(`Invalid JSON in notification metadata for ${notification.type}:`, parseError);
    return { error: "Invalid notification data" };
  }

  // Execute handler
  try {
    return await handler(metadata);
  } catch (error) {
    console.error(`Error handling navigation for ${notification.type}:`, error);
    return { error: "Failed to determine navigation" };
  }
}

/**
 * Check if a notification type is clickable
 */
export function isNotificationClickable(notificationType: string): boolean {
  return notificationType in navigationHandlers;
}

// ============================================
// Built-in Navigation Handlers
// ============================================

/**
 * Generic comment navigation handler
 * Works for: comment_received, comment_reply_received, comment_upvoted
 */
async function handleCommentNavigation(
  metadata: Record<string, any>
): Promise<NavigationResult> {
  let { contentId, commentId } = metadata;

  if (!commentId) {
    return { error: "Missing commentId" };
  }

  // Fallback: if contentId is missing (older notifications), fetch it from the comment
  if (!contentId) {
    try {
      const commentResponse = await fetch(`/api/comments/${commentId}`);
      if (commentResponse.ok) {
        const commentData = await commentResponse.json();
        contentId = commentData.contentId;
      } else {
        return { error: "Comment not found" };
      }
    } catch (error) {
      return { error: "Failed to fetch comment" };
    }
  }

  if (!contentId) {
    return { error: "Missing contentId" };
  }

  try {
    // Fetch the content slug
    const response = await fetch(`/api/notifications/content-slug?contentId=${contentId}`);
    if (!response.ok) {
      return { error: "Failed to fetch content" };
    }

    const { slug } = await response.json();
    if (!slug) {
      return { error: "Content not found" };
    }

    return {
      url: `/reflections/${slug}#comment-${commentId}`,
      markAsRead: true,
    };
  } catch (error) {
    return { error: "Failed to load content" };
  }
}

/**
 * Round opened notification handler
 */
function handleRoundOpenedNavigation(
  metadata: Record<string, any>
): NavigationResult {
  const { roundId } = metadata;

  if (!roundId) {
    return { url: "/dashboard", markAsRead: true };
  }

  // Could navigate to specific round page if we have one
  return { url: "/dashboard", markAsRead: true };
}

/**
 * Submission confirmation handler
 */
function handleSubmissionNavigation(
  metadata: Record<string, any>
): NavigationResult {
  const { roundId, submissionId } = metadata;

  // Navigate to the submissions page or specific submission
  if (roundId) {
    return { url: `/rounds/${roundId}/submissions`, markAsRead: true };
  }

  return { url: "/dashboard", markAsRead: true };
}

/**
 * Vote confirmation handler
 */
function handleVoteNavigation(
  metadata: Record<string, any>
): NavigationResult {
  const { roundId } = metadata;

  if (roundId) {
    return { url: `/rounds/${roundId}`, markAsRead: true };
  }

  return { url: "/dashboard", markAsRead: true };
}

/**
 * Reflection/content navigation handler
 */
async function handleReflectionNavigation(
  metadata: Record<string, any>
): Promise<NavigationResult> {
  const { contentId, slug } = metadata;

  // If we already have the slug in metadata, use it
  if (slug) {
    return {
      url: `/reflections/${slug}`,
      markAsRead: true,
    };
  }

  // Otherwise fetch it
  if (contentId) {
    try {
      const response = await fetch(`/api/notifications/content-slug?contentId=${contentId}`);
      if (response.ok) {
        const { slug } = await response.json();
        if (slug) {
          return {
            url: `/reflections/${slug}`,
            markAsRead: true,
          };
        }
      }
    } catch (error) {
      console.error("Failed to fetch reflection slug:", error);
    }
  }

  return { error: "Could not find reflection" };
}

// ============================================
// Register Default Handlers
// ============================================

// Comment-related notifications
registerNavigationHandler("comment_received", handleCommentNavigation);
registerNavigationHandler("comment_reply_received", handleCommentNavigation);
registerNavigationHandler("comment_upvoted", handleCommentNavigation);

// Round-related notifications
registerNavigationHandler("round_opened", handleRoundOpenedNavigation);
registerNavigationHandler("round_voting_opened", handleRoundOpenedNavigation);
registerNavigationHandler("round_covering_begins", handleRoundOpenedNavigation);
registerNavigationHandler("round_covers_due", handleRoundOpenedNavigation);

// Submission/Vote notifications
registerNavigationHandler("submission_confirmation", handleSubmissionNavigation);
registerNavigationHandler("vote_confirmation", handleVoteNavigation);

// Admin announcements - go to dashboard
registerNavigationHandler("admin_announcement", () => ({
  url: "/dashboard",
  markAsRead: true
}));
