"use client";

import { CommentItem } from "./CommentItem";
import type { CommentWithAuthor } from "../types";

interface CommentListProps {
  comments: CommentWithAuthor[];
  contentId: string;
  currentUserId: string;
  onCommentAdded?: () => void;
  depth?: number;
}

export function CommentList({
  comments,
  contentId,
  currentUserId,
  onCommentAdded,
  depth = 0,
}: CommentListProps) {
  if (comments.length === 0) {
    return null;
  }

  return (
    <div className={depth === 0 ? "space-y-5" : "space-y-3"}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          contentId={contentId}
          currentUserId={currentUserId}
          onCommentAdded={onCommentAdded}
          depth={depth}
        />
      ))}
    </div>
  );
}
