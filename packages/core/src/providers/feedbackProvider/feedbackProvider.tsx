"use server";

import {
  createFeedback,
  getAllFeedback,
  getPublicFeedback,
  getFeedbackById,
  getFeedbackByUserId,
  getFeedbackByType,
  updateFeedbackPublicStatus,
  deleteFeedback,
} from "../../services/feedbackService";

interface Props {
  userId?: string;
  feedbackType?: string;
  feedbackId?: string;
  publicOnly?: boolean;
}

export const feedbackProvider = async ({
  userId,
  feedbackType,
  feedbackId,
  publicOnly = false,
}: Props = {}) => {
  // If a specific feedback ID is provided, return that feedback
  if (feedbackId) {
    const feedbackResult = await getFeedbackById(feedbackId);
    return {
      feedback: feedbackResult.status === 'success' ? [feedbackResult.data] : [],
      createFeedback,
      updateFeedbackPublicStatus,
      deleteFeedback,
    };
  }

  // If a user ID is provided, return feedback for that user
  if (userId) {
    const feedbackResult = await getFeedbackByUserId(userId);
    return {
      feedback: feedbackResult.status === 'success' ? feedbackResult.data : [],
      createFeedback,
      updateFeedbackPublicStatus,
      deleteFeedback,
    };
  }

  // If a feedback type is provided, return feedback of that type
  if (feedbackType) {
    const feedbackResult = await getFeedbackByType(feedbackType as any);
    return {
      feedback: feedbackResult.status === 'success' ? feedbackResult.data : [],
      createFeedback,
      updateFeedbackPublicStatus,
      deleteFeedback,
    };
  }

  // Otherwise, return all feedback or public feedback based on the publicOnly flag
  const feedbackResult = publicOnly 
    ? await getPublicFeedback()
    : await getAllFeedback();

  return {
    feedback: feedbackResult.status === 'success' ? feedbackResult.data : [],
    createFeedback,
    updateFeedbackPublicStatus,
    deleteFeedback,
  };
};
