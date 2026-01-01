/**
 * AudioPreview Component
 * Audio player with waveform visualization
 */

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { clsx } from 'clsx';
import WaveSurfer from 'wavesurfer.js';
import { formatDuration } from '../utils/filePreview';

export interface AudioPreviewProps {
  /** File to preview */
  file: File;
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
  showWaveform = true,
  waveColor = 'rgb(128, 128, 128)',
  progressColor = 'rgb(226, 226, 64)',
  height = 80,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current || !showWaveform) return;

    // Create WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
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

    // Load audio file
    const url = URL.createObjectURL(file);
    wavesurfer.load(url);

    // Event listeners
    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
      setIsLoading(false);
    });

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('timeupdate', (time) => setCurrentTime(time));

    return () => {
      wavesurfer.destroy();
      URL.revokeObjectURL(url);
    };
  }, [file, showWaveform, waveColor, progressColor, height]);

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

  if (!showWaveform) {
    return (
      <div className={clsx('flex items-center gap-3 p-3 bg-[var(--color-gray-700)] rounded-lg', className)}>
        <Volume2 className="w-5 h-5 text-[var(--color-accent-primary)]" />
        <p className="text-sm text-[var(--color-primary)] truncate">{file.name}</p>
      </div>
    );
  }

  return (
    <div className={clsx('flex flex-col gap-3 p-4 bg-[var(--color-gray-700)] rounded-lg', className)}>
      {/* File Name */}
      <p className="text-sm font-medium text-[var(--color-primary)] truncate">{file.name}</p>

      {/* Waveform */}
      <div
        ref={containerRef}
        className={clsx('w-full rounded overflow-hidden', {
          'opacity-50': isLoading,
        })}
      />

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlayPause}
          disabled={isLoading}
          className={clsx(
            'flex items-center justify-center',
            'w-8 h-8 rounded-full',
            'bg-[var(--color-accent-primary)] text-[var(--color-background-primary)]',
            'hover:opacity-90 transition-opacity',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Time */}
        <span className="text-xs text-[var(--color-gray-400)] font-mono">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="text-[var(--color-gray-400)] hover:text-[var(--color-accent-primary)] transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 accent-[var(--color-accent-primary)]"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
};
