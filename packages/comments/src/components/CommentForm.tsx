"use client";

import { useState, useRef } from "react";
import { createCommentAction, updateCommentAction } from "../actions";
import { useCommentContext } from "../context/CommentContext";
import type { CommentFormProps } from "../types";
import { Button, AlertBox, FormLabel } from "@eptss/ui";
import { CommentInput } from "./CommentInput";

export function CommentForm({
  parentCommentId,
  onSuccess,
  onCancel,
  initialContent = "",
  isEditing = false,
  commentId,
  roundParticipants = [],
}: CommentFormProps) {
  const { userContentId, roundId, contentAuthorId } = useCommentContext();
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formId = useRef(`comment-form-${Math.random().toString(36).substr(2, 9)}`);
  const errorId = useRef(`comment-error-${Math.random().toString(36).substr(2, 9)}`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = isEditing && commentId
        ? await updateCommentAction({ commentId, content })
        : await createCommentAction({
            userContentId,
            roundId,
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

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<any>) => {
    // Submit on Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (content.trim() && !isSubmitting) {
        handleSubmit(e as any);
      }
    }

    // Cancel on Escape
    if (e.key === 'Escape' && (onCancel || isEditing)) {
      e.preventDefault();
      handleCancel();
    }
  };

  const placeholderText = parentCommentId ? "Write a reply..." : "Share your thoughts...";
  const labelText = isEditing
    ? "Edit comment"
    : parentCommentId
      ? "Reply to comment"
      : "Add a comment";

  return (
    <form onSubmit={handleSubmit} className="space-y-3" aria-labelledby={formId.current}>
      <div className="space-y-1">
        <FormLabel htmlFor={formId.current} className="sr-only">
          {labelText}
        </FormLabel>
        <CommentInput
          id={formId.current}
          value={content}
          onChange={setContent}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          disabled={isSubmitting}
          roundParticipants={roundParticipants}
          aria-required={true}
          aria-invalid={!!error}
          aria-describedby={error ? errorId.current : undefined}
          aria-label={labelText}
          className="min-h-[60px] md:min-h-[100px]"
        />
        <p className="text-xs text-[var(--color-gray-400)] font-roboto">
          Tip: Press {typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enter to post • Type @ to mention someone
        </p>
      </div>
      {error && (
        <AlertBox
          id={errorId.current}
          variant="error"
          role="alert"
          aria-live="polite"
        >
          {error}
        </AlertBox>
      )}
      <div className="flex gap-2">
        <Button
          type="submit"
          variant="gradient"
          size="md"
          disabled={isSubmitting || !content.trim()}
          aria-label={isSubmitting ? "Submitting comment" : isEditing ? "Update comment" : "Post comment"}
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
            aria-label="Cancel editing"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
