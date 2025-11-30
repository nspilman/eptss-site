"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import { getCommentsAction } from "../actions";
import { CommentProvider } from "../context/CommentContext";
import type { CommentSectionProps, CommentWithAuthor } from "../types";

export function CommentSection({
  userContentId,
  roundId,
  contentAuthorId,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const result = await getCommentsAction({ userContentId, roundId });
        if (result.success) {
          setComments(result.comments);
        } else {
          setError(result.error || "Failed to load comments");
        }
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [userContentId, roundId]);

  const fetchComments = async () => {
    try {
      const result = await getCommentsAction({ userContentId, roundId });
      if (result.success) {
        setComments(result.comments);
      } else {
        setError(result.error || "Failed to load comments");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  const handleCommentAdded = () => {
    fetchComments();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="w-20 h-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] mb-6"></div>
          <h2 className="font-fraunces text-[var(--color-primary)] font-bold text-2xl md:text-3xl flex items-center gap-3">
            <MessageCircle className="h-7 w-7 text-[var(--color-accent-primary)]" />
            Comments
          </h2>
        </div>
        <div className="space-y-4 animate-pulse">
          <div className="h-24 bg-[var(--color-gray-900-40)] rounded-lg"></div>
          <div className="h-32 bg-[var(--color-gray-900-40)] rounded-lg"></div>
          <div className="h-32 bg-[var(--color-gray-900-40)] rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="w-20 h-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] mb-6"></div>
          <h2 className="font-fraunces text-[var(--color-primary)] font-bold text-2xl md:text-3xl flex items-center gap-3">
            <MessageCircle className="h-7 w-7 text-[var(--color-accent-primary)]" />
            Comments
          </h2>
        </div>
        <p className="text-red-400 font-roboto">{error}</p>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <CommentProvider userContentId={userContentId} roundId={roundId} contentAuthorId={contentAuthorId}>
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="w-20 h-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] mb-6"></div>
            <h2 className="font-fraunces text-[var(--color-primary)] font-bold text-2xl md:text-3xl flex items-center gap-3">
              <MessageCircle className="h-7 w-7 text-[var(--color-accent-primary)]" />
              Comments ({comments.length})
            </h2>
          </div>
          {comments.length > 0 && (
            <CommentList
              comments={comments}
              currentUserId=""
              onCommentAdded={handleCommentAdded}
            />
          )}
          <p className="font-roboto text-[var(--color-gray-400)] text-center py-8 border-t border-[var(--color-gray-800)] mt-8">
            Please log in to leave a comment.
          </p>
        </div>
      </CommentProvider>
    );
  }

  return (
    <CommentProvider userContentId={userContentId} roundId={roundId} contentAuthorId={contentAuthorId}>
      <div className="space-y-8 max-w-3xl mx-auto">
        {/* Header with decorative line */}
        <div className="mb-8">
          <div className="w-20 h-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] mb-6"></div>
          <h2 className="font-fraunces text-[var(--color-primary)] font-bold text-2xl md:text-3xl flex items-center gap-3">
            <MessageCircle className="h-7 w-7 text-[var(--color-accent-primary)]" />
            Comments ({comments.length})
          </h2>
        </div>

        {/* Comment form */}
        <CommentForm onSuccess={handleCommentAdded} />

        {/* Comments list */}
        {comments.length > 0 ? (
          <div className="border-t border-[var(--color-gray-800)] pt-8">
            <CommentList
              comments={comments}
              currentUserId={currentUserId}
              onCommentAdded={handleCommentAdded}
            />
          </div>
        ) : (
          <p className="font-roboto text-[var(--color-gray-400)] text-center py-12 border-t border-[var(--color-gray-800)]">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </CommentProvider>
  );
}
