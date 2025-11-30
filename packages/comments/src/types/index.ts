import type { CommentWithAuthor as ServiceCommentWithAuthor } from "@eptss/data-access/services/commentService";

// Re-export the service type
export type CommentWithAuthor = ServiceCommentWithAuthor;

// Component prop types
export interface CommentSectionProps {
  userContentId?: string;
  roundId?: number;
  contentAuthorId?: string; // Optional - for notifying reflection authors on new comments
  currentUserId?: string | null; // Pass from server-side auth
}

export interface CommentListProps {
  comments: CommentWithAuthor[];
  currentUserId: string;
  onCommentAdded?: () => void;
}

export interface CommentItemProps {
  comment: CommentWithAuthor;
  currentUserId: string;
  onCommentAdded?: () => void;
  depth?: number;
}

export interface CommentFormProps {
  parentCommentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialContent?: string;
  isEditing?: boolean;
  commentId?: string;
}

export interface UpvoteButtonProps {
  commentId: string;
  initialCount: number;
  initialUpvoted: boolean;
}
