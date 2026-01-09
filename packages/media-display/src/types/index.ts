/**
 * Type definitions for media-display package
 */

export type { FileCategory } from '../utils/fileCategory';

/**
 * Track interface for playlist functionality
 */
export interface Track {
  /** Unique identifier for the track */
  id: string;
  /** URL to the audio file */
  src: string;
  /** Display title */
  title: string;
  /** Artist name (optional) */
  artist?: string;
  /** File size in bytes (optional) */
  fileSize?: number;
  /** Duration in seconds (optional) */
  duration?: number;
  /** Cover art URL (optional) */
  coverArt?: string;
}

/**
 * Playlist state for the usePlaylist hook
 */
export interface PlaylistState {
  /** Index of the currently playing track */
  currentTrackIndex: number;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Shuffle mode enabled */
  shuffle: boolean;
  /** Repeat mode: none, one track, or all tracks */
  repeat: 'none' | 'one' | 'all';
}
