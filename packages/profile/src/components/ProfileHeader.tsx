'use client';

import Link from 'next/link';
import { Badge, Avatar, AvatarFallback, AvatarImage, Button } from "@eptss/ui"
import { CalendarIcon, EnvelopeClosedIcon, ExternalLinkIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';

export interface User {
  userid: string;
  email: string;
  username: string | null;
  publicDisplayName: string | null;
  createdAt: Date | null;
  profilePictureUrl?: string | null;
}

interface ProfileHeaderProps {
  user: User;
  signupCount: number;
  submissionCount: number;
  voteCount: number;
}

export function ProfileHeader({ user, signupCount, submissionCount, voteCount }: ProfileHeaderProps) {
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Format join date
  const joinDate = user.createdAt
    ? format(new Date(user.createdAt), 'MMMM yyyy')
    : 'Unknown';

  return (
    <div className="relative overflow-hidden rounded-xl p-6 sm:p-8 backdrop-blur-xs border border-gray-800 bg-gray-900/50">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />

      <div className="relative z-10">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          {/* Avatar with glow effect */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <Avatar className="relative h-24 w-24 md:h-28 md:w-28 border-2 border-[var(--color-accent-primary)]">
              {user.profilePictureUrl && (
                <AvatarImage src={user.profilePictureUrl} alt={user.username || 'Profile picture'} />
              )}
              <AvatarFallback className="text-2xl md:text-3xl bg-gray-800 text-[var(--color-accent-primary)] font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)]">
                {user.username || 'Music Lover'}
              </h1>
              <Badge className="w-fit bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30 hover:bg-[var(--color-accent-primary)]/30">
                EPTSS Member
              </Badge>
            </div>

            {/* Contact & Join Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <EnvelopeClosedIcon className="size-4" />
                <span className="break-all">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4" />
                <span>Joined {joinDate}</span>
              </div>
            </div>

            {/* Stats with gradient borders */}
            <div className="flex flex-wrap gap-6 pt-3">
              <div className="flex flex-col">
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
                  {signupCount}
                </span>
                <span className="text-xs text-gray-400">Round{signupCount !== 1 ? 's' : ''} Joined</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
                  {submissionCount}
                </span>
                <span className="text-xs text-gray-400">Submission{submissionCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
                  {voteCount}
                </span>
                <span className="text-xs text-gray-400">Round{voteCount !== 1 ? 's' : ''} Voted</span>
              </div>
            </div>

            {/* View Public Profile Link */}
            {user.username && (
              <div className="pt-3">
                <Link href={`/profile/${user.username}`} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[var(--color-accent-primary)]/30 text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/10 hover:border-[var(--color-accent-primary)] transition-all"
                  >
                    <ExternalLinkIcon className="mr-2 h-4 w-4" />
                    View Public Profile
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
