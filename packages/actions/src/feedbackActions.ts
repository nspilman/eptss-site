"use server";

import { createFeedback as createFeedbackService } from "@eptss/core/services/feedbackService";
import type { CreateFeedbackInput } from "@eptss/core";
import { revalidatePath } from "next/cache";
import { logger } from "@eptss/logger/server";

// Define a serializable response type
type SerializableFeedbackResponse = {
  status: 'success' | 'error';
  data?: {
    id: string;
    type: string;
    content: string;
    userId: string | null;
    createdAt: string;
    isPublic: boolean;
  } | null;
  errorMessage?: string;
};

export async function submitFeedback(input: CreateFeedbackInput): Promise<SerializableFeedbackResponse> {
  logger.action('submitFeedback', 'started', { type: input.type, userId: input.userId });

  try {
    const result = await createFeedbackService(input);

    // Revalidate the feedback page to show updated data
    revalidatePath('/feedback');

    if (result.status === 'success') {
      logger.action('submitFeedback', 'completed', {
        feedbackId: result.data.id,
        type: input.type,
        userId: input.userId
      });
      return {
        status: 'success',
        data: {
          id: result.data.id,
          type: result.data.type,
          content: result.data.content,
          userId: result.data.userId,
          createdAt: result.data.createdAt,
          isPublic: result.data.isPublic
        }
      };
    } else {
      logger.warn('Feedback submission returned error', {
        type: input.type,
        userId: input.userId,
        error: result.error?.message
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to submit feedback'
      };
    }
  } catch (error) {
    logger.action('submitFeedback', 'failed', {
      type: input.type,
      userId: input.userId,
      error: error instanceof Error ? error : undefined
    });
    return {
      status: "error",
      data: null,
      errorMessage: error instanceof Error ? error.message : "Failed to submit feedback",
    };
  }
}
