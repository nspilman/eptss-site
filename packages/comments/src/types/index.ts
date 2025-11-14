import type { CommentWithAuthor as ServiceCommentWithAuthor } from "@eptss/data-access/services/commentService";

// Re-export the service type
export type CommentWithAuthor = ServiceCommentWithAuthor;

// Component prop types
export interface CommentSectionProps {
  contentId: string;
  contentAuthorId: string;
  currentUserId?: string | null; // Pass from server-side auth
}

export interface CommentListProps {
  comments: CommentWithAuthor[];
  contentId: string;
  currentUserId: string;
  onCommentAdded?: () => void;
}

export interface CommentItemProps {
  comment: CommentWithAuthor;
  contentId: string;
  currentUserId: string;
  onCommentAdded?: () => void;
  depth?: number;
}

export interface CommentFormProps {
  contentId: string;
  parentCommentId?: string;
  contentAuthorId?: string; // For notifying content author on new top-level comments
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
