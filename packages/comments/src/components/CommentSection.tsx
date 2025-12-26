"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import {
  Skeleton,
  AlertBox,
  Heading,
  GradientDivider,
} from "@eptss/ui";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import { getCommentsAction } from "../actions";
import { CommentProvider } from "../context/CommentContext";
import type { CommentSectionProps, CommentWithAuthor } from "../types";
import { getSignupsByRound } from "@eptss/data-access/services/signupService";

export function CommentSection({
  userContentId,
  roundId,
  contentAuthorId,
  currentUserId,
  sortOrder = 'desc',
  showHeader = true,
  fillHeight = false,
  initialComments,
  roundParticipants: initialRoundParticipants,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithAuthor[]>(initialComments || []);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!initialComments);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasInitiallyScrolled = useRef(false);
  const [roundParticipants, setRoundParticipants] = useState<Array<{
    userId: string;
    username?: string;
    publicDisplayName?: string;
    profilePictureUrl?: string;
  }>>(initialRoundParticipants || []);

  useEffect(() => {
    // Skip fetching if we already have initial data
    if (initialComments && initialRoundParticipants) {
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch comments if not provided
        if (!initialComments) {
          const commentsResult = await getCommentsAction({ userContentId, roundId }, sortOrder);
          if (commentsResult.success) {
            setComments(commentsResult.comments);
          } else {
            setError(commentsResult.error || "Failed to load comments");
          }
        }

        // Fetch round participants if roundId is provided and not already provided
        if (roundId && !initialRoundParticipants) {
          const signups = await getSignupsByRound(roundId);
          setRoundParticipants(signups.map(signup => ({
            userId: signup.userId,
            username: signup.username,
            publicDisplayName: signup.publicDisplayName,
            profilePictureUrl: signup.profilePictureUrl,
          })));
        }
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userContentId, roundId, sortOrder, initialComments, initialRoundParticipants]);

  // Scroll to bottom on initial load when using ascending order
  useEffect(() => {
    if (!isLoading && sortOrder === 'asc' && !hasInitiallyScrolled.current && scrollContainerRef.current) {
      // Use setTimeout to ensure DOM has rendered
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          hasInitiallyScrolled.current = true;
        }
      }, 50);
    }
  }, [isLoading, sortOrder]);

  const fetchComments = async () => {
    try {
      const result = await getCommentsAction({ userContentId, roundId }, sortOrder);
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
      <>
        {showHeader && (
          <div className="mb-6">
            <GradientDivider className="mb-6" />
            <Heading as="h2" className="flex items-center gap-3">
              <MessageCircle className="h-7 w-7 text-[var(--color-accent-primary)]" aria-hidden="true" />
              Comments
            </Heading>
          </div>
        )}
        <div
          className={`border border-[var(--color-gray-800)] rounded-lg bg-[var(--color-gray-900-40)] backdrop-blur-sm overflow-hidden ${fillHeight ? 'h-full' : 'min-h-[60vh]'}`}
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label="Loading comments"
        >
          <div className="p-6 space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <span className="sr-only">Loading comments...</span>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {showHeader && (
          <div className="mb-6">
            <GradientDivider className="mb-6" />
            <Heading as="h2" className="flex items-center gap-3">
              <MessageCircle className="h-7 w-7 text-[var(--color-accent-primary)]" aria-hidden="true" />
              Comments
            </Heading>
          </div>
        )}
        <div className={`border border-[var(--color-gray-800)] rounded-lg bg-[var(--color-gray-900-40)] backdrop-blur-sm p-6 ${fillHeight ? 'h-full' : 'min-h-[60vh]'} flex items-center justify-center`}>
          <AlertBox variant="error" role="alert" aria-live="assertive">
            {error}
          </AlertBox>
        </div>
      </>
    );
  }

  if (!currentUserId) {
    return (
      <CommentProvider userContentId={userContentId} roundId={roundId} contentAuthorId={contentAuthorId}>
        <>
          {/* Header with decorative line */}
          {showHeader && (
            <div className="mb-6">
              <GradientDivider className="mb-6" />
              <Heading as="h2" className="flex items-center gap-3">
                <MessageCircle className="h-7 w-7 text-[var(--color-accent-primary)]" aria-hidden="true" />
                Comments <span aria-label={`${comments.length} total comments`}>({comments.length})</span>
              </Heading>
            </div>
          )}

          {/* Scrollable comments container */}
          <div className={`relative border border-[var(--color-gray-800)] rounded-lg bg-[var(--color-gray-900-40)] backdrop-blur-sm overflow-hidden ${fillHeight ? 'h-full flex flex-col' : 'min-h-[60vh]'}`}>
            {/* Comments list - scrollable area */}
            <div
              ref={scrollContainerRef}
              className={`overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 ${fillHeight ? 'flex-1' : ''}`}
              style={{
                maxHeight: fillHeight ? undefined : '60vh',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgb(55, 65, 81) rgb(17, 24, 39)'
              }}
              role="region"
              aria-label="Comments list"
              tabIndex={0}
            >
              {comments.length > 0 ? (
                <div className="p-6">
                  <CommentList
                    comments={comments}
                    currentUserId=""
                    onCommentAdded={handleCommentAdded}
                    roundParticipants={roundParticipants}
                  />
                </div>
              ) : (
                <div className="p-12">
                  <p className="font-roboto text-[var(--color-gray-400)] text-center" role="status">
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
        </>
      </CommentProvider>
    );
  }

  return (
    <CommentProvider userContentId={userContentId} roundId={roundId} contentAuthorId={contentAuthorId}>
      <>
        {/* Header with decorative line */}
        {showHeader && (
          <div className="mb-6">
            <GradientDivider className="mb-6" />
            <Heading as="h2" className="flex items-center gap-3">
              <MessageCircle className="h-7 w-7 text-[var(--color-accent-primary)]" aria-hidden="true" />
              Comments <span aria-label={`${comments.length} total comments`}>({comments.length})</span>
            </Heading>
          </div>
        )}

        {/* Scrollable comments container with sticky input at bottom */}
        <div className={`relative border border-[var(--color-gray-800)] rounded-lg bg-[var(--color-gray-900-40)] backdrop-blur-sm overflow-hidden ${fillHeight ? 'h-full flex flex-col' : 'min-h-[60vh]'}`}>
          {/* Comments list - scrollable area */}
          <div
            ref={scrollContainerRef}
            className={`overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 ${fillHeight ? 'flex-1' : ''}`}
            style={{
              maxHeight: fillHeight ? undefined : '60vh',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgb(55, 65, 81) rgb(17, 24, 39)'
            }}
            role="region"
            aria-label="Comments list"
            tabIndex={0}
          >
            {comments.length > 0 ? (
              <div className="p-6">
                <CommentList
                  comments={comments}
                  currentUserId={currentUserId}
                  onCommentAdded={handleCommentAdded}
                  roundParticipants={roundParticipants}
                />
              </div>
            ) : (
              <div className="p-12">
                <p className="font-roboto text-[var(--color-gray-400)] text-center" role="status">
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
            <CommentForm onSuccess={handleCommentAdded} roundParticipants={roundParticipants} />
          </div>
        </div>
      </>
    </CommentProvider>
  );
}
