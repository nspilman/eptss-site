import { RoundParticipants } from '@eptss/rounds';
import type { PanelProps } from '@eptss/dashboard';
import type { RoundInfo } from '@eptss/data-access/types/round';
import { Card, CardContent, CardHeader } from '@eptss/ui';
import { Users } from 'lucide-react';

interface ParticipantsData {
  roundInfo: RoundInfo;
  currentUserId?: string;
}

/**
 * Wrapper to adapt RoundParticipants to the dashboard panel interface
 * Shows full participant list if user is in the round, otherwise shows a summary
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

  // User is in the round, show full participant list
  return <RoundParticipants roundInfo={data.roundInfo} currentUserId={user?.id} />;
}

export function RoundParticipantsPanelSkeleton() {
  return (
    <div className="w-full bg-background-primary/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gray-800" />
        <div className="flex-1">
          <div className="h-5 bg-gray-800 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-800 rounded w-1/4" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-gray-800" />
            <div className="h-4 bg-gray-800 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
