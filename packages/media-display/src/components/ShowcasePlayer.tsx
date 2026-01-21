/**
 * ShowcasePlayer Component
 * A beautiful single-track player with prominent cover art
 * Designed for profile pages and single submission displays
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Music2,
} from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import { Button, Text, Skeleton, Card, cn } from '@eptss/ui';
import { logger } from '@eptss/logger/client';
import { formatDuration } from '../utils/formatting';
import type { Track } from '../types';

export interface ShowcasePlayerProps {
  /** Track to play */
  track: Track;
  /** Whether audio is playing */
  isPlaying: boolean;
  /** Toggle play/pause */
  onPlayPause: () => void;
  /** Callback when track ends */
  onEnded?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const ShowcasePlayer: React.FC<ShowcasePlayerProps> = ({
  track,
  isPlaying,
  onPlayPause,
  onEnded,
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
    if (!containerElement) return;

    const wavesurfer = WaveSurfer.create({
      container: containerElement,
      waveColor: 'rgba(255, 255, 255, 0.3)',
      progressColor: 'var(--color-accent-primary)',
      height: 48,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      cursorWidth: 0,
      normalize: true,
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

    wavesurfer.on('timeupdate', (time) => setCurrentTime(time));
    wavesurfer.on('finish', () => onEnded?.());

    return () => {
      wavesurfer.destroy();
    };
  }, [track.src, containerElement]);

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

  return (
    <Card
      variant="glass"
      className={cn('relative overflow-hidden w-full', className)}
    >
      {/* Background blur from cover art */}
      {track.coverArt && !imageError && (
        <div
          className="absolute inset-0 opacity-20 blur-3xl scale-150"
          style={{
            backgroundImage: `url(${track.coverArt})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      <div className="relative z-10 p-6">
        {/* Main layout: Cover art on left, info + controls on right */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Cover Art - Large and prominent */}
          <div className="relative flex-shrink-0 self-center md:self-start">
            <div
              className={cn(
                'relative rounded-xl overflow-hidden shadow-2xl',
                'bg-gradient-to-br from-gray-700 to-gray-800',
                'w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64'
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
                  <Music2 className="w-20 h-20 text-gray-500" />
                </div>
              )}

              {/* Play button overlay */}
              <button
                onClick={onPlayPause}
                disabled={isLoading}
                className={cn(
                  'absolute inset-0 flex items-center justify-center',
                  'bg-black/40 opacity-0 hover:opacity-100 transition-opacity',
                  'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50'
                )}
              >
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-gray-900" />
                  ) : (
                    <Play className="w-8 h-8 text-gray-900 ml-1" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Track Info & Controls */}
          <div className="flex flex-col flex-1 min-w-0 justify-between">
            {/* Track Info */}
            <div className="text-center md:text-left mb-4">
              <Text
                size="xs"
                className="text-[var(--color-accent-primary)] font-medium uppercase tracking-wider mb-2"
              >
                Now Playing
              </Text>
              <Text className="text-2xl md:text-3xl font-bold truncate mb-1">
                {track.title}
              </Text>
              <Text size="lg" color="muted" className="truncate">
                {track.artist || '\u00A0'}
              </Text>
            </div>

            {/* Waveform */}
            <div className="w-full mb-4">
              {isLoading ? (
                <Skeleton className="w-full h-12 rounded-lg" />
              ) : null}
              <div
                ref={containerCallbackRef}
                className={cn(
                  'w-full h-12 rounded-lg cursor-pointer',
                  isLoading && 'hidden'
                )}
              />
            </div>

            {/* Time display */}
            <div className="flex justify-between mb-4">
              <Text size="sm" color="muted" className="tabular-nums">
                {formatDuration(currentTime)}
              </Text>
              <Text size="sm" color="muted" className="tabular-nums">
                {formatDuration(duration)}
              </Text>
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              {/* Play/Pause button (mobile/tablet) */}
              <Button
                size="icon"
                variant="default"
                onClick={onPlayPause}
                disabled={isLoading}
                className={cn(
                  'h-12 w-12 rounded-full md:hidden',
                  'bg-white hover:bg-gray-100 text-gray-900',
                  'shadow-lg'
                )}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </Button>

              {/* Spacer for desktop (play button is on cover) */}
              <div className="hidden md:block" />

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMute}
                  className="h-10 w-10"
                >
                  <VolumeIcon className="w-5 h-5" />
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 md:w-24 h-1 accent-[var(--color-accent-primary)] cursor-pointer"
                  aria-label="Volume"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
