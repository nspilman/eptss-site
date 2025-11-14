import { RoundParticipants } from '@eptss/rounds';
import type { PanelProps } from '@eptss/dashboard';
import type { RoundInfo } from '@eptss/data-access/types/round';

interface ParticipantsData {
  roundInfo: RoundInfo;
  currentUserId?: string;
}

/**
 * Wrapper to adapt RoundParticipants to the dashboard panel interface
 */
export function RoundParticipantsPanelWrapper({ data, user }: PanelProps<ParticipantsData>) {
  if (!data || !data.roundInfo) {
    return null;
  }

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
