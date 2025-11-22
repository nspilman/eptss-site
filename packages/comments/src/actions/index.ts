"use server";

import {
  createComment,
  updateComment,
  deleteComment,
  upvoteComment,
  removeUpvote,
  getCommentsByContentId,
  getCommentById,
} from "@eptss/data-access/services/commentService";
import { createNotification, deleteNotificationsByCommentId } from "@eptss/data-access/services/notificationService";
import { getUserById } from "@eptss/data-access/services/userService";
import { logger } from "@eptss/logger/server";
import { getAuthUser } from "@eptss/auth/server";
import { getDisplayName } from "@eptss/shared";
import { z } from "zod";

// Validation schemas
const createCommentSchema = z.object({
  contentId: z.string().uuid(),
  content: z.string().min(1).max(10000),
  parentCommentId: z.string().uuid().optional(),
});

const updateCommentSchema = z.object({
  commentId: z.string().uuid(),
  content: z.string().min(1).max(10000),
});

const deleteCommentSchema = z.object({
  commentId: z.string().uuid(),
});

const upvoteSchema = z.object({
  commentId: z.string().uuid(),
});

// Helper to get current user
async function getCurrentUserId(): Promise<string | null> {
  try {
    const { userId } = await getAuthUser();
    return userId || null;
  } catch (error) {
    logger.error("Failed to get current user", { error });
    return null;
  }
}

/**
 * Create a new comment or reply
 */
export async function createCommentAction(data: {
  contentId: string;
  content: string;
  parentCommentId?: string;
  contentAuthorId?: string;
}) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "You must be logged in to comment" };
    }

    // Validate input
    const validated = createCommentSchema.parse(data);

    // Create comment
    const comment = await createComment({
      contentId: validated.contentId,
      userId,
      content: validated.content,
      parentCommentId: validated.parentCommentId,
    });

    if (!comment) {
      return { success: false, error: "Failed to create comment" };
    }

    // Get commenter info for notifications
    const commenter = await getUserById(userId);
    const commenterName = getDisplayName(commenter || {}, "Someone");

    // If this is a reply to another comment, notify the parent comment author
    if (validated.parentCommentId) {
      const parentComment = await getCommentById(validated.parentCommentId);

      // Only send notification if parent comment exists and replier is not the parent comment author
      if (parentComment && parentComment.userId !== userId) {
        await createNotification({
          userId: parentComment.userId,
          type: "comment_reply_received",
          title: "New reply to your comment",
          message: `${commenterName} replied to your comment: ${validated.content.substring(0, 100)}${validated.content.length > 100 ? "..." : ""}`,
          metadata: {
            commentId: comment.id,
            parentCommentId: validated.parentCommentId,
            contentId: validated.contentId,
            replierId: userId,
          },
        });
      }
    } else {
      // This is a top-level comment, notify the content author
      if (data.contentAuthorId && data.contentAuthorId !== userId) {
        await createNotification({
          userId: data.contentAuthorId,
          type: "comment_received",
          title: "New comment on your reflection",
          message: `${commenterName} commented: ${validated.content.substring(0, 100)}${validated.content.length > 100 ? "..." : ""}`,
          metadata: {
            commentId: comment.id,
            contentId: validated.contentId,
            commenterId: userId,
          },
        });
      }
    }

    return { success: true, comment };
  } catch (error) {
    logger.error("Failed to create comment", { error, data });
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid comment data" };
    }
    return { success: false, error: "Failed to create comment" };
  }
}

/**
 * Update an existing comment
 */
export async function updateCommentAction(data: {
  commentId: string;
  content: string;
}) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "You must be logged in to edit comments" };
    }

    // Validate input
    const validated = updateCommentSchema.parse(data);

    // Update comment
    const comment = await updateComment(
      validated.commentId,
      userId,
      validated.content
    );

    if (!comment) {
      return {
        success: false,
        error: "Failed to update comment. You can only edit your own comments.",
      };
    }

    return { success: true, comment };
  } catch (error) {
    logger.error("Failed to update comment", { error, data });
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid comment data" };
    }
    return { success: false, error: "Failed to update comment" };
  }
}

/**
 * Delete a comment (soft delete) and associated notifications
 */
export async function deleteCommentAction(data: { commentId: string }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "You must be logged in to delete comments" };
    }

    // Validate input
    const validated = deleteCommentSchema.parse(data);

    // Delete comment
    const success = await deleteComment(validated.commentId, userId);

    if (!success) {
      return {
        success: false,
        error: "Failed to delete comment. You can only delete your own comments.",
      };
    }

    // Delete all notifications associated with this comment
    // This includes: comment_received, comment_reply_received, comment_upvoted
    await deleteNotificationsByCommentId(validated.commentId);

    return { success: true };
  } catch (error) {
    logger.error("Failed to delete comment", { error, data });
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid comment data" };
    }
    return { success: false, error: "Failed to delete comment" };
  }
}

/**
 * Toggle upvote on a comment
 */
export async function toggleUpvoteAction(data: {
  commentId: string;
  currentlyUpvoted: boolean;
}) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "You must be logged in to upvote" };
    }

    // Validate input
    const validated = upvoteSchema.parse(data);

    // Toggle upvote
    const success = data.currentlyUpvoted
      ? await removeUpvote(validated.commentId, userId)
      : await upvoteComment(validated.commentId, userId);

    if (!success) {
      return { success: false, error: "Failed to toggle upvote" };
    }

    // Send notification when upvoting (not when removing upvote)
    if (!data.currentlyUpvoted) {
      const comment = await getCommentById(validated.commentId);

      // Only send notification if comment exists and upvoter is not the comment author
      if (comment && comment.userId !== userId) {
        const upvoter = await getUserById(userId);
        const upvoterName = getDisplayName(upvoter || {}, "Someone");

        await createNotification({
          userId: comment.userId,
          type: "comment_upvoted",
          title: "Someone liked your comment",
          message: `${upvoterName} liked your comment: ${comment.content.substring(0, 100)}${comment.content.length > 100 ? "..." : ""}`,
          metadata: {
            commentId: validated.commentId,
            contentId: comment.contentId,
            upvoterId: userId,
          },
        });
      }
    }

    return { success: true };
  } catch (error) {
    logger.error("Failed to toggle upvote", { error, data });
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid upvote data" };
    }
    return { success: false, error: "Failed to toggle upvote" };
  }
}

/**
 * Fetch comments for content
 */
export async function getCommentsAction(contentId: string) {
  try {
    const userId = await getCurrentUserId();

    const comments = await getCommentsByContentId(contentId, userId || undefined);

    return { success: true, comments };
  } catch (error) {
    logger.error("Failed to fetch comments", { error, contentId });
    return { success: false, error: "Failed to load comments", comments: [] };
  }
}
