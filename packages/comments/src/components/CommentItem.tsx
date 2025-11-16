"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Heart, Pencil } from "lucide-react";
import { Button } from "@eptss/ui";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import { deleteCommentAction, toggleUpvoteAction } from "../actions";
import type { CommentItemProps } from "../types";
import { getInitials, getDisplayName } from "@eptss/shared";

const MAX_DEPTH = 3;

export function CommentItem({
  comment,
  contentId,
  currentUserId,
  onCommentAdded,
  depth = 0,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(comment.hasUserUpvoted || false);
  const [upvoteCount, setUpvoteCount] = useState(comment.upvoteCount);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const isAuthor = comment.userId === currentUserId;
  const isDeleted = comment.isDeleted;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setIsDeleting(true);
    const result = await deleteCommentAction({ commentId: comment.id });
    setIsDeleting(false);

    if (result.success) {
      onCommentAdded?.();
    }
  };

  const handleReplySuccess = () => {
    setIsReplying(false);
    onCommentAdded?.();
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    onCommentAdded?.();
  };

  const handleToggleUpvote = async () => {
    if (isUpvoting) return;

    const newIsUpvoted = !isUpvoted;
    const newCount = newIsUpvoted ? upvoteCount + 1 : upvoteCount - 1;

    setIsUpvoted(newIsUpvoted);
    setUpvoteCount(newCount);
    setIsUpvoting(true);

    try {
      const result = await toggleUpvoteAction({
        commentId: comment.id,
        currentlyUpvoted: isUpvoted,
      });

      if (!result.success) {
        setIsUpvoted(isUpvoted);
        setUpvoteCount(upvoteCount);
      }
    } catch (error) {
      setIsUpvoted(isUpvoted);
      setUpvoteCount(upvoteCount);
    } finally {
      setIsUpvoting(false);
    }
  };

  const authorDisplayName = getDisplayName(comment.author);

  return (
    <div id={`comment-${comment.id}`} className={`flex gap-4 ${depth > 0 ? "ml-0 sm:ml-6 md:ml-10" : ""}`}>
      {/* Avatar */}
      <div
        className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-0.5 shadow-lg"
        aria-label={`${authorDisplayName}'s avatar`}
      >
        {comment.author.profilePictureUrl ? (
          <img
            src={comment.author.profilePictureUrl}
            alt={authorDisplayName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getInitials(authorDisplayName)
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-3 mb-2 flex-wrap">
          <span className="font-fraunces font-bold text-[var(--color-primary)] text-sm">
            {authorDisplayName}
          </span>
          <span className="text-xs font-roboto text-[var(--color-gray-400)]">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            {comment.isEdited && " · edited"}
          </span>
        </div>

        {/* Comment text or edit form */}
        {isEditing ? (
          <div className="mb-3">
            <CommentForm
              contentId={contentId}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditing(false)}
              initialContent={comment.content}
              isEditing={true}
              commentId={comment.id}
            />
          </div>
        ) : (
          <p className="font-roboto text-[var(--color-primary)] text-base leading-relaxed mb-3 whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {/* Actions */}
        {!isDeleted && !isEditing && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="action"
              size="action"
              onClick={handleToggleUpvote}
              disabled={isUpvoting}
              className="group gap-2 font-medium"
              aria-label={isUpvoted ? "Unlike" : "Like"}
            >
              <Heart
                size={16}
                className={`transition-all duration-200 ${
                  isUpvoted
                    ? "fill-[var(--color-accent-primary)] text-[var(--color-accent-primary)]"
                    : "group-hover:text-[var(--color-accent-primary)]"
                }`}
              />
              <span>{upvoteCount}</span>
            </Button>

            {depth < MAX_DEPTH && (
              <Button
                variant="action"
                size="action"
                onClick={() => setIsReplying(!isReplying)}
                className="group gap-2 font-medium"
              >
                <MessageCircle size={16} className="group-hover:text-[var(--color-accent-primary)] transition-colors duration-200" />
                <span>Reply</span>
              </Button>
            )}

            {isAuthor && !isDeleted && (
              <>
                <Button
                  variant="action"
                  size="action"
                  onClick={() => setIsEditing(true)}
                  className="group gap-2 font-medium"
                >
                  <Pencil size={16} className="group-hover:text-[var(--color-accent-primary)] transition-colors duration-200" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="danger"
                  size="action"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="font-medium"
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        )}

        {/* Reply form */}
        {isReplying && (
          <div className="mt-4 pl-4 border-l-2 border-[var(--color-gray-800)]">
            <CommentForm
              contentId={contentId}
              parentCommentId={comment.id}
              onSuccess={handleReplySuccess}
              onCancel={() => setIsReplying(false)}
            />
          </div>
        )}

        {/* Nested replies */}
        {hasReplies && (
          <div className="mt-5 space-y-5">
            <CommentList
              comments={comment.replies!}
              contentId={contentId}
              currentUserId={currentUserId}
              onCommentAdded={onCommentAdded}
              depth={depth + 1}
            />
          </div>
        )}
      </div>
    </div>
  );
}
