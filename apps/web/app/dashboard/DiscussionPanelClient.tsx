'use client';

import { CommentSection } from "@eptss/comments";
import { useRouteParams } from '../projects/[projectSlug]/ProjectContext';
import { useEffect, useState } from 'react';
import { roundProvider } from "@eptss/data-access";

interface DiscussionPanelClientProps {
  roundSlug: string;
  userId: string;
}

/**
 * Client component that fetches round data using projectId from context
 * This eliminates the need to pass projectId through panel data
 */
export function DiscussionPanelClient({ roundSlug, userId }: DiscussionPanelClientProps) {
  const { projectId } = useRouteParams();
  const [roundId, setRoundId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRound() {
      try {
        const round = await roundProvider({ slug: roundSlug, projectId });
        if (round) {
          setRoundId(round.roundId);
        }
      } catch (error) {
        console.error('Error fetching round:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRound();
  }, [roundSlug, projectId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 bg-[var(--color-gray-800)] rounded-lg"></div>
        <div className="h-32 bg-[var(--color-gray-800)] rounded-lg"></div>
        <div className="h-32 bg-[var(--color-gray-800)] rounded-lg"></div>
      </div>
    );
  }

  if (!roundId) {
    return null;
  }

  return (
    <CommentSection
      roundId={roundId}
      currentUserId={userId}
      sortOrder="asc"
      showHeader={false}
    />
  );
}
