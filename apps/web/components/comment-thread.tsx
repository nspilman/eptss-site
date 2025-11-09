import { useState } from "react"
import Comment from "./comment"

const INITIAL_COMMENTS = [
  {
    id: "1",
    author: "Sarah Chen",
    avatar: "SC",
    timestamp: "2 hours ago",
    content:
      "This is a fascinating perspective on design systems. The way you've structured the hierarchy really reminds me of how optimal organization meets exquisite design.",
    likes: 47,
    liked: false,
    replies: [
      {
        id: "1-1",
        author: "Alex Rodriguez",
        avatar: "AR",
        timestamp: "1 hour ago",
        content: "Totally agree. The principles here could be applied across so many domains beyond design.",
        likes: 12,
        liked: false,
        replies: [
          {
            id: "1-1-1",
            author: "Sarah Chen",
            avatar: "SC",
            timestamp: "45 minutes ago",
            content:
              "Exactly! That's what makes it so powerful—these aren't just design patterns, they're universal principles.",
            likes: 8,
            liked: false,
            replies: [],
          },
        ],
      },
      {
        id: "1-2",
        author: "Jordan Kim",
        avatar: "JK",
        timestamp: "1 hour ago",
        content: "The visual example really helps clarify the concept. Well done!",
        likes: 5,
        liked: false,
        replies: [],
      },
    ],
  },
  {
    id: "2",
    author: "Michael Park",
    avatar: "MP",
    timestamp: "1 hour ago",
    content:
      "I found the section on precision and repeatability particularly insightful. How did you approach testing these principles in practice?",
    likes: 23,
    liked: false,
    replies: [
      {
        id: "2-1",
        author: "Sarah Chen",
        avatar: "SC",
        timestamp: "30 minutes ago",
        content:
          "Great question! We used a combination of user testing and iterative refinement. The key was maintaining consistency while allowing for flexibility.",
        likes: 18,
        liked: false,
        replies: [],
      },
    ],
  },
]

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

export default function CommentThread() {
  const [comments, setComments] = useState<CommentData[]>(INITIAL_COMMENTS)

  const toggleLike = (commentId: string, parentId: string | null = null) => {
    const updateComments = (items: CommentData[]): CommentData[] => {
      return items.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            liked: !comment.liked,
            likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
          }
        }
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateComments(comment.replies),
          }
        }
        return comment
      })
    }

    setComments(updateComments(comments))
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} onToggleLike={toggleLike} depth={0} />
      ))}
    </div>
  )
}
