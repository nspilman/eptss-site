"use server";

import { db } from "@/db";
import { feedback, feedbackTypeEnum } from "@/db/schema";
import { eq, desc, and, or, sql } from "drizzle-orm";
import { AsyncResult, createSuccessResult, createEmptyResult, createErrorResult } from '@/types/asyncResult';
import { sanitizeHtml } from "@/utils/sanitize";

export interface Feedback {
  id: string;
  type: typeof feedbackTypeEnum.enumValues[number];
  content: string;
  userId: string | null;
  createdAt: string; // ISO string format
  isPublic: boolean;
}

export interface CreateFeedbackInput {
  type: typeof feedbackTypeEnum.enumValues[number];
  content: string;
  userId?: string;
  isPublic?: boolean;
}

// Map database feedback to Feedback interface
const mapToFeedback = (dbFeedback: any): Feedback => {
  return {
    id: dbFeedback.id,
    type: dbFeedback.type,
    content: dbFeedback.content,
    userId: dbFeedback.userId,
    createdAt: dbFeedback.createdAt instanceof Date ? 
      dbFeedback.createdAt.toISOString() : 
      new Date(dbFeedback.createdAt).toISOString(),
    isPublic: dbFeedback.isPublic,
  };
};

/**
 * Get all feedback entries with pagination
 * @param limit Maximum number of entries to return (default: 50)
 * @param offset Number of entries to skip (default: 0)
 */
export const getAllFeedback = async (limit = 50, offset = 0): Promise<AsyncResult<Feedback[]>> => {
  try {
    const result = await db
      .select()
      .from(feedback)
      .orderBy(desc(feedback.createdAt))
      .limit(limit)
      .offset(offset);
    
    if (!result.length) {
      return createEmptyResult('No feedback found');
    }

    const feedbackEntries = result.map(mapToFeedback);
    return createSuccessResult(feedbackEntries);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get feedback'));
  }
};

/**
 * Get public feedback entries with pagination
 * @param limit Maximum number of entries to return (default: 50)
 * @param offset Number of entries to skip (default: 0)
 */
export const getPublicFeedback = async (limit = 50, offset = 0): Promise<AsyncResult<Feedback[]>> => {
  try {
    const result = await db
      .select()
      .from(feedback)
      .where(eq(feedback.isPublic, true))
      .orderBy(desc(feedback.createdAt))
      .limit(limit)
      .offset(offset);
    
    if (!result.length) {
      return createEmptyResult('No public feedback found');
    }

    const feedbackEntries = result.map(mapToFeedback);
    return createSuccessResult(feedbackEntries);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get public feedback'));
  }
};

/**
 * Get feedback by ID
 */
export const getFeedbackById = async (id: string): Promise<AsyncResult<Feedback>> => {
  try {
    if (!id) {
      return createErrorResult(new Error('Invalid feedback ID'));
    }

    const result = await db
      .select()
      .from(feedback)
      .where(eq(feedback.id, id));
    
    if (!result.length) {
      return createEmptyResult(`No feedback found with ID ${id}`);
    }

    const feedbackEntry = mapToFeedback(result[0]);
    return createSuccessResult(feedbackEntry);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to get feedback with ID ${id}`));
  }
};

/**
 * Get feedback by user ID
 */
export const getFeedbackByUserId = async (userId: string): Promise<AsyncResult<Feedback[]>> => {
  try {
    if (!userId) {
      return createErrorResult(new Error('Invalid user ID'));
    }

    const result = await db
      .select()
      .from(feedback)
      .where(eq(feedback.userId, userId))
      .orderBy(desc(feedback.createdAt));
    
    if (!result.length) {
      return createEmptyResult(`No feedback found for user ${userId}`);
    }

    const feedbackEntries = result.map(mapToFeedback);
    return createSuccessResult(feedbackEntries);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to get feedback for user ${userId}`));
  }
};

/**
 * Get feedback by type
 */
export const getFeedbackByType = async (type: typeof feedbackTypeEnum.enumValues[number]): Promise<AsyncResult<Feedback[]>> => {
  try {
    if (!type) {
      return createErrorResult(new Error('Invalid feedback type'));
    }

    const result = await db
      .select()
      .from(feedback)
      .where(eq(feedback.type, type))
      .orderBy(desc(feedback.createdAt));
    
    if (!result.length) {
      return createEmptyResult(`No feedback found with type ${type}`);
    }

    const feedbackEntries = result.map(mapToFeedback);
    return createSuccessResult(feedbackEntries);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to get feedback with type ${type}`));
  }
};

/**
 * Create new feedback
 */
export const createFeedback = async (input: CreateFeedbackInput): Promise<AsyncResult<Feedback>> => {
  try {
    // Validate input
    if (!input.type || !input.content) {
      return createErrorResult(new Error('Type and content are required'));
    }

    // Validate that type is one of the allowed enum values
    if (!feedbackTypeEnum.enumValues.includes(input.type)) {
      return createErrorResult(new Error(`Invalid feedback type: ${input.type}`));
    }

    // Sanitize content to prevent XSS attacks
    const sanitizedContent = sanitizeHtml(input.content);

    const result = await db.insert(feedback).values({
      type: input.type,
      content: sanitizedContent,
      userId: input.userId || null,
      isPublic: input.isPublic || false,
    }).returning();

    if (!result.length) {
      return createErrorResult(new Error('Failed to create feedback'));
    }

    const createdFeedback = mapToFeedback(result[0]);
    return createSuccessResult(createdFeedback);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to create feedback'));
  }
};

/**
 * Update feedback public status
 */
export const updateFeedbackPublicStatus = async (id: string, isPublic: boolean): Promise<AsyncResult<Feedback>> => {
  try {
    if (!id) {
      return createErrorResult(new Error('Invalid feedback ID'));
    }

    const result = await db
      .update(feedback)
      .set({ isPublic })
      .where(eq(feedback.id, id))
      .returning();
    
    if (!result.length) {
      return createEmptyResult(`No feedback found with ID ${id}`);
    }

    const updatedFeedback = mapToFeedback(result[0]);
    return createSuccessResult(updatedFeedback);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to update feedback with ID ${id}`));
  }
};

/**
 * Delete feedback
 */
export const deleteFeedback = async (id: string): Promise<AsyncResult<boolean>> => {
  try {
    if (!id) {
      return createErrorResult(new Error('Invalid feedback ID'));
    }

    const result = await db
      .delete(feedback)
      .where(eq(feedback.id, id))
      .returning({ id: feedback.id });
    
    if (!result.length) {
      return createEmptyResult(`No feedback found with ID ${id}`);
    }

    return createSuccessResult(true);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to delete feedback with ID ${id}`));
  }
};
