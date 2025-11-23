import { Suspense } from "react";
import { Metadata } from 'next/types';
import { getAllFeedback } from "@eptss/data-access/services/feedbackService";
import { FeedbackCard } from "@eptss/admin";
import { Card, CardHeader, CardTitle, CardContent } from "@eptss/ui";

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

      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">All Feedback</CardTitle>
            <span className="text-sm text-secondary">
              {feedbackList.length} total entries
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {feedbackList.length === 0 ? (
            <p className="text-secondary text-center py-8">No feedback yet</p>
          ) : (
            <FeedbackCard feedbackList={feedbackList} />
          )}
        </CardContent>
      </Card>
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
