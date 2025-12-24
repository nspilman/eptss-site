"use client";

import { CommentItem } from "./CommentItem";
import type { CommentListProps } from "../types";

export function CommentList({
  comments,
  currentUserId,
  onCommentAdded,
  roundParticipants = [],
  depth = 0,
}: CommentListProps & { depth?: number }) {
  if (comments.length === 0) {
    return null;
  }

  return (
    <ul
      className={depth === 0 ? "space-y-5 list-none" : "space-y-3 list-none"}
      role="list"
      aria-label={depth === 0 ? "Comments" : "Replies"}
    >
      {comments.map((comment) => (
        <li key={comment.id}>
          <CommentItem
            comment={comment}
            currentUserId={currentUserId}
            onCommentAdded={onCommentAdded}
            roundParticipants={roundParticipants}
            depth={depth}
          />
        </li>
      ))}
    </ul>
  );
}
