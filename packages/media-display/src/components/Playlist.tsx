/**
 * Playlist Component
 * Modern audio playlist with hero player, track list, and rich interactions
 */

'use client';

import React, { useState } from 'react';
import { Music2, ListMusic, Clock } from 'lucide-react';
import {
  Text,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  EmptyState,
  Separator,
  cn,
} from '@eptss/ui';
import { NowPlayingCard } from './NowPlayingCard';
import { PlaylistTrackItem } from './PlaylistTrackItem';
import { ShowcasePlayer } from './ShowcasePlayer';
import { usePlaylist, UsePlaylistOptions } from '../hooks/usePlaylist';
import { formatDuration } from '../utils/formatting';
import type { Track } from '../types';

export interface PlaylistProps extends UsePlaylistOptions {
  /** Playlist title */
  title?: string;
  /** Playlist description */
  description?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show the track list */
  showTrackList?: boolean;
  /** Show playlist controls (next/previous/shuffle/repeat) */
  showControls?: boolean;
  /** Show track numbers in the list */
  showTrackNumbers?: boolean;
  /** Show waveform in now playing card */
  showWaveform?: boolean;
  /** Layout variant */
  layout?: 'default' | 'compact' | 'split' | 'showcase';
  /** Maximum height for track list (enables scrolling) */
  maxTrackListHeight?: number | string;
  /** Liked track IDs */
  likedTrackIds?: Set<string>;
  /** Toggle like callback */
  onToggleLike?: (trackId: string) => void;
}

export const Playlist: React.FC<PlaylistProps> = ({
  tracks,
  title,
  description,
  autoPlayNext = true,
  onTrackChange,
  onPlaylistEnd,
  className,
  showTrackList = true,
  showControls = true,
  showTrackNumbers = true,
  showWaveform = true,
  layout = 'default',
  maxTrackListHeight,
  likedTrackIds,
  onToggleLike,
}) => {
  const playlist = usePlaylist({ tracks, autoPlayNext, onTrackChange, onPlaylistEnd });
  const [trackProgress, setTrackProgress] = useState<Record<string, number>>({});

  // Calculate total playlist duration
  const totalDuration = tracks.reduce((acc, track) => acc + (track.duration || 0), 0);
  const tracksWithDuration = tracks.filter((t) => t.duration !== undefined).length;


  // Empty state using UI library
  if (tracks.length === 0) {
    return (
      <Card variant="glass" className={className}>
        <CardContent className="py-8">
          <EmptyState
            size="lg"
            icon={<Music2 className="w-12 h-12 text-gray-500" />}
            title="No tracks in playlist"
            description="Add some tracks to get started"
          />
        </CardContent>
      </Card>
    );
  }

  const isCompactLayout = layout === 'compact';
  const isSplitLayout = layout === 'split';
  const isShowcaseLayout = layout === 'showcase';

  // Showcase layout - optimized for single track with prominent cover art
  if (isShowcaseLayout && playlist.currentTrack) {
    return (
      <ShowcasePlayer
        track={playlist.currentTrack}
        isPlaying={playlist.isPlaying}
        onPlayPause={() => playlist.setIsPlaying(!playlist.isPlaying)}
        onEnded={playlist.handleTrackEnded}
        className={className}
      />
    );
  }

  return (
    <Card
      variant="glass"
      className={cn(
        isSplitLayout && 'grid grid-cols-1 lg:grid-cols-2',
        className
      )}
    >
      {/* Main content */}
      <div className={cn('flex flex-col', isSplitLayout && 'lg:border-r lg:border-white/10')}>
        {/* Playlist header using Card components */}
        {(title || description) && (
          <CardHeader className="pb-2">
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-gray-400">
                <ListMusic className="w-4 h-4" />
                <Text size="xs" color="muted">
                  {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
                </Text>
              </div>
              {tracksWithDuration > 0 && (
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <Text size="xs" color="muted">
                    {formatDuration(totalDuration)}
                  </Text>
                </div>
              )}
            </div>
          </CardHeader>
        )}

        {/* Now Playing Card */}
        {playlist.currentTrack && (
          <CardContent className={cn(!title && 'pt-4')}>
            <NowPlayingCard
              track={playlist.currentTrack}
              isPlaying={playlist.isPlaying}
              onPlayPause={() => playlist.setIsPlaying(!playlist.isPlaying)}
              onNext={tracks.length > 1 ? playlist.next : undefined}
              onPrevious={tracks.length > 1 ? playlist.previous : undefined}
              shuffle={playlist.shuffle}
              onToggleShuffle={tracks.length > 1 ? playlist.toggleShuffle : undefined}
              repeat={playlist.repeat}
              onToggleRepeat={playlist.toggleRepeat}
              onEnded={playlist.handleTrackEnded}
              onSeek={(time) => {
                if (playlist.currentTrack) {
                  const duration = playlist.currentTrack.duration || 0;
                  setTrackProgress((prev) => ({
                    ...prev,
                    [playlist.currentTrack!.id]: duration > 0 ? time / duration : 0,
                  }));
                }
              }}
              isLiked={likedTrackIds?.has(playlist.currentTrack.id)}
              onToggleLike={
                onToggleLike
                  ? () => onToggleLike(playlist.currentTrack!.id)
                  : undefined
              }
              showControls={showControls}
              showWaveform={showWaveform && !isCompactLayout}
              size={isCompactLayout ? 'compact' : 'default'}
            />
          </CardContent>
        )}
      </div>

      {/* Track List */}
      {showTrackList && (
        <div className={cn('flex flex-col', isSplitLayout && 'lg:pt-0')}>
          {/* Track list header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
            <Text size="sm" weight="medium" color="muted">
              Up Next
            </Text>
            <Text size="xs" color="muted">
              {Math.max(0, tracks.length - playlist.currentTrackIndex - 1)} remaining
            </Text>
          </div>

          {/* Scrollable track list */}
          <div
            className={cn(
              'flex flex-col px-2 py-2',
              maxTrackListHeight && 'overflow-y-auto'
            )}
            style={maxTrackListHeight ? { maxHeight: maxTrackListHeight } : undefined}
          >
            {tracks.map((track, index) => {
              const isActive = index === playlist.currentTrackIndex;
              return (
                <div key={track.id}>
                  <PlaylistTrackItem
                    track={track}
                    isActive={isActive}
                    isPlaying={isActive && playlist.isPlaying}
                    onClick={() => playlist.playTrack(index)}
                    trackNumber={showTrackNumbers ? index + 1 : undefined}
                    progress={isActive ? trackProgress[track.id] : undefined}
                    isLiked={likedTrackIds?.has(track.id)}
                    onToggleLike={
                      onToggleLike ? () => onToggleLike(track.id) : undefined
                    }
                    size={isCompactLayout ? 'compact' : 'default'}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};
