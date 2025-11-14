"use client";

import { useState } from "react";
import { createCommentAction, updateCommentAction } from "../actions";
import type { CommentFormProps } from "../types";

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
            contentAuthorId
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
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] text-white font-roboto font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200 shadow-sm"
        >
          {isSubmitting ? "Submitting..." : isEditing ? "Update" : "Post Comment"}
        </button>
        {(onCancel || isEditing) && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-[var(--color-gray-700)] text-[var(--color-gray-400)] font-roboto font-semibold text-sm hover:text-[var(--color-primary)] hover:border-[var(--color-gray-600)] disabled:opacity-50 transition-all duration-200"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
