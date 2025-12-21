'use client';

import { PanelProps } from '../types';
import { ProfileSetupCard } from '@eptss/profile';

interface ProfileSetupData {
  userId: string;
  username: string;
  publicDisplayName?: string | null;
  profilePictureUrl?: string | null;
}

/**
 * Profile Setup Panel - Shows profile setup card when user hasn't set their display name
 * Priority: primary (shows at top of dashboard)
 * Only displays if user hasn't set their publicDisplayName
 */
export function ProfileSetupPanel({ data }: PanelProps<ProfileSetupData>) {
  if (!data) {
    return null;
  }

  const { userId, username, publicDisplayName, profilePictureUrl } = data;

  // Don't show if user has manually set their display name
  // (if publicDisplayName is null or equals username, they haven't customized it yet)
  if (publicDisplayName && publicDisplayName !== username) {
    return null;
  }

  return (
    <ProfileSetupCard
      userId={userId}
      username={username}
      initialDisplayName={publicDisplayName ?? username}
      initialProfilePictureUrl={profilePictureUrl}
      variant="compact"
      onSuccess={() => {
        // Reload the page to update the dashboard
        window.location.reload();
      }}
    />
  );
}

export function ProfileSetupSkeleton() {
  return (
    <div className="relative group">
      {/* Rainbow gradient border effect */}
      <div className="absolute -inset-2 bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] rounded-2xl blur opacity-30 transition duration-500"></div>

      <div className="relative z-10 overflow-hidden rounded-xl bg-gray-900 p-8 border border-gray-800 animate-pulse">
        <div className="space-y-6">
          <div className="h-6 bg-gray-800 rounded w-1/3" />
          <div className="h-4 bg-gray-800 rounded w-2/3" />
          {/* Profile picture skeleton */}
          <div className="flex items-center gap-6 pb-6 border-b border-gray-700">
            <div className="w-24 h-24 rounded-full bg-gray-800" />
            <div className="space-y-2">
              <div className="h-9 bg-gray-800 rounded w-32" />
              <div className="h-3 bg-gray-800 rounded w-40" />
            </div>
          </div>
          {/* Display name skeleton */}
          <div className="h-10 bg-gray-800 rounded" />
          {/* Bio skeleton */}
          <div className="h-32 bg-gray-800 rounded" />
          {/* Button skeleton */}
          <div className="h-10 bg-gray-800 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}
