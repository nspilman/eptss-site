"use client";

import { CommentItem } from "./CommentItem";
import type { CommentListProps } from "../types";

export function CommentList({
  comments,
  currentUserId,
  onCommentAdded,
  depth = 0,
}: CommentListProps & { depth?: number }) {
  if (comments.length === 0) {
    return null;
  }

  return (
    <div className={depth === 0 ? "space-y-5" : "space-y-3"}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onCommentAdded={onCommentAdded}
          depth={depth}
        />
      ))}
    </div>
  );
}
