"use server";

import {
  createComment,
  updateComment,
  deleteComment,
  upvoteComment,
  removeUpvote,
  getCommentsByContentId,
} from "@eptss/data-access/services/commentService";
import { createNotification } from "@eptss/data-access/services/notificationService";
import { getUserById } from "@eptss/data-access/services/userService";
import { logger } from "@eptss/logger/server";
import { getAuthUser } from "@eptss/auth/server";
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

    // Send notification to content author (if not commenting on own content)
    if (data.contentAuthorId && data.contentAuthorId !== userId) {
      const commenter = await getUserById(userId);
      const commenterName = commenter?.fullName || commenter?.username || "Someone";

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
 * Delete a comment (soft delete)
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
