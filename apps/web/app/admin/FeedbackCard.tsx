"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@eptss/ui";
import { MessageSquare, Eye, EyeOff, Trash2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { useState } from "react";
import { updateFeedbackPublicStatus, deleteFeedback } from "@/data-access/feedbackService";
import { useRouter } from "next/navigation";
import type { Feedback } from "@/data-access/feedbackService";

type FeedbackCardProps = {
  feedbackList: Feedback[];
};

export const FeedbackCard = ({ feedbackList = [] }: FeedbackCardProps) => {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleTogglePublic = async (id: string, currentStatus: boolean) => {
    setIsUpdating(id);
    try {
      await updateFeedbackPublicStatus(id, !currentStatus);
      router.refresh();
    } catch (error) {
      console.error("Failed to update feedback status:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) {
      return;
    }
    
    setIsUpdating(id);
    try {
      await deleteFeedback(id);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete feedback:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const feedbackHeaders = [
    { key: "type", label: "Type", sortable: true },
    { key: "content", label: "Content", sortable: false },
    { key: "userId", label: "User ID", sortable: true },
    { key: "createdAt", label: "Created", sortable: true },
    { key: "isPublic", label: "Public", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  const feedbackRows = feedbackList.map((feedback) => ({
    type: (
      <span className="px-2 py-1 rounded text-xs font-semibold bg-accent-primary/20 text-accent-primary">
        {feedback.type}
      </span>
    ),
    content: (
      <div className="max-w-md truncate" title={feedback.content}>
        {feedback.content}
      </div>
    ),
    userId: feedback.userId ? (
      <span className="text-xs font-mono">{feedback.userId.slice(0, 8)}...</span>
    ) : (
      <span className="text-gray-500 italic">Anonymous</span>
    ),
    createdAt: new Date(feedback.createdAt).toLocaleDateString(),
    isPublic: feedback.isPublic ? (
      <span className="text-green-400">✓</span>
    ) : (
      <span className="text-gray-500">✗</span>
    ),
    actions: (
      <div className="flex gap-2">
        <button
          onClick={() => handleTogglePublic(feedback.id, feedback.isPublic)}
          disabled={isUpdating === feedback.id}
          className="p-1 hover:bg-accent-primary/20 rounded transition-colors disabled:opacity-50"
          title={feedback.isPublic ? "Make Private" : "Make Public"}
        >
          {feedback.isPublic ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={() => handleDelete(feedback.id)}
          disabled={isUpdating === feedback.id}
          className="p-1 hover:bg-red-500/20 rounded transition-colors disabled:opacity-50 text-red-400"
          title="Delete Feedback"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
  }));

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-gray-800/50 backdrop-blur-md border-gray-700/50 hover:bg-gray-800/70 transition-colors h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-white">
              <MessageSquare className="mr-2" />
              Feedback
            </CardTitle>
            <span className="text-sm text-gray-400">
              {feedbackList.length} total
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-700/50">
            <DataTable rows={feedbackRows} headers={feedbackHeaders} maxHeight={600} allowCopy={true} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
