# @eptss/comments

Comment and discussion system for EPTSS reflections.

## Features

- Threaded comment replies (nested discussions)
- Upvote system (heart/like functionality)
- Edit and delete capabilities
- Real-time optimistic UI updates
- Markdown support
- Notification integration

## Usage

```typescript
import { CommentSection } from '@eptss/comments';

// In your reflection page
<CommentSection
  contentId={reflection.id}
  contentAuthorId={reflection.userId}
/>
```

## Structure

- `/components` - React UI components
- `/actions` - Server actions for mutations
- `/hooks` - React hooks for data fetching
- `/types` - TypeScript type definitions
