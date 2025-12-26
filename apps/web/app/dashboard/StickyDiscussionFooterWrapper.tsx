'use client';

import { StickyFooter } from '@eptss/ui';
import { MessageCircle } from 'lucide-react';
import { CommentSection } from '@eptss/comments';
import type { CommentWithAuthor } from '@eptss/comments/types';

interface StickyDiscussionFooterWrapperProps {
  roundId: number;
  currentUserId: string;
  initialComments: CommentWithAuthor[];
  roundParticipants: Array<{
    userId: string;
    username?: string;
    publicDisplayName?: string;
    profilePictureUrl?: string;
  }>;
}

export function StickyDiscussionFooterWrapper({
  roundId,
  currentUserId,
  initialComments,
  roundParticipants,
}: StickyDiscussionFooterWrapperProps) {
  return (
    <StickyFooter
      icon={MessageCircle}
      title="Discussions"
      height="70vh"
      defaultOpen={false}
      ariaLabel="Round discussions"
      contentClassName="h-full p-4"
    >
      <div className="h-full flex flex-col">
        <CommentSection
          roundId={roundId}
          currentUserId={currentUserId}
          sortOrder="asc"
          showHeader={false}
          fillHeight={true}
          initialComments={initialComments}
          roundParticipants={roundParticipants}
        />
      </div>
    </StickyFooter>
  );
}
