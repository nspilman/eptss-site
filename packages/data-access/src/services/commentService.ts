"use server";

import { db } from "../db";
import { comments, commentUpvotes, users, type Comment, type NewComment } from "../db/schema";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { logger } from "@eptss/logger/server";

export interface CommentWithAuthor extends Comment {
  author: {
    userid: string;
    username: string;
    publicDisplayName: string | null;
    profilePictureUrl: string | null;
  };
  upvoteCount: number;
  hasUserUpvoted?: boolean;
  replies?: CommentWithAuthor[];
}

/**
 * Create a new comment
 */
export async function createComment({
  contentId,
  userId,
  content,
  parentCommentId,
}: {
  contentId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
}): Promise<Comment | null> {
  try {
    const [comment] = await db
      .insert(comments)
      .values({
        contentId,
        userId,
        content,
        parentCommentId: parentCommentId || null,
      })
      .returning();

    logger.info("Comment created", {
      commentId: comment.id,
      userId,
      contentId,
      parentCommentId,
    });

    return comment;
  } catch (error) {
    logger.error("Failed to create comment", {
      error,
      userId,
      contentId,
    });
    return null;
  }
}

/**
 * Get comments for content with author info and upvote counts
 */
export async function getCommentsByContentId(
  contentId: string,
  currentUserId?: string
): Promise<CommentWithAuthor[]> {
  try {
    // Get all comments for this content with author info and upvote counts
    const commentsWithData = await db
      .select({
        comment: comments,
        author: {
          userid: users.userid,
          username: users.username,
          publicDisplayName: users.publicDisplayName,
          profilePictureUrl: users.profilePictureUrl,
        },
        upvoteCount: sql<number>`CAST(COUNT(DISTINCT ${commentUpvotes.id}) AS INTEGER)`,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.userid))
      .leftJoin(commentUpvotes, eq(comments.id, commentUpvotes.commentId))
      .where(eq(comments.contentId, contentId))
      .groupBy(comments.id, users.userid, users.username, users.publicDisplayName, users.profilePictureUrl)
      .orderBy(desc(comments.createdAt));

    // If currentUserId is provided, get their upvotes
    let userUpvotes: Set<string> = new Set();
    if (currentUserId) {
      const upvotes = await db
        .select({ commentId: commentUpvotes.commentId })
        .from(commentUpvotes)
        .where(eq(commentUpvotes.userId, currentUserId));

      userUpvotes = new Set(upvotes.map(u => u.commentId));
    }

    // Map to CommentWithAuthor format
    const formattedComments: CommentWithAuthor[] = commentsWithData
      .filter(row => row.author !== null)
      .map(row => ({
        ...row.comment,
        author: row.author!,
        upvoteCount: row.upvoteCount,
        hasUserUpvoted: currentUserId ? userUpvotes.has(row.comment.id) : false,
      }));

    // Build tree structure for nested comments
    return buildCommentTree(formattedComments);
  } catch (error) {
    logger.error("Failed to get comments", { error, contentId });
    return [];
  }
}

/**
 * Build nested comment tree structure and filter out deleted comments without replies
 */
function buildCommentTree(comments: CommentWithAuthor[]): CommentWithAuthor[] {
  const commentMap = new Map<string, CommentWithAuthor>();
  const rootComments: CommentWithAuthor[] = [];

  // First pass: create map and initialize replies array
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build tree structure
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!;

    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId);
      if (parent) {
        parent.replies!.push(commentWithReplies);
      }
    } else {
      rootComments.push(commentWithReplies);
    }
  });

  // Third pass: filter out deleted comments without replies
  return filterDeletedComments(rootComments);
}

/**
 * Recursively filter out deleted comments that have no replies
 * Deleted comments with replies are kept to preserve thread structure
 */
function filterDeletedComments(comments: CommentWithAuthor[]): CommentWithAuthor[] {
  return comments
    .map(comment => ({
      ...comment,
      replies: comment.replies ? filterDeletedComments(comment.replies) : [],
    }))
    .filter(comment => {
      // Keep comment if it's not deleted
      if (!comment.isDeleted) return true;

      // Keep deleted comment if it has replies (preserves thread structure)
      return comment.replies && comment.replies.length > 0;
    });
}

/**
 * Get a single comment by ID with author info
 */
export async function getCommentById(commentId: string): Promise<Comment & { userId: string } | null> {
  try {
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    return comment || null;
  } catch (error) {
    logger.error("Failed to get comment by ID", { error, commentId });
    return null;
  }
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  userId: string,
  content: string
): Promise<Comment | null> {
  try {
    const [updated] = await db
      .update(comments)
      .set({
        content,
        isEdited: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(comments.id, commentId),
          eq(comments.userId, userId)
        )
      )
      .returning();

    if (updated) {
      logger.info("Comment updated", { commentId, userId });
      return updated;
    }

    return null;
  } catch (error) {
    logger.error("Failed to update comment", {
      error,
      commentId,
      userId,
    });
    return null;
  }
}

/**
 * Soft delete a comment
 */
export async function deleteComment(
  commentId: string,
  userId: string
): Promise<boolean> {
  try {
    const [deleted] = await db
      .update(comments)
      .set({
        isDeleted: true,
        content: "[deleted]",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(comments.id, commentId),
          eq(comments.userId, userId)
        )
      )
      .returning();

    if (deleted) {
      logger.info("Comment soft deleted", { commentId, userId });
      return true;
    }

    return false;
  } catch (error) {
    logger.error("Failed to delete comment", {
      error,
      commentId,
      userId,
    });
    return false;
  }
}

/**
 * Upvote a comment
 */
export async function upvoteComment(
  commentId: string,
  userId: string
): Promise<boolean> {
  try {
    // Check if already upvoted
    const existing = await db
      .select()
      .from(commentUpvotes)
      .where(
        and(
          eq(commentUpvotes.commentId, commentId),
          eq(commentUpvotes.userId, userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Already upvoted, do nothing
      return true;
    }

    await db.insert(commentUpvotes).values({
      commentId,
      userId,
    });

    logger.info("Comment upvoted", { commentId, userId });
    return true;
  } catch (error) {
    logger.error("Failed to upvote comment", {
      error,
      commentId,
      userId,
    });
    return false;
  }
}

/**
 * Remove upvote from a comment
 */
export async function removeUpvote(
  commentId: string,
  userId: string
): Promise<boolean> {
  try {
    await db
      .delete(commentUpvotes)
      .where(
        and(
          eq(commentUpvotes.commentId, commentId),
          eq(commentUpvotes.userId, userId)
        )
      );

    logger.info("Comment upvote removed", { commentId, userId });
    return true;
  } catch (error) {
    logger.error("Failed to remove upvote", {
      error,
      commentId,
      userId,
    });
    return false;
  }
}

/**
 * Get upvote count for a comment
 */
export async function getCommentUpvoteCount(commentId: string): Promise<number> {
  try {
    const result = await db
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(commentUpvotes)
      .where(eq(commentUpvotes.commentId, commentId));

    return result[0]?.count || 0;
  } catch (error) {
    logger.error("Failed to get upvote count", { error, commentId });
    return 0;
  }
}

/**
 * Check if user has upvoted a comment
 */
export async function hasUserUpvoted(
  commentId: string,
  userId: string
): Promise<boolean> {
  try {
    const result = await db
      .select()
      .from(commentUpvotes)
      .where(
        and(
          eq(commentUpvotes.commentId, commentId),
          eq(commentUpvotes.userId, userId)
        )
      )
      .limit(1);

    return result.length > 0;
  } catch (error) {
    logger.error("Failed to check upvote status", {
      error,
      commentId,
      userId,
    });
    return false;
  }
}
