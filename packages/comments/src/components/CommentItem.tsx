"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Heart, Pencil, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Button,
  UserAvatar,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tooltip,
} from "@eptss/ui";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import { MarkdownContent } from "./MarkdownContent";
import { deleteCommentAction, toggleUpvoteAction } from "../actions";
import type { CommentItemProps } from "../types";
import { getDisplayName } from "@eptss/shared";

const MAX_DEPTH = 3;

export function CommentItem({
  comment,
  currentUserId,
  onCommentAdded,
  roundParticipants = [],
  depth = 0,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(comment.hasUserUpvoted || false);
  const [upvoteCount, setUpvoteCount] = useState(comment.upvoteCount);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isAuthor = comment.userId === currentUserId;
  const isDeleted = comment.isDeleted;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const replyCount = comment.replies?.length || 0;

  // Count total replies (including nested)
  const countTotalReplies = (replies: typeof comment.replies): number => {
    if (!replies || replies.length === 0) return 0;
    return replies.reduce((total, reply) => {
      return total + 1 + countTotalReplies(reply.replies);
    }, 0);
  };

  const totalReplies = countTotalReplies(comment.replies);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteCommentAction({ commentId: comment.id });
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);

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

  const profileUrl = `/profile/${comment.author.username}`;

  return (
    <article
      id={`comment-${comment.id}`}
      className={`flex gap-4 ${depth > 0 ? "ml-0 sm:ml-6 md:ml-10" : ""}`}
      aria-label={`Comment by ${authorDisplayName}`}
    >
        {/* Avatar */}
        <Link
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 mt-0.5 group"
          aria-label={`View ${authorDisplayName}'s profile`}
        >
          <UserAvatar
            profilePictureUrl={comment.author.profilePictureUrl}
            displayName={authorDisplayName}
            size="sm"
            showHoverEffect
          />
        </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex-shrink-0 p-0.5 hover:bg-[var(--color-gray-800)] rounded transition-colors"
            aria-label={isCollapsed ? `Expand comment by ${authorDisplayName}` : `Collapse comment by ${authorDisplayName}`}
            aria-expanded={!isCollapsed}
            aria-controls={`comment-content-${comment.id}`}
          >
            {isCollapsed ? (
              <ChevronRight size={16} className="text-[var(--color-gray-400)]" aria-hidden="true" />
            ) : (
              <ChevronDown size={16} className="text-[var(--color-gray-400)]" aria-hidden="true" />
            )}
          </button>
          <Link
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-fraunces font-bold text-[var(--color-primary)] text-sm hover:text-[var(--color-accent-primary)] transition-colors cursor-pointer"
          >
            {authorDisplayName}
          </Link>
          <span className="text-xs font-roboto text-[var(--color-gray-400)]" aria-label={`Posted ${formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}`}>
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            {comment.isEdited && <span aria-label="This comment has been edited"> · edited</span>}
            {isCollapsed && totalReplies > 0 && ` · ${totalReplies} ${totalReplies === 1 ? 'reply' : 'replies'}`}
          </span>
        </div>

        {/* Comment content - hidden when collapsed */}
        {!isCollapsed && (
          <div id={`comment-content-${comment.id}`}>
            {/* Comment text or edit form */}
            {isEditing ? (
              <div className="mb-3">
                <CommentForm
                  onSuccess={handleEditSuccess}
                  onCancel={() => setIsEditing(false)}
                  initialContent={comment.content}
                  isEditing={true}
                  commentId={comment.id}
                  roundParticipants={roundParticipants}
                />
              </div>
            ) : (
              <div className="mb-3">
                {isDeleted ? (
                  <p className="text-[var(--color-gray-500)] italic" aria-label="This comment has been deleted">
                    [Comment deleted]
                  </p>
                ) : (
                  <MarkdownContent content={comment.content} />
                )}
              </div>
            )}

            {/* Actions */}
            {!isDeleted && !isEditing && (
              <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Comment actions">
                {upvoteCount > 0 && comment.upvoters && comment.upvoters.length > 0 ? (
                  <Tooltip
                    content={
                      <p className="text-xs">
                        {comment.upvoters
                          .map(upvoter => getDisplayName(upvoter))
                          .join(', ')}
                      </p>
                    }
                  >
                    <Button
                      variant="action"
                      size="action"
                      onClick={handleToggleUpvote}
                      disabled={isUpvoting}
                      className="group gap-2 font-medium"
                      aria-label={isUpvoted ? `Unlike comment. Current likes: ${upvoteCount}` : `Like comment. Current likes: ${upvoteCount}`}
                      aria-pressed={isUpvoted}
                    >
                      <Heart
                        size={16}
                        className={`transition-all duration-200 ${
                          isUpvoted
                            ? "fill-[var(--color-accent-primary)] text-[var(--color-accent-primary)]"
                            : "group-hover:text-[var(--color-accent-primary)]"
                        }`}
                        aria-hidden="true"
                      />
                      <span aria-label={`${upvoteCount} ${upvoteCount === 1 ? 'like' : 'likes'}`}>{upvoteCount}</span>
                    </Button>
                  </Tooltip>
                ) : (
                  <Button
                    variant="action"
                    size="action"
                    onClick={handleToggleUpvote}
                    disabled={isUpvoting}
                    className="group gap-2 font-medium"
                    aria-label={isUpvoted ? `Unlike comment. Current likes: ${upvoteCount}` : `Like comment. Current likes: ${upvoteCount}`}
                    aria-pressed={isUpvoted}
                  >
                    <Heart
                      size={16}
                      className={`transition-all duration-200 ${
                        isUpvoted
                          ? "fill-[var(--color-accent-primary)] text-[var(--color-accent-primary)]"
                          : "group-hover:text-[var(--color-accent-primary)]"
                      }`}
                      aria-hidden="true"
                    />
                    <span aria-label={`${upvoteCount} ${upvoteCount === 1 ? 'like' : 'likes'}`}>{upvoteCount}</span>
                  </Button>
                )}

                {depth < MAX_DEPTH && (
                  <Button
                    variant="action"
                    size="action"
                    onClick={() => setIsReplying(!isReplying)}
                    className="group gap-2 font-medium"
                    aria-label={isReplying ? "Cancel reply" : `Reply to ${authorDisplayName}'s comment`}
                    aria-expanded={isReplying}
                  >
                    <MessageCircle size={16} className="group-hover:text-[var(--color-accent-primary)] transition-colors duration-200" aria-hidden="true" />
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
                      aria-label="Edit your comment"
                    >
                      <Pencil size={16} className="group-hover:text-[var(--color-accent-primary)] transition-colors duration-200" aria-hidden="true" />
                      <span>Edit</span>
                    </Button>

                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="danger"
                          size="action"
                          className="font-medium"
                          aria-label="Delete your comment"
                        >
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Comment</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeleting}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="danger"
                            onClick={handleDelete}
                            disabled={isDeleting}
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>
            )}

            {/* Reply form */}
            {isReplying && (
              <div className="mt-4 pl-4 border-l-2 border-[var(--color-gray-800)]" role="region" aria-label={`Reply to ${authorDisplayName}`}>
                <CommentForm
                  parentCommentId={comment.id}
                  onSuccess={handleReplySuccess}
                  onCancel={() => setIsReplying(false)}
                  roundParticipants={roundParticipants}
                />
              </div>
            )}

            {/* Nested replies */}
            {hasReplies && (
              <div className="mt-5 space-y-5" role="region" aria-label={`${totalReplies} ${totalReplies === 1 ? 'reply' : 'replies'} to this comment`}>
                <CommentList
                  comments={comment.replies!}
                  currentUserId={currentUserId}
                  onCommentAdded={onCommentAdded}
                  roundParticipants={roundParticipants}
                  depth={depth + 1}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
