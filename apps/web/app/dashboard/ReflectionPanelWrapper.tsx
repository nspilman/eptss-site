import { ReflectionDisplay } from '@eptss/user-content';
import type { PanelProps } from '@eptss/dashboard';
import type { Reflection } from '@eptss/data-access';

interface ReflectionData {
  roundSlug: string;
  round: {
    roundId: number;
    slug: string;
    signupOpens: string;
    votingOpens: string;
    coveringBegins: string;
    coversDue: string;
    listeningParty: string;
    song: { artist: string; title: string };
  };
  reflections: Reflection[];
}

/**
 * Wrapper to adapt ReflectionDisplay to the dashboard panel interface
 */
export function ReflectionPanelWrapper({ data }: PanelProps<ReflectionData>) {
  if (!data) {
    return null;
  }

  return (
    <ReflectionDisplay
      roundSlug={data.roundSlug}
      round={data.round}
      reflections={data.reflections}
    />
  );
}

export function ReflectionPanelSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-[var(--color-background-secondary)] rounded-lg border border-[var(--color-gray-800)] p-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-24 bg-gray-800 rounded" />
          <div className="h-24 bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );
}
