/**
 * Notification Navigation System
 *
 * This module provides a flexible system for navigating to different content
 * based on notification types. Each notification type can define its own
 * navigation logic.
 */

import type { Notification } from "@eptss/data-access/db/schema";
import { routes, api } from "@eptss/routing";

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
  let { userContentId, roundId, commentId, contentId } = metadata;

  if (!commentId) {
    return { error: "Missing commentId" };
  }

  // Fallback: if userContentId/roundId are missing (older notifications), fetch from the comment
  if (!userContentId && !roundId && !contentId) {
    try {
      const commentResponse = await fetch(api.comments.byId(commentId));
      if (commentResponse.ok) {
        const commentData = await commentResponse.json();
        userContentId = commentData.userContentId;
        roundId = commentData.roundId;
      } else {
        return { error: "Comment not found" };
      }
    } catch (error) {
      return { error: "Failed to fetch comment" };
    }
  }

  // Handle legacy contentId (pre-migration notifications)
  if (contentId && !userContentId) {
    userContentId = contentId;
  }

  // Handle round discussion comments
  if (roundId) {
    return {
      url: routes.projects.discussions('cover', { hash: `comment-${commentId}` }),
      markAsRead: true,
    };
  }

  // Handle reflection comments
  if (userContentId) {
    try {
      // Fetch the content slug
      const response = await fetch(api.notifications.contentSlug(userContentId));
      if (!response.ok) {
        return { error: "Failed to fetch content" };
      }

      const { slug } = await response.json();
      if (!slug) {
        return { error: "Content not found" };
      }

      return {
        url: routes.legacy.reflection(slug, { hash: `comment-${commentId}` }),
        markAsRead: true,
      };
    } catch (error) {
      return { error: "Failed to load content" };
    }
  }

  return { error: "Missing content reference" };
}

/**
 * Round opened notification handler
 */
function handleRoundOpenedNavigation(
  metadata: Record<string, any>
): NavigationResult {
  const { roundId } = metadata;

  if (!roundId) {
    return { url: routes.dashboard.root(), markAsRead: true };
  }

  // Could navigate to specific round page if we have one
  return { url: routes.dashboard.root(), markAsRead: true };
}

/**
 * Submission confirmation handler
 */
function handleSubmissionNavigation(
  metadata: Record<string, any>
): NavigationResult {
  const { roundId, submissionId } = metadata;

  // Navigate to the dashboard (no specific submissions page exists)
  // TODO: Update when submissions page is created
  if (roundId) {
    return { url: routes.dashboard.root(), markAsRead: true };
  }

  return { url: routes.dashboard.root(), markAsRead: true };
}

/**
 * Vote confirmation handler
 */
function handleVoteNavigation(
  metadata: Record<string, any>
): NavigationResult {
  const { roundId } = metadata;

  // Navigate to dashboard (voting page is project-scoped and needs slug)
  // TODO: Update when we have roundId -> slug mapping
  if (roundId) {
    return { url: routes.dashboard.root(), markAsRead: true };
  }

  return { url: routes.dashboard.root(), markAsRead: true };
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
      url: routes.legacy.reflection(slug),
      markAsRead: true,
    };
  }

  // Otherwise fetch it
  if (contentId) {
    try {
      const response = await fetch(api.notifications.contentSlug(contentId));
      if (response.ok) {
        const { slug } = await response.json();
        if (slug) {
          return {
            url: routes.legacy.reflection(slug),
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
  url: routes.dashboard.root(),
  markAsRead: true
}));
