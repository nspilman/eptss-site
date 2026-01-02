/**
 * AudioPreview Component
 * Audio player with waveform visualization using UI library components
 */

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import {
  Card,
  CardContent,
  Button,
  Tooltip,
  Badge,
  Text,
  Skeleton,
  cn,
} from '@eptss/ui';
import { formatDuration } from '../utils/filePreview';
import { formatFileSize } from '../utils/fileValidation';

export interface AudioPreviewProps {
  /** File to preview (use either file or src) */
  file?: File;
  /** URL to audio file (use either file or src) */
  src?: string;
  /** Title to display (optional, used when src is provided) */
  title?: string;
  /** File size in bytes (optional, used when src is provided) */
  fileSize?: number;
  /** Show waveform visualization */
  showWaveform?: boolean;
  /** Waveform color */
  waveColor?: string;
  /** Progress wave color */
  progressColor?: string;
  /** Height of waveform in pixels */
  height?: number;
  /** Additional CSS classes */
  className?: string;
}

export const AudioPreview: React.FC<AudioPreviewProps> = ({
  file,
  src,
  title,
  fileSize,
  showWaveform = true,
  waveColor = 'rgb(128, 128, 128)',
  progressColor = 'rgb(226, 226, 64)',
  height = 80,
  className,
}) => {
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Track when container ref is attached
  const containerCallbackRef = React.useCallback((node: HTMLDivElement | null) => {
    setContainerElement(node);
  }, []);

  useEffect(() => {
    if (!showWaveform) return;
    if (!containerElement) return;

    // Create WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: containerElement,
      waveColor,
      progressColor,
      height,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      cursorWidth: 0,
      normalize: true,
    });

    wavesurferRef.current = wavesurfer;

    // Load audio file - either from File object or URL string
    let objectUrl: string | null = null;
    if (file) {
      objectUrl = URL.createObjectURL(file);
      wavesurfer.load(objectUrl);
    } else if (src) {
      wavesurfer.load(src);
    }

    // Event listeners
    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
      setIsLoading(false);
    });

    wavesurfer.on('error', (error) => {
      console.error('[AudioPreview] WaveSurfer error:', error);
      setIsLoading(false);
    });

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('timeupdate', (time) => setCurrentTime(time));

    return () => {
      wavesurfer.destroy();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file, src, showWaveform, waveColor, progressColor, height, containerElement]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const toggleMute = () => {
    if (wavesurferRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      wavesurferRef.current.setVolume(newMuted ? 0 : volume);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(newVolume);
    }
  };

  // Get display name and size
  const displayName = title || file?.name || 'Audio File';
  const displaySize = fileSize || file?.size;

  // Simple preview without waveform
  if (!showWaveform) {
    return (
      <Card variant="plain" className={className}>
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-[var(--color-accent-primary)]" />
            <Text className="truncate">{displayName}</Text>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className={className}>
      <CardContent className="py-4">
        <div className="flex flex-col gap-3">
          {/* Header with file info */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Text className="font-medium truncate">{displayName}</Text>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  Audio
                </Badge>
                {displaySize && (
                  <Text className="text-xs text-[var(--color-gray-400)]">
                    {formatFileSize(displaySize)}
                  </Text>
                )}
              </div>
            </div>
          </div>

          {/* Waveform */}
          {isLoading ? (
            <Skeleton className="w-full rounded" style={{ height: `${height}px` }} />
          ) : null}
          <div
            ref={containerCallbackRef}
            className={cn('w-full rounded overflow-hidden', {
              'opacity-50': isLoading,
              'hidden': isLoading,
            })}
          />

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <Tooltip content={isPlaying ? 'Pause' : 'Play'}>
              <Button
                size="icon"
                variant="default"
                onClick={togglePlayPause}
                disabled={isLoading}
                className="h-8 w-8 rounded-full"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </Button>
            </Tooltip>

            {/* Time Display */}
            <Badge variant="outline" className="font-mono text-xs">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </Badge>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Volume Controls */}
            <div className="flex items-center gap-2">
              <Tooltip content={isMuted ? 'Unmute' : 'Mute'}>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMute}
                  className="h-8 w-8"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </Tooltip>
              <Tooltip content={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 accent-[var(--color-accent-primary)] cursor-pointer"
                  aria-label="Volume"
                />
              </Tooltip>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
