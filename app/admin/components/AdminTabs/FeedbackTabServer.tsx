import { getAllFeedback } from "@/data-access/feedbackService";
import { FeedbackTab } from "./FeedbackTab";

export async function FeedbackTabServer() {
  const feedbackResult = await getAllFeedback(100, 0);
  const feedbackList = feedbackResult.status === 'success' ? feedbackResult.data : [];
  
  return <FeedbackTab feedbackList={feedbackList} />;
}
