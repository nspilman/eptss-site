/**
 * NowPlayingCard Component
 * Hero card for the currently playing track with large cover art and full controls
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Music2,
} from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import { Button, Tooltip, Text, Skeleton, Progress, Card, cn } from '@eptss/ui';
import { logger } from '@eptss/logger/client';
import { formatDuration } from '../utils/formatting';
import type { Track } from '../types';

export interface NowPlayingCardProps {
  /** Current track */
  track: Track;
  /** Whether audio is playing */
  isPlaying: boolean;
  /** Toggle play/pause */
  onPlayPause: () => void;
  /** Skip to next track */
  onNext?: () => void;
  /** Go to previous track */
  onPrevious?: () => void;
  /** Shuffle mode */
  shuffle?: boolean;
  /** Toggle shuffle */
  onToggleShuffle?: () => void;
  /** Repeat mode */
  repeat?: 'none' | 'one' | 'all';
  /** Toggle repeat */
  onToggleRepeat?: () => void;
  /** Callback when track ends */
  onEnded?: () => void;
  /** Callback when seeking */
  onSeek?: (time: number) => void;
  /** Whether track is liked/favorited */
  isLiked?: boolean;
  /** Toggle like */
  onToggleLike?: () => void;
  /** Show controls */
  showControls?: boolean;
  /** Show waveform */
  showWaveform?: boolean;
  /** Waveform colors */
  waveColor?: string;
  progressColor?: string;
  /** Size variant */
  size?: 'default' | 'compact';
  /** Additional CSS classes */
  className?: string;
}

export const NowPlayingCard: React.FC<NowPlayingCardProps> = ({
  track,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  shuffle = false,
  onToggleShuffle,
  repeat = 'none',
  onToggleRepeat,
  onEnded,
  onSeek,
  isLiked = false,
  onToggleLike,
  showControls = true,
  showWaveform = true,
  waveColor = 'rgba(255, 255, 255, 0.3)',
  progressColor = 'var(--color-accent-primary)',
  size = 'default',
  className,
}) => {
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(track.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const containerCallbackRef = useCallback((node: HTMLDivElement | null) => {
    setContainerElement(node);
  }, []);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!showWaveform || !containerElement) return;

    const wavesurfer = WaveSurfer.create({
      container: containerElement,
      waveColor,
      progressColor,
      height: size === 'compact' ? 48 : 64,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      cursorWidth: 0,
      normalize: true,
      fetchParams: {
        mode: 'cors' as RequestMode,
      },
    });

    wavesurferRef.current = wavesurfer;
    wavesurfer.load(track.src);

    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
      setIsLoading(false);
      if (isPlaying) {
        wavesurfer.play();
      }
    });

    wavesurfer.on('error', (error) => {
      logger.error('WaveSurfer error', { error, src: track.src });
      setIsLoading(false);
    });

    wavesurfer.on('play', () => {});
    wavesurfer.on('pause', () => {});
    wavesurfer.on('timeupdate', (time) => setCurrentTime(time));
    wavesurfer.on('seeking', (time) => onSeek?.(time));
    wavesurfer.on('finish', () => onEnded?.());

    return () => {
      wavesurfer.destroy();
    };
  }, [track.src, showWaveform, containerElement, waveColor, progressColor, size]);

  // Sync play state
  useEffect(() => {
    if (!wavesurferRef.current || isLoading) return;

    if (isPlaying && !wavesurferRef.current.isPlaying()) {
      wavesurferRef.current.play();
    } else if (!isPlaying && wavesurferRef.current.isPlaying()) {
      wavesurferRef.current.pause();
    }
  }, [isPlaying, isLoading]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    wavesurferRef.current?.setVolume(newVolume);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    wavesurferRef.current?.setVolume(newMuted ? 0 : volume);
  };

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const isCompact = size === 'compact';
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card
      variant="glass"
      className={cn('relative overflow-hidden w-full', className)}
    >
      {/* Background blur from cover art */}
      {track.coverArt && !imageError && (
        <div
          className="absolute inset-0 opacity-30 blur-3xl scale-150"
          style={{
            backgroundImage: `url(${track.coverArt})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      <div className={cn('relative z-10', isCompact ? 'p-4' : 'p-6')}>
        <div className={cn('flex w-full', isCompact ? 'gap-4 items-center' : 'flex-col gap-6')}>
          {/* Cover Art & Track Info */}
          <div className={cn('flex', isCompact ? 'gap-4 flex-1' : 'gap-6')}>
            {/* Cover Art */}
            <div
              className={cn(
                'relative flex-shrink-0 rounded-xl overflow-hidden shadow-xl',
                'bg-gradient-to-br from-gray-700 to-gray-800',
                isCompact ? 'w-16 h-16' : 'w-32 h-32 md:w-40 md:h-40'
              )}
            >
              {track.coverArt && !imageError ? (
                <img
                  src={track.coverArt}
                  alt={track.title}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music2 className={cn('text-gray-500', isCompact ? 'w-8 h-8' : 'w-16 h-16')} />
                </div>
              )}

              {/* Play overlay on hover (compact only) */}
              {isCompact && (
                <button
                  onClick={onPlayPause}
                  className={cn(
                    'absolute inset-0 flex items-center justify-center',
                    'bg-black/60 opacity-0 hover:opacity-100 transition-opacity'
                  )}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
              )}
            </div>

            {/* Track Info */}
            <div className={cn(
              'flex flex-col',
              isCompact ? 'justify-center min-w-0' : 'flex-1 min-h-[88px]'
            )}>
              <Text
                size={isCompact ? 'sm' : 'xs'}
                className="text-[var(--color-accent-primary)] font-medium uppercase tracking-wider mb-1"
              >
                Now Playing
              </Text>
              <Text
                className={cn(
                  'font-bold truncate',
                  isCompact ? 'text-lg' : 'text-2xl md:text-3xl'
                )}
              >
                {track.title}
              </Text>
              <Text
                size={isCompact ? 'sm' : 'lg'}
                color="muted"
                className="truncate mt-1"
              >
                {track.artist || '\u00A0'}
              </Text>
            </div>

            {/* Like button (compact) */}
            {isCompact && onToggleLike && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onToggleLike}
                className={cn('h-10 w-10', isLiked && 'text-red-500')}
              >
                <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
              </Button>
            )}
          </div>

          {/* Waveform */}
          {showWaveform && !isCompact && (
            <div className="w-full h-16">
              {isLoading ? (
                <Skeleton className="w-full h-16 rounded-lg" />
              ) : null}
              <div
                ref={containerCallbackRef}
                className={cn(
                  'w-full h-16 rounded-lg cursor-pointer',
                  isLoading && 'hidden'
                )}
              />
            </div>
          )}

          {/* Progress bar (compact) - using UI Progress component */}
          {isCompact && (
            <div className="flex-1 max-w-xs">
              <Progress
                value={progressPercent}
                size="sm"
                className="h-1"
              />
              <div className="flex justify-between mt-1">
                <Text size="xs" color="muted" className="tabular-nums">
                  {formatDuration(currentTime)}
                </Text>
                <Text size="xs" color="muted" className="tabular-nums">
                  {formatDuration(duration)}
                </Text>
              </div>
            </div>
          )}

          {/* Time display (full) */}
          {!isCompact && (
            <div className="flex justify-between">
              <Text size="sm" color="muted" className="tabular-nums min-w-[3rem]">
                {formatDuration(currentTime)}
              </Text>
              <Text size="sm" color="muted" className="tabular-nums min-w-[3rem] text-right">
                {formatDuration(duration)}
              </Text>
            </div>
          )}

          {/* Controls */}
          {showControls && !isCompact && (
            <div className="flex items-center justify-center gap-2">
              {/* Shuffle */}
              {onToggleShuffle && (
                <Tooltip content={shuffle ? 'Disable shuffle' : 'Enable shuffle'}>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onToggleShuffle}
                    className={cn('h-10 w-10', shuffle && 'text-[var(--color-accent-primary)]')}
                  >
                    <Shuffle className="w-5 h-5" />
                  </Button>
                </Tooltip>
              )}

              {/* Previous */}
              {onPrevious && (
                <Tooltip content="Previous">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onPrevious}
                    className="h-12 w-12"
                  >
                    <SkipBack className="w-6 h-6" />
                  </Button>
                </Tooltip>
              )}

              {/* Play/Pause */}
              <Tooltip content={isPlaying ? 'Pause' : 'Play'}>
                <Button
                  size="icon"
                  variant="default"
                  onClick={onPlayPause}
                  disabled={isLoading}
                  className={cn(
                    'h-16 w-16 rounded-full',
                    'bg-white hover:bg-gray-100 text-gray-900',
                    'shadow-lg hover:shadow-xl transition-all hover:scale-105'
                  )}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </Button>
              </Tooltip>

              {/* Next */}
              {onNext && (
                <Tooltip content="Next">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onNext}
                    className="h-12 w-12"
                  >
                    <SkipForward className="w-6 h-6" />
                  </Button>
                </Tooltip>
              )}

              {/* Repeat */}
              {onToggleRepeat && (
                <Tooltip
                  content={
                    repeat === 'none' ? 'Enable repeat' :
                    repeat === 'all' ? 'Repeat one' : 'Disable repeat'
                  }
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onToggleRepeat}
                    className={cn('h-10 w-10', repeat !== 'none' && 'text-[var(--color-accent-primary)]')}
                  >
                    {repeat === 'one' ? (
                      <Repeat1 className="w-5 h-5" />
                    ) : (
                      <Repeat className="w-5 h-5" />
                    )}
                  </Button>
                </Tooltip>
              )}
            </div>
          )}

          {/* Bottom row: Volume & Like */}
          {showControls && !isCompact && (
            <div className="flex items-center justify-between">
              {/* Like button */}
              {onToggleLike ? (
                <Tooltip content={isLiked ? 'Unlike' : 'Like'}>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onToggleLike}
                    className={cn('h-10 w-10', isLiked && 'text-red-500')}
                  >
                    <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
                  </Button>
                </Tooltip>
              ) : (
                <div />
              )}

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Tooltip content={isMuted ? 'Unmute' : 'Mute'}>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={toggleMute}
                    className="h-10 w-10"
                  >
                    <VolumeIcon className="w-5 h-5" />
                  </Button>
                </Tooltip>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1 accent-[var(--color-accent-primary)] cursor-pointer"
                  aria-label="Volume"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
