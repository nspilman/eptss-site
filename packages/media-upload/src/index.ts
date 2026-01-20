/**
 * @eptss/media-upload
 *
 * A comprehensive media upload package for Supabase storage
 * with support for audio, images, videos, and documents.
 *
 * Features:
 * - Drag-and-drop file upload
 * - Multiple file uploads
 * - File validation and preview
 * - Audio player with waveform
 * - Image cropping
 * - Progress tracking
 * - Upload queue management
 */

// Re-export display components from @eptss/media-display for backward compatibility
export {
  AudioPreview,
  AudioPreviewErrorBoundary,
  FilePreview,
  Playlist,
  PlaylistTrackItem,
  usePlaylist,
} from '@eptss/media-display';

export type {
  AudioPreviewProps,
  FilePreviewProps,
  PlaylistProps,
  PlaylistTrackItemProps,
  UsePlaylistOptions,
  Track,
} from '@eptss/media-display';

// Main component
export { MediaUploader } from './components/MediaUploader';
export type { MediaUploaderProps, MediaUploaderState } from './types';

// Individual components (for custom implementations)
export { FileInput } from './components/FileInput';
export type { FileInputProps } from './components/FileInput';

export { FileDropzone } from './components/FileDropzone';
export type { FileDropzoneProps } from './components/FileDropzone';

export { UploadProgress as UploadProgressComponent } from './components/UploadProgress';
export type { UploadProgressProps } from './components/UploadProgress';

export { UploadQueue } from './components/UploadQueue';
export type { UploadQueueProps } from './components/UploadQueue';

export { ImageCropper } from './components/ImageCropper';
export type { ImageCropperProps } from './components/ImageCropper';

// Hooks
export { useMediaUpload } from './hooks/useMediaUpload';
export type { UseMediaUploadOptions } from './hooks/useMediaUpload';

export { useUploadQueue } from './hooks/useUploadQueue';
export type { UseUploadQueueOptions } from './hooks/useUploadQueue';

export { useFileValidation } from './hooks/useFileValidation';

export { useUpload } from './hooks/useUpload';
export type { UseUploadOptions, UseUploadReturn } from './hooks/useUpload';

// Pure functions for upload state management (easily testable)
export {
  uploadReducer,
  initialUploadState,
} from './uploadReducer';
export type {
  UploadState,
  UploadAction,
  UploadResult as UploadResultState,
} from './uploadReducer';

export {
  canSubmit,
  deriveSubmitConfig,
} from './canSubmit';
export type {
  UploadStates,
  SubmitConfig,
  CanSubmitResult,
} from './canSubmit';

export {
  buildPayload,
  payloadToFormData,
} from './buildPayload';
export type {
  TextFields,
  SubmissionPayload,
} from './buildPayload';

// Server actions
export {
  uploadMediaFile,
  uploadMediaFiles,
  deleteMediaFile,
  getMediaFileUrl,
  getSignedUploadUrl,
} from './actions/uploadActions';

// Client-side direct upload (bypasses server size limits)
export { uploadWithSignedUrl } from './utils/directUpload';

// Types
export type {
  UploadStatus,
  FileCategory,
  UploadVariant,
  UploadResult,
  UploadError,
  UploadProgress as UploadProgressInfo,
  UploadQueueItem,
  FileValidationConfig,
  PathGenerator,
  ChunkedUploadOptions,
  AudioMetadata,
  ImageMetadata,
  FileMetadata,
} from './types';

// Utilities
export {
  // MIME types
  MIME_PATTERNS,
  getFileCategory,
  matchesMimePattern,
  matchesAcceptPattern,
  getFileExtension,
  sanitizeFileName,
  generateUniqueFileName,
} from './utils/mimeTypes';

export {
  // File validation
  validateFile,
  validateFiles,
  getValidFiles,
  hasValidFiles,
  formatFileSize,
  mbToBytes,
  bytesToMb,
} from './utils/fileValidation';

export {
  // File preview
  createPreviewUrl,
  revokePreviewUrl,
  extractImageMetadata,
  extractAudioMetadata,
  extractFileMetadata,
  formatDuration,
  canPreview,
  isAudio,
  isImage,
  isVideo,
} from './utils/filePreview';

export {
  // Chunked upload
  createFileChunks,
  uploadFileInChunks,
  shouldUseChunkedUpload,
  calculateOptimalChunkSize,
} from './utils/chunkedUpload';
