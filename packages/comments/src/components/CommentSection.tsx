"use client";

import { useState, useEffect, useRef } from "react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    // Scroll to bottom to show the new comment
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="w-20 h-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] mb-6"></div>
          <h2 className="font-fraunces text-[var(--color-primary)] font-bold text-2xl md:text-3xl flex items-center gap-3">
            <MessageCircle className="h-7 w-7 text-[var(--color-accent-primary)]" />
            Comments
          </h2>
        </div>
        <div className="border border-[var(--color-gray-800)] rounded-lg bg-[var(--color-gray-900-40)] backdrop-blur-sm overflow-hidden">
          <div className="p-6 space-y-4 animate-pulse">
            <div className="h-24 bg-[var(--color-gray-800)] rounded-lg"></div>
            <div className="h-32 bg-[var(--color-gray-800)] rounded-lg"></div>
            <div className="h-32 bg-[var(--color-gray-800)] rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="w-20 h-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] mb-6"></div>
          <h2 className="font-fraunces text-[var(--color-primary)] font-bold text-2xl md:text-3xl flex items-center gap-3">
            <MessageCircle className="h-7 w-7 text-[var(--color-accent-primary)]" />
            Comments
          </h2>
        </div>
        <div className="border border-[var(--color-gray-800)] rounded-lg bg-[var(--color-gray-900-40)] backdrop-blur-sm p-6">
          <p className="text-red-400 font-roboto text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <CommentProvider userContentId={userContentId} roundId={roundId} contentAuthorId={contentAuthorId}>
        <div className="max-w-3xl mx-auto">
          {/* Header with decorative line */}
          <div className="mb-6">
            <div className="w-20 h-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] mb-6"></div>
            <h2 className="font-fraunces text-[var(--color-primary)] font-bold text-2xl md:text-3xl flex items-center gap-3">
              <MessageCircle className="h-7 w-7 text-[var(--color-accent-primary)]" />
              Comments ({comments.length})
            </h2>
          </div>

          {/* Scrollable comments container */}
          <div className="relative border border-[var(--color-gray-800)] rounded-lg bg-[var(--color-gray-900-40)] backdrop-blur-sm overflow-hidden">
            {/* Comments list - scrollable area */}
            <div
              className="overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
              style={{
                maxHeight: '60vh',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgb(55, 65, 81) rgb(17, 24, 39)'
              }}
            >
              {comments.length > 0 ? (
                <div className="p-6">
                  <CommentList
                    comments={comments}
                    currentUserId=""
                    onCommentAdded={handleCommentAdded}
                  />
                </div>
              ) : (
                <div className="p-12">
                  <p className="font-roboto text-[var(--color-gray-400)] text-center">
                    No comments yet.
                  </p>
                </div>
              )}

              {/* Scroll fade indicator at bottom */}
              {comments.length > 3 && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--color-gray-900-40)] to-transparent" />
              )}
            </div>

            {/* Login prompt at bottom */}
            <div className="sticky bottom-0 border-t border-[var(--color-gray-700)] bg-[var(--color-gray-900)] backdrop-blur-md p-6 text-center">
              <p className="font-roboto text-[var(--color-gray-400)]">
                Please log in to leave a comment.
              </p>
            </div>
          </div>
        </div>
      </CommentProvider>
    );
  }

  return (
    <CommentProvider userContentId={userContentId} roundId={roundId} contentAuthorId={contentAuthorId}>
      <div className="max-w-3xl mx-auto">
        {/* Header with decorative line */}
        <div className="mb-6">
          <div className="w-20 h-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] mb-6"></div>
          <h2 className="font-fraunces text-[var(--color-primary)] font-bold text-2xl md:text-3xl flex items-center gap-3">
            <MessageCircle className="h-7 w-7 text-[var(--color-accent-primary)]" />
            Comments ({comments.length})
          </h2>
        </div>

        {/* Scrollable comments container with sticky input at bottom */}
        <div className="relative border border-[var(--color-gray-800)] rounded-lg bg-[var(--color-gray-900-40)] backdrop-blur-sm overflow-hidden">
          {/* Comments list - scrollable area */}
          <div
            ref={scrollContainerRef}
            className="overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
            style={{
              maxHeight: '60vh',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgb(55, 65, 81) rgb(17, 24, 39)'
            }}
          >
            {comments.length > 0 ? (
              <div className="p-6">
                <CommentList
                  comments={comments}
                  currentUserId={currentUserId}
                  onCommentAdded={handleCommentAdded}
                />
              </div>
            ) : (
              <div className="p-12">
                <p className="font-roboto text-[var(--color-gray-400)] text-center">
                  No comments yet. Be the first to share your thoughts!
                </p>
              </div>
            )}

            {/* Scroll fade indicator at bottom */}
            {comments.length > 3 && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--color-gray-900-40)] to-transparent" />
            )}
          </div>

          {/* Sticky comment input at bottom */}
          <div className="sticky bottom-0 border-t border-[var(--color-gray-700)] bg-[var(--color-gray-900)] backdrop-blur-md p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.3)]">
            <CommentForm onSuccess={handleCommentAdded} />
          </div>
        </div>
      </div>
    </CommentProvider>
  );
}
