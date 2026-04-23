"use client";

import { Button } from "@eptss/ui";
import { MessageSquare, Eye, EyeOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { updateFeedbackPublicStatus, deleteFeedback } from "@eptss/actions";
import { useRouter } from "next/navigation";
import type { Feedback } from "@eptss/core";
import { DataTableCard } from "./DataTableCard";

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

  const headers = [
    { key: "type", label: "Type", sortable: true },
    { key: "content", label: "Content", sortable: false },
    { key: "userId", label: "User ID", sortable: true },
    { key: "createdAt", label: "Created", sortable: true },
    { key: "isPublic", label: "Public", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  const rows = feedbackList.map((feedback) => ({
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleTogglePublic(feedback.id, feedback.isPublic)}
          disabled={isUpdating === feedback.id}
          title={feedback.isPublic ? "Make Private" : "Make Public"}
        >
          {feedback.isPublic ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDelete(feedback.id)}
          disabled={isUpdating === feedback.id}
          className="text-red-400 hover:bg-red-500/20"
          title="Delete Feedback"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  }));

  return (
    <DataTableCard
      title="Feedback"
      icon={<MessageSquare className="mr-2" />}
      count={feedbackList.length}
      rows={rows}
      headers={headers}
      maxHeight={600}
      delay={0.2}
    />
  );
};
