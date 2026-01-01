import type { CommentWithAuthor as ServiceCommentWithAuthor } from "@eptss/data-access/services/commentService";

// Re-export the service type
export type CommentWithAuthor = ServiceCommentWithAuthor;

// Component prop types
export interface CommentSectionProps {
  userContentId?: string;
  roundId?: number;
  contentAuthorId?: string; // Optional - for notifying reflection authors on new comments
  currentUserId?: string | null; // Pass from server-side auth
  sortOrder?: 'asc' | 'desc'; // Optional - controls comment sort order (default: 'desc' - newest first)
  showHeader?: boolean; // Optional - whether to show the "Comments (count)" header (default: true)
  fillHeight?: boolean; // Optional - whether to fill parent height instead of using fixed 60vh (default: false)
  initialComments?: CommentWithAuthor[]; // Optional - pre-fetched comments to avoid re-fetching
  roundParticipants?: Array<{
    userId: string;
    username?: string;
    publicDisplayName?: string;
    profilePictureUrl?: string;
  }>; // Optional - pre-fetched participants to avoid re-fetching
  refetchTrigger?: number; // Optional - increment this value to trigger a refetch of comments
}

export interface CommentListProps {
  comments: CommentWithAuthor[];
  currentUserId: string;
  onCommentAdded?: () => void;
  roundParticipants?: Array<{
    userId: string;
    username?: string;
    publicDisplayName?: string;
    profilePictureUrl?: string;
  }>;
}

export interface CommentItemProps {
  comment: CommentWithAuthor;
  currentUserId: string;
  onCommentAdded?: () => void;
  depth?: number;
  roundParticipants?: Array<{
    userId: string;
    username?: string;
    publicDisplayName?: string;
    profilePictureUrl?: string;
  }>;
}

export interface CommentFormProps {
  parentCommentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialContent?: string;
  isEditing?: boolean;
  commentId?: string;
  roundParticipants?: Array<{
    userId: string;
    username?: string;
    publicDisplayName?: string;
    profilePictureUrl?: string;
  }>;
}

export interface UpvoteButtonProps {
  commentId: string;
  initialCount: number;
  initialUpvoted: boolean;
}
