// Export all service functions but NOT CommentWithAuthor (exported from types to avoid conflict)
export {
  createComment,
  updateComment,
  deleteComment,
  upvoteComment,
  removeUpvote,
  getCommentsByContentId,
  getCommentById,
  getCommentWithAssociation,
  getCommentUpvoteCount,
  hasUserUpvoted,
} from "./commentService";

// Export the type for direct service imports
export type { CommentWithAuthor } from "./commentService";
