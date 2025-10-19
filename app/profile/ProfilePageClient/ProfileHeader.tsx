'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarIcon, EnvelopeClosedIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { Database } from '@/types/database';

type User = Database['public']['Tables']['users']['Row'];

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
  const joinDate = user.created_at 
    ? format(new Date(user.created_at), 'MMMM yyyy')
    : 'Unknown';

  return (
    <Card className="border-accent-secondary/20 bg-background-secondary">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 border-accent-primary shadow-[0px_0px_8px_2px_var(--color-accent-primary)]">
              <AvatarFallback className="text-xl md:text-2xl bg-background-tertiary text-accent-primary font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-primary">
                {user.username || 'Music Lover'}
              </h1>
              <Badge variant="secondary" className="w-fit bg-accent-primary/20 text-accent-primary border-accent-primary/30">
                EPTSS Member
              </Badge>
            </div>
            
            {/* Contact & Join Info */}
            <div className="flex flex-wrap gap-3 md:gap-4 text-sm text-accent-secondary">
              <div className="flex items-center gap-1.5">
                <EnvelopeClosedIcon className="size-4" />
                <span className="break-all">{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="size-4" />
                <span>Joined {joinDate}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-accent-primary">{signupCount}</span>
                <span className="text-xs text-accent-secondary">Round{signupCount !== 1 ? 's' : ''} Joined</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-accent-primary">{submissionCount}</span>
                <span className="text-xs text-accent-secondary">Submission{submissionCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-accent-primary">{voteCount}</span>
                <span className="text-xs text-accent-secondary">Round{voteCount !== 1 ? 's' : ''} Voted</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
