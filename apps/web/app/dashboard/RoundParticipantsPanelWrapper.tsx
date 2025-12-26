"use client";

import { RoundParticipants } from '@eptss/rounds';
import type { PanelProps } from '@eptss/dashboard';
import type { RoundInfo } from '@eptss/data-access/types/round';
import { Card, CardContent, CardHeader, CardTitle, SectionHeader } from '@eptss/ui';
import { Users } from 'lucide-react';

interface ParticipantsData {
  roundInfo: RoundInfo;
  currentUserId?: string;
}

/**
 * Wrapper for RoundParticipants
 * Shows participant list or summary message
 */
export function RoundParticipantsPanelWrapper({ data, user }: PanelProps<ParticipantsData>) {
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
      <Card variant="glass" className="w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent-primary)' }}
            >
              <Users className="w-5 h-5 text-background-primary" />
            </div>
            <div>
              <CardTitle>Round Participants</CardTitle>
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

  // User is in the round - show full list with max height
  return (
    <div className="w-full space-y-3">
      <SectionHeader
        title="Participants"
        subtitle={`${uniqueParticipants.length} ${uniqueParticipants.length === 1 ? 'person' : 'people'}`}
        variant="accent-border"
        size="md"
      />
      {/* Constrain view with max-height and scroll */}
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
