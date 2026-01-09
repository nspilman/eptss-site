/**
 * EqualizerBars Component
 * Animated equalizer bars indicating audio is playing
 */

'use client';

import React from 'react';
import { cn } from '@eptss/ui';

export interface EqualizerBarsProps {
  /** Whether the animation is playing */
  isPlaying?: boolean;
  /** Number of bars */
  barCount?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color of the bars */
  color?: string;
  /** Additional CSS classes */
  className?: string;
}

const sizeConfig = {
  sm: { height: 12, width: 2, gap: 1 },
  md: { height: 16, width: 3, gap: 1 },
  lg: { height: 20, width: 4, gap: 2 },
};

export const EqualizerBars: React.FC<EqualizerBarsProps> = ({
  isPlaying = true,
  barCount = 4,
  size = 'sm',
  color = 'currentColor',
  className,
}) => {
  const config = sizeConfig[size];

  return (
    <div
      className={cn('flex items-end', className)}
      style={{
        height: config.height,
        gap: config.gap,
      }}
      aria-label={isPlaying ? 'Now playing' : 'Paused'}
    >
      {Array.from({ length: barCount }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'rounded-full transition-all',
            isPlaying ? 'animate-equalizer' : 'opacity-40'
          )}
          style={{
            width: config.width,
            height: isPlaying ? undefined : config.height * 0.3,
            backgroundColor: color,
            animationDelay: isPlaying ? `${index * 0.1}s` : undefined,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes equalizer {
          0%, 100% {
            height: 20%;
          }
          50% {
            height: 100%;
          }
        }
        .animate-equalizer {
          animation: equalizer 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
