"use client";

import React from "react";
import { FeedbackFormContainer } from "@/components/feedback/FeedbackFormContainer";

interface FeedbackPageClientProps {
  userId: string | null;
}

export default function FeedbackPageClient({ userId }: FeedbackPageClientProps) {
  return (
      <div className="container mx-auto py-10 px-4 mt-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-[var(--color-primary)]">Feedback</h1>
          <FeedbackFormContainer
            userId={userId}
          />
        </div>
      </div>
  );
}
