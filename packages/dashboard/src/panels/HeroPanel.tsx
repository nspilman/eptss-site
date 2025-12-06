import { PanelProps } from '../types';

interface HeroData {
  roundId: number;
  songTitle?: string;
  songArtist?: string;
}

/**
 * Hero Panel - Displays the current round header
 *
 * Content-only component - PanelCard handles all styling
 */
export function HeroPanel({ data }: PanelProps<HeroData>) {
  if (!data) {
    return null;
  }

  const { roundId, songTitle, songArtist } = data;

  return (
    <h1 className="text-4xl font-bold">
      <span className="bg-clip-text text-transparent bg-linear-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
        Round {roundId}:{' '}
        {songTitle && songArtist
          ? `${songTitle} by ${songArtist}`
          : 'Song Selection in Progress'}
      </span>
    </h1>
  );
}

export function HeroSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-800 rounded w-3/4" />
    </div>
  );
}
