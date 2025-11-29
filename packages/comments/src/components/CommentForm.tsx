"use client";

import { useState } from "react";
import { createCommentAction, updateCommentAction } from "../actions";
import type { CommentFormProps } from "../types";
import { Button } from "@eptss/ui";

export function CommentForm({
  contentId,
  parentCommentId,
  contentAuthorId,
  onSuccess,
  onCancel,
  initialContent = "",
  isEditing = false,
  commentId,
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = isEditing && commentId
        ? await updateCommentAction({ commentId, content })
        : await createCommentAction({
            contentId,
            content,
            parentCommentId,
            contentAuthorId: contentAuthorId || undefined
          });

      if (result.success) {
        setContent("");
        onSuccess?.();
      } else {
        setError(result.error || "Failed to submit comment");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent(initialContent);
    setError(null);
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
        placeholder={parentCommentId ? "Write a reply..." : "Share your thoughts..."}
        className="w-full min-h-[100px] px-4 py-3 rounded-lg bg-[var(--color-gray-900-40)] border border-[var(--color-gray-700)] text-[var(--color-primary)] font-roboto text-base placeholder:text-[var(--color-gray-400)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:border-transparent transition-all duration-200 resize-none"
        disabled={isSubmitting}
      />
      {error && <p className="text-sm text-red-400 font-roboto">{error}</p>}
      <div className="flex gap-2">
        <Button
          type="submit"
          variant="gradient"
          size="md"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? "Submitting..." : isEditing ? "Update" : "Post Comment"}
        </Button>
        {(onCancel || isEditing) && (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
