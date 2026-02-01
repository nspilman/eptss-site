"use client";

import React from "react";
import { FeedbackForm } from "./FeedbackForm";
import { useRouter } from "next/navigation";
import { submitFeedback } from "@eptss/actions";

import { Text } from "@eptss/ui";
interface FeedbackFormContainerProps {
  userId?: string | null;
}

export function FeedbackFormContainer({
  userId,
}: FeedbackFormContainerProps) {
  const router = useRouter();

  const handleSuccess = () => {
    // Refresh the page or navigate somewhere
    router.refresh();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-background-primary rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-primary">Share Your Feedback</h2>
      <Text color="secondary" className="mb-6">
        We value your input! Please use this form to share your thoughts, report bugs, or suggest new features.
      </Text>
      <FeedbackForm
        userId={userId}
        onSuccess={handleSuccess}
        createFeedback={submitFeedback}
      />
    </div>
  );
}
