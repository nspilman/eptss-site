import { unstable_cache } from 'next/cache';
import { getAllFeedback } from "@eptss/core";
import { FeedbackTab } from "../AdminTabs/FeedbackTab";

import { Text } from "@eptss/ui";
// Cache feedback for 60 seconds
const getCachedFeedback = unstable_cache(
  async () => getAllFeedback(100, 0),
  ['feedback'],
  { revalidate: 60, tags: ['feedback'] }
);

export async function FeedbackTabServer() {
  try {
    const feedbackResult = await getCachedFeedback();
    const feedbackList = feedbackResult.status === 'success' ? feedbackResult.data : [];
    return <FeedbackTab feedbackList={feedbackList} />;
  } catch (error) {
    console.error('FeedbackTabServer: Error fetching feedback:', error);
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/50 rounded-lg">
        <h3 className="text-red-500 font-semibold mb-2">Error Loading Feedback</h3>
        <Text color="secondary">{error instanceof Error ? error.message : 'Unknown error'}</Text>
      </div>
    );
  }
}
