/**
 * @eptss/media-display
 *
 * Media display and playback components for audio, video, and image preview.
 *
 * Features:
 * - Audio player with waveform visualization
 * - File preview for various media types
 * - Playlist component with sequential playback
 * - Modern now playing card with cover art
 * - Animated equalizer bars
 */

// Components
export { AudioPreview } from './components/AudioPreview';
export type { AudioPreviewProps } from './components/AudioPreview';

export { AudioPreviewErrorBoundary } from './components/AudioPreviewErrorBoundary';

export { FilePreview } from './components/FilePreview';
export type { FilePreviewProps } from './components/FilePreview';

export { Playlist } from './components/Playlist';
export type { PlaylistProps } from './components/Playlist';

export { PlaylistTrackItem } from './components/PlaylistTrackItem';
export type { PlaylistTrackItemProps } from './components/PlaylistTrackItem';

export { NowPlayingCard } from './components/NowPlayingCard';
export type { NowPlayingCardProps } from './components/NowPlayingCard';

export { EqualizerBars } from './components/EqualizerBars';
export type { EqualizerBarsProps } from './components/EqualizerBars';

// Hooks
export { usePlaylist } from './hooks/usePlaylist';
export type { UsePlaylistOptions, UsePlaylistReturn } from './hooks/usePlaylist';

// Types
export type { Track, PlaylistState, FileCategory } from './types';

// Utilities (exported for consumers who need them)
export { formatDuration, formatFileSize } from './utils/formatting';
export { getFileCategory, MIME_PATTERNS } from './utils/fileCategory';
export { createPreviewUrl, revokePreviewUrl } from './utils/preview';
