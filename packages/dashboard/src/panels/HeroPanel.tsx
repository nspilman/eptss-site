import { PanelProps } from '../types';

interface HeroData {
  roundId: number;
  songTitle?: string;
  songArtist?: string;
}

/**
 * Hero Panel - Displays the current round header
 * Priority: primary (always shows at top)
 */
export function HeroPanel({ data }: PanelProps<HeroData>) {
  if (!data) {
    return null;
  }

  const { roundId, songTitle, songArtist } = data;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-900/50 p-8 backdrop-blur-xs border border-gray-800">
      <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
      <div className="relative z-10">
        <h1 className="text-4xl font-bold">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
            Round {roundId}:{' '}
            {songTitle && songArtist
              ? `${songTitle} by ${songArtist}`
              : 'Song Selection in Progress'}
          </span>
        </h1>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-900/50 p-8 backdrop-blur-xs border border-gray-800 animate-pulse">
      <div className="h-10 bg-gray-800 rounded w-3/4" />
    </div>
  );
}
