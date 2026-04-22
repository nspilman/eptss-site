/**
 * usePlaylist hook
 * Manages playlist state and playback controls
 */

import { useState, useCallback } from 'react';
import type { Track, PlaylistState } from '../types';

export interface UsePlaylistOptions {
  /** Array of tracks to play */
  tracks: Track[];
  /**
   * Auto-advance to next track when current track ends.
   * - If `onAutoPlayNextChange` is also provided, this is a controlled value.
   * - Otherwise, this is the initial value for internal state.
   */
  autoPlayNext?: boolean;
  /** Controlled-mode callback fired when autoplay should toggle. Presence switches the hook into controlled mode. */
  onAutoPlayNextChange?: (next: boolean) => void;
  /** Callback when track changes */
  onTrackChange?: (track: Track, index: number) => void;
  /** Callback when playlist reaches the end */
  onPlaylistEnd?: () => void;
}

export interface UsePlaylistReturn {
  /** Currently playing track */
  currentTrack: Track | null;
  /** Index of current track */
  currentTrackIndex: number;
  /** Whether audio is playing */
  isPlaying: boolean;
  /** Shuffle mode enabled */
  shuffle: boolean;
  /** Repeat mode */
  repeat: 'none' | 'one' | 'all';
  /** Auto-advance to next track when current track ends */
  autoPlayNext: boolean;
  /** Play a specific track by index */
  playTrack: (index: number) => void;
  /** Skip to next track */
  next: () => void;
  /** Go to previous track */
  previous: () => void;
  /** Handle track end event - call this from AudioPreview onEnded */
  handleTrackEnded: () => void;
  /** Toggle shuffle mode */
  toggleShuffle: () => void;
  /** Cycle through repeat modes */
  toggleRepeat: () => void;
  /** Toggle auto-advance to next track */
  toggleAutoPlayNext: () => void;
  /** Set playing state */
  setIsPlaying: (playing: boolean) => void;
}

export function usePlaylist(options: UsePlaylistOptions): UsePlaylistReturn {
  const { tracks, autoPlayNext = true, onAutoPlayNextChange, onTrackChange, onPlaylistEnd } = options;

  const isAutoPlayControlled = onAutoPlayNextChange !== undefined;

  const [state, setState] = useState<PlaylistState>({
    currentTrackIndex: 0,
    isPlaying: false,
    shuffle: false,
    repeat: 'none',
    autoPlayNext,
  });

  const effectiveAutoPlayNext = isAutoPlayControlled ? autoPlayNext : state.autoPlayNext;

  const currentTrack = tracks[state.currentTrackIndex] || null;

  const playTrack = useCallback(
    (index: number) => {
      if (index >= 0 && index < tracks.length) {
        setState((prev) => ({ ...prev, currentTrackIndex: index, isPlaying: true }));
        onTrackChange?.(tracks[index], index);
      }
    },
    [tracks, onTrackChange]
  );

  const next = useCallback(() => {
    let nextIndex: number;
    if (state.shuffle) {
      // Random track, avoiding current track if possible
      if (tracks.length > 1) {
        do {
          nextIndex = Math.floor(Math.random() * tracks.length);
        } while (nextIndex === state.currentTrackIndex);
      } else {
        nextIndex = 0;
      }
    } else {
      nextIndex = state.currentTrackIndex + 1;
    }

    if (nextIndex >= tracks.length) {
      if (state.repeat === 'all') {
        playTrack(0);
      } else {
        setState((prev) => ({ ...prev, isPlaying: false }));
        onPlaylistEnd?.();
      }
    } else {
      playTrack(nextIndex);
    }
  }, [state.shuffle, state.currentTrackIndex, state.repeat, tracks.length, playTrack, onPlaylistEnd]);

  const previous = useCallback(() => {
    const prevIndex =
      state.currentTrackIndex > 0 ? state.currentTrackIndex - 1 : tracks.length - 1;
    playTrack(prevIndex);
  }, [state.currentTrackIndex, tracks.length, playTrack]);

  const handleTrackEnded = useCallback(() => {
    if (state.repeat === 'one') {
      // Replay same track - trigger re-render to restart
      setState((prev) => ({ ...prev, isPlaying: true }));
      onTrackChange?.(tracks[state.currentTrackIndex], state.currentTrackIndex);
    } else if (effectiveAutoPlayNext) {
      next();
    } else {
      setState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, [state.repeat, state.currentTrackIndex, effectiveAutoPlayNext, next, onTrackChange, tracks]);

  const toggleShuffle = useCallback(() => {
    setState((prev) => ({ ...prev, shuffle: !prev.shuffle }));
  }, []);

  const toggleRepeat = useCallback(() => {
    setState((prev) => ({
      ...prev,
      repeat: prev.repeat === 'none' ? 'all' : prev.repeat === 'all' ? 'one' : 'none',
    }));
  }, []);

  const toggleAutoPlayNext = useCallback(() => {
    if (isAutoPlayControlled) {
      onAutoPlayNextChange!(!effectiveAutoPlayNext);
    } else {
      setState((prev) => ({ ...prev, autoPlayNext: !prev.autoPlayNext }));
    }
  }, [isAutoPlayControlled, onAutoPlayNextChange, effectiveAutoPlayNext]);

  const setIsPlaying = useCallback((playing: boolean) => {
    setState((prev) => ({ ...prev, isPlaying: playing }));
  }, []);

  return {
    currentTrack,
    currentTrackIndex: state.currentTrackIndex,
    isPlaying: state.isPlaying,
    shuffle: state.shuffle,
    repeat: state.repeat,
    autoPlayNext: effectiveAutoPlayNext,
    playTrack,
    next,
    previous,
    handleTrackEnded,
    toggleShuffle,
    toggleRepeat,
    toggleAutoPlayNext,
    setIsPlaying,
  };
}
