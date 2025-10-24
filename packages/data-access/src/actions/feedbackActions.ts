"use server";

import { createFeedback as createFeedbackService } from "../services/feedbackService";
import type { CreateFeedbackInput } from "../services/feedbackService";
import { revalidatePath } from "next/cache";

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
  try {
    const result = await createFeedbackService(input);
    
    // Revalidate the feedback page to show updated data
    revalidatePath('/feedback');
    
    if (result.status === 'success') {
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
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to submit feedback'
      };
    }
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return {
      status: "error",
      data: null,
      errorMessage: error instanceof Error ? error.message : "Failed to submit feedback",
    };
  }
}
