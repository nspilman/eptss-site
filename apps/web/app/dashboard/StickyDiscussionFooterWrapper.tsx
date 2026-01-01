'use client';

import { useState } from 'react';
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
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Trigger a refetch when the panel opens
      setRefetchTrigger(prev => prev + 1);
    }
  };

  return (
    <StickyFooter
      icon={MessageCircle}
      title="Discussions"
      height="70vh"
      defaultOpen={false}
      ariaLabel="Round discussions"
      contentClassName="h-full flex flex-col"
      onOpenChange={handleOpenChange}
    >
      <CommentSection
        roundId={roundId}
        currentUserId={currentUserId}
        sortOrder="asc"
        showHeader={false}
        fillHeight={true}
        initialComments={initialComments}
        roundParticipants={roundParticipants}
        refetchTrigger={refetchTrigger}
      />
    </StickyFooter>
  );
}
