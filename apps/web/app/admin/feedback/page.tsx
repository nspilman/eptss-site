import { Suspense } from "react";
import { Metadata } from 'next/types';
import { getAllFeedback } from "@eptss/data-access/services/feedbackService";
import { FeedbackCard } from "@eptss/admin";

export const metadata: Metadata = {
  title: "Feedback Management | Admin",
  description: "Manage user feedback",
};

async function FeedbackContent() {
  const feedbackResult = await getAllFeedback();
  const feedbackList = feedbackResult.status === 'success' ? feedbackResult.data : [];

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div>
        <h2 className="text-3xl font-bold text-primary mb-2">Feedback Management</h2>
        <p className="text-secondary">
          View and moderate user feedback on submissions
        </p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-primary">
          <strong>Note:</strong> You can toggle feedback visibility to make it public or private, 
          or delete inappropriate feedback entirely.
        </p>
      </div>

      <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-primary">All Feedback</h3>
          <span className="text-sm text-secondary">
            {feedbackList.length} total entries
          </span>
        </div>
        {feedbackList.length === 0 ? (
          <p className="text-secondary text-center py-8">No feedback yet</p>
        ) : (
          <FeedbackCard feedbackList={feedbackList} />
        )}
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="h-96 bg-background-secondary/30 animate-pulse rounded" />}>
      <FeedbackContent />
    </Suspense>
  );
}
