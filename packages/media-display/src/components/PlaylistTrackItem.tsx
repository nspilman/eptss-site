/**
 * PlaylistTrackItem Component
 * Clean track item for playlist - no cover art (that's shown in NowPlayingCard)
 */

'use client';

import React, { useState } from 'react';
import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';
import { Text, Button, Progress, cn } from '@eptss/ui';
import { formatDuration } from '../utils/formatting';
import { EqualizerBars } from './EqualizerBars';
import type { Track } from '../types';

export interface PlaylistTrackItemProps {
  /** Track data */
  track: Track;
  /** Whether this track is currently active */
  isActive: boolean;
  /** Whether the track is currently playing (vs paused) */
  isPlaying?: boolean;
  /** Click handler to play this track */
  onClick: () => void;
  /** Track number to display (optional) */
  trackNumber?: number;
  /** Progress through the track (0-100) for active track */
  progress?: number;
  /** Whether track is liked */
  isLiked?: boolean;
  /** Toggle like callback */
  onToggleLike?: () => void;
  /** More options callback */
  onMoreOptions?: () => void;
  /** Size variant */
  size?: 'default' | 'compact';
  /** Additional CSS classes */
  className?: string;
}

export const PlaylistTrackItem: React.FC<PlaylistTrackItemProps> = ({
  track,
  isActive,
  isPlaying = false,
  onClick,
  trackNumber,
  progress = 0,
  isLiked = false,
  onToggleLike,
  onMoreOptions,
  size = 'default',
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isCompact = size === 'compact';

  const showPlayButton = isHovered || isActive;
  // Convert 0-1 progress to 0-100 for Progress component
  const progressPercent = typeof progress === 'number' ? progress * 100 : 0;

  return (
    <div
      className={cn(
        'group relative',
        'rounded-lg transition-all duration-200',
        isActive
          ? 'bg-white/10'
          : 'hover:bg-white/5',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Progress bar for active track using UI Progress component */}
      {isActive && progressPercent > 0 && (
        <div className="absolute bottom-0 left-0 right-0 px-3">
          <Progress
            value={progressPercent}
            size="sm"
            className="h-0.5 bg-transparent"
          />
        </div>
      )}

      <button
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 w-full text-left',
          isCompact ? 'p-2' : 'p-3'
        )}
      >
        {/* Track number / Play button / Equalizer */}
        <div className={cn('flex-shrink-0', isCompact ? 'w-6' : 'w-8')}>
          {showPlayButton ? (
            <div className="flex items-center justify-center">
              {isActive && isPlaying ? (
                <Pause className={cn('text-[var(--color-accent-primary)]', isCompact ? 'w-4 h-4' : 'w-5 h-5')} />
              ) : (
                <Play className={cn('text-white', isCompact ? 'w-4 h-4' : 'w-5 h-5')} />
              )}
            </div>
          ) : isActive && isPlaying ? (
            <EqualizerBars
              isPlaying={true}
              size={isCompact ? 'sm' : 'md'}
              color="var(--color-accent-primary)"
            />
          ) : trackNumber !== undefined ? (
            <Text
              size={isCompact ? 'xs' : 'sm'}
              color="muted"
              className="text-center w-full tabular-nums"
            >
              {trackNumber}
            </Text>
          ) : null}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <Text
            size={isCompact ? 'sm' : 'base'}
            weight={isActive ? 'semibold' : 'medium'}
            className={cn(
              'truncate transition-colors',
              isActive ? 'text-[var(--color-accent-primary)]' : 'text-white'
            )}
          >
            {track.title}
          </Text>
          {track.artist && (
            <Text
              size={isCompact ? 'xs' : 'sm'}
              color="muted"
              className="truncate"
            >
              {track.artist}
            </Text>
          )}
        </div>

        {/* Right side: Duration & Actions */}
        <div className="flex items-center gap-2">
          {/* Like button - visible on hover or if liked */}
          {onToggleLike && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike();
              }}
              className={cn(
                'h-8 w-8 transition-opacity',
                !isHovered && !isLiked ? 'opacity-0' : 'opacity-100',
                isLiked && 'text-red-500'
              )}
            >
              <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
            </Button>
          )}

          {/* Duration */}
          {track.duration !== undefined && (
            <Text
              size="xs"
              color="muted"
              className={cn('tabular-nums', isCompact ? 'w-10' : 'w-12', 'text-right')}
            >
              {formatDuration(track.duration)}
            </Text>
          )}

          {/* More options - visible on hover */}
          {onMoreOptions && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onMoreOptions();
              }}
              className={cn(
                'h-8 w-8 transition-opacity',
                !isHovered ? 'opacity-0' : 'opacity-100'
              )}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          )}
        </div>
      </button>
    </div>
  );
};
