'use client';

import { PanelProps } from '../types';
import { InviteFriendsCard } from '@eptss/referrals';

interface InviteFriendsData {
  userId: string;
  projectSlug?: string;
  roundSlug?: string;
}

/**
 * Invite Friends Panel - Shows at the bottom of the dashboard
 * Encourages users to invite friends and grow the community
 */
export function InviteFriendsPanel({ data }: PanelProps<InviteFriendsData>) {
  if (!data) {
    return null;
  }

  return <InviteFriendsCard userId={data.userId} projectSlug={data.projectSlug} roundSlug={data.roundSlug} />;
}

export function InviteFriendsSkeleton() {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] rounded-2xl blur opacity-20"></div>

      <div className="relative z-10 overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 border border-gray-700 animate-pulse">
        <div className="flex items-start gap-6">
          <div className="w-14 h-14 rounded-full bg-gray-700"></div>
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            <div className="h-10 bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
