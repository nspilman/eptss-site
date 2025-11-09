"use client"

import { Heart, MessageCircle } from "lucide-react"
import { useState } from "react"

interface CommentData {
  id: string
  author: string
  avatar: string
  timestamp: string
  content: string
  likes: number
  liked: boolean
  replies: CommentData[]
}

interface CommentProps {
  comment: CommentData
  onToggleLike: (commentId: string, parentId: string | null) => void
  depth: number
}

export default function Comment({ comment, onToggleLike, depth }: CommentProps) {
  const [showReplies, setShowReplies] = useState(true)
  const hasReplies = comment.replies.length > 0
  const maxDepth = 3

  return (
    <div className={`flex gap-4 ${depth > 0 ? "ml-0 sm:ml-6 md:ml-10" : ""}`}>
      {/* Avatar */}
      <div
        className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-medium text-primary-foreground flex-shrink-0 mt-0.5"
        aria-label={`${comment.author}'s avatar`}
      >
        {comment.avatar}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-semibold text-foreground text-sm">{comment.author}</span>
          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
        </div>

        {/* Comment text */}
        <p className="text-foreground text-sm leading-relaxed mb-3 text-balance">{comment.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onToggleLike(comment.id, null)}
            className="group flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label={comment.liked ? "Unlike" : "Like"}
          >
            <Heart
              size={16}
              className={`transition-all ${
                comment.liked ? "fill-destructive text-destructive" : "group-hover:text-foreground"
              }`}
            />
            <span className="font-medium">{comment.likes}</span>
          </button>

          {depth < maxDepth && (
            <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group">
              <MessageCircle size={16} className="group-hover:text-foreground" />
              <span className="font-medium">Reply</span>
            </button>
          )}
        </div>

        {/* Nested replies */}
        {hasReplies && (
          <div className="mt-5 space-y-5">
            {showReplies &&
              comment.replies.map((reply) => (
                <Comment key={reply.id} comment={reply} onToggleLike={onToggleLike} depth={depth + 1} />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
