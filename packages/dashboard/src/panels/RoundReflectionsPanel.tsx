import { PanelProps } from '../types';
import { RoundReflections } from '@eptss/user-content';

interface RoundReflectionsData {
  roundId: number;
}

/**
 * Round Reflections Panel - Shows all public reflections for the current round
 * Priority: tertiary (shows at bottom of dashboard)
 * Only displays if user is in current round
 */
export function RoundReflectionsPanel({ data }: PanelProps<RoundReflectionsData>) {
  if (!data?.roundId) {
    return null;
  }

  return <RoundReflections roundId={data.roundId} />;
}

export function RoundReflectionsSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-900/50 p-6 sm:p-8 backdrop-blur-xs border border-gray-800 animate-pulse">
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-gray-800 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-800 rounded w-2/3" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg p-4 border border-gray-800 bg-gray-900/50">
              <div className="h-6 bg-gray-800 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-800 rounded w-1/2 mb-2" />
              <div className="space-y-2 mt-2">
                <div className="h-3 bg-gray-800 rounded" />
                <div className="h-3 bg-gray-800 rounded" />
                <div className="h-3 bg-gray-800 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
