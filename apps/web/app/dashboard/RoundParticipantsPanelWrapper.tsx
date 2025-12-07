"use client";

import { useState } from 'react';
import { RoundParticipants } from '@eptss/rounds';
import type { PanelProps } from '@eptss/dashboard';
import type { RoundInfo } from '@eptss/data-access/types/round';
import { Card, CardContent, CardHeader, UserAvatar } from '@eptss/ui';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';
import { getDisplayName } from '@eptss/shared';

interface ParticipantsData {
  roundInfo: RoundInfo;
  currentUserId?: string;
}

/**
 * Collapsible wrapper for RoundParticipants
 * Shows compact summary by default, expands to show full list
 */
export function RoundParticipantsPanelWrapper({ data, user }: PanelProps<ParticipantsData>) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data || !data.roundInfo) {
    return null;
  }

  const { signups } = data.roundInfo;

  // Filter out signups without userId (unverified) and only show unique users
  const uniqueParticipants = signups
    .filter(signup => signup.userId)
    .reduce((acc, signup) => {
      if (!acc.find(p => p.userId === signup.userId)) {
        acc.push(signup);
      }
      return acc;
    }, [] as typeof signups);

  if (uniqueParticipants.length === 0) {
    return null;
  }

  // Check if current user is in the round
  const userIsInRound = user?.id && uniqueParticipants.some(p => p.userId === user.id);

  // If user is not in the round, show summary only
  if (!userIsInRound) {
    return (
      <Card className="w-full bg-background-primary/60 backdrop-blur-sm border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent-primary)' }}
            >
              <Users className="w-5 h-5 text-background-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary">Round Participants</h3>
              <p className="text-sm text-gray-400">
                {uniqueParticipants.length} {uniqueParticipants.length === 1 ? 'person' : 'people'} signed up
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            Sign up for this round to see all participants and connect with the community!
          </p>
        </CardContent>
      </Card>
    );
  }

  // User is in the round - show collapsible panel
  if (!isExpanded) {
    // Collapsed view - show count and first few avatars
    const previewParticipants = uniqueParticipants.slice(0, 5);

    return (
      <Card className="w-full bg-gray-900/30 backdrop-blur-sm border-gray-800 cursor-pointer hover:border-[var(--color-accent-primary)]/50 transition-colors">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full text-left"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-accent-primary)' }}
                >
                  <Users className="w-5 h-5 text-background-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-primary truncate">Participants</h3>
                  <p className="text-sm text-gray-400">
                    {uniqueParticipants.length} {uniqueParticipants.length === 1 ? 'person' : 'people'}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </CardHeader>
          <CardContent>
            {/* Preview avatars */}
            <div className="flex items-center gap-2 flex-wrap">
              {previewParticipants.map((participant) => (
                <div key={participant.userId} className="flex-shrink-0">
                  <UserAvatar
                    profilePictureUrl={participant.profilePictureUrl}
                    displayName={getDisplayName(participant)}
                    size="sm"
                  />
                </div>
              ))}
              {uniqueParticipants.length > 5 && (
                <div className="text-sm text-gray-400">
                  +{uniqueParticipants.length - 5}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Click to expand
            </p>
          </CardContent>
        </button>
      </Card>
    );
  }

  // Expanded view - show full list with collapse button and max height
  return (
    <div className="w-full space-y-3">
      <button
        onClick={() => setIsExpanded(false)}
        className="w-full flex items-center justify-between p-3 bg-background-primary/60 backdrop-blur-sm border border-gray-800 rounded-lg hover:border-[var(--color-accent-primary)]/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--color-accent-primary)' }}
          >
            <Users className="w-4 h-4 text-background-primary" />
          </div>
          <div className="text-left min-w-0">
            <h3 className="text-base font-bold text-primary truncate">Participants</h3>
            <p className="text-xs text-gray-400">
              {uniqueParticipants.length} {uniqueParticipants.length === 1 ? 'person' : 'people'}
            </p>
          </div>
        </div>
        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </button>
      {/* Constrain expanded view with max-height and scroll */}
      <div className="max-h-[60vh] overflow-y-auto">
        <RoundParticipants roundInfo={data.roundInfo} currentUserId={user?.id} />
      </div>
    </div>
  );
}

export function RoundParticipantsPanelSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gray-800" />
        <div className="flex-1">
          <div className="h-5 bg-gray-800 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-800 rounded w-1/4" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-gray-800" />
            <div className="h-4 bg-gray-800 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
