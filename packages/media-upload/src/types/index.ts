/**
 * Media Upload Package Types
 *
 * Core type definitions for file upload functionality
 */

/**
 * Upload status for tracking file upload state
 */
export type UploadStatus = 'idle' | 'validating' | 'uploading' | 'success' | 'error' | 'cancelled';

/**
 * File type categories for preview rendering
 */
export type FileCategory = 'audio' | 'image' | 'video' | 'document' | 'other';

/**
 * UI variant for the upload interface
 */
export type UploadVariant = 'button' | 'dropzone' | 'both';

/**
 * Result of a file upload operation
 */
export interface UploadResult {
  /** Public URL of the uploaded file */
  url: string;
  /** Original file name */
  fileName: string;
  /** File size in bytes */
  fileSize: number;
  /** MIME type */
  mimeType: string;
  /** Storage path in the bucket */
  path: string;
  /** Upload timestamp */
  uploadedAt: Date;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Error information for failed uploads
 */
export interface UploadError {
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Original file that failed */
  file: File;
  /** Optional additional details */
  details?: unknown;
}

/**
 * Progress information for an ongoing upload
 */
export interface UploadProgress {
  /** File being uploaded */
  file: File;
  /** Upload progress percentage (0-100) */
  progress: number;
  /** Bytes uploaded */
  bytesUploaded: number;
  /** Total bytes to upload */
  totalBytes: number;
  /** Current upload status */
  status: UploadStatus;
  /** Error if status is 'error' */
  error?: UploadError;
  /** Upload result if status is 'success' */
  result?: UploadResult;
}

/**
 * Queue item for managing multiple file uploads
 */
export interface UploadQueueItem extends UploadProgress {
  /** Unique identifier for the queue item */
  id: string;
  /** Function to cancel the upload */
  cancel: () => void;
  /** Function to retry a failed upload */
  retry: () => void;
}

/**
 * Configuration for file validation
 */
export interface FileValidationConfig {
  /** Maximum file size in megabytes */
  maxSizeMB?: number;
  /** Minimum file size in megabytes */
  minSizeMB?: number;
  /** Allowed MIME types (e.g., ['image/*', 'audio/mp3']) */
  accept?: string | string[];
  /** Maximum number of files */
  maxFiles?: number;
  /** Custom validation function */
  customValidator?: (file: File) => string | null; // Returns error message or null
}

/**
 * Path generation function type
 */
export type PathGenerator = (userId: string, fileName: string, file: File) => string;

/**
 * Props for the main MediaUploader component
 */
export interface MediaUploaderProps {
  /** Supabase storage bucket name */
  bucket: string;
  /** Allowed file types (MIME types or extensions) */
  accept?: string | string[];
  /** Maximum file size in megabytes */
  maxSizeMB?: number;
  /** Minimum file size in megabytes */
  minSizeMB?: number;
  /** Allow multiple file uploads */
  multiple?: boolean;
  /** Maximum number of files (only applies if multiple is true) */
  maxFiles?: number;
  /** UI variant to display */
  variant?: UploadVariant;
  /** Show file preview after selection */
  showPreview?: boolean;
  /** Enable image cropping (only for images) */
  enableCrop?: boolean;
  /** Custom path generation function */
  generatePath?: PathGenerator;
  /** Custom validation function */
  customValidator?: (file: File) => string | null;
  /** Callback when upload starts */
  onUploadStart?: (files: File[]) => void;
  /** Callback for upload progress updates */
  onUploadProgress?: (progress: UploadProgress[]) => void;
  /** Callback when all uploads complete successfully */
  onUploadComplete?: (results: UploadResult[]) => void;
  /** Callback when an upload fails */
  onUploadError?: (error: UploadError) => void;
  /** Callback when files are selected/validated */
  onFilesSelected?: (files: File[]) => void;
  /** Callback when files are removed */
  onFilesRemoved?: (index: number) => void;
  /** Additional CSS classes */
  className?: string;
  /** Disable the uploader */
  disabled?: boolean;
  /** Placeholder text for dropzone */
  placeholder?: string;
  /** Button text for file picker */
  buttonText?: string;
  /** Auto-upload on file selection (default: true) */
  autoUpload?: boolean;
  /** Children render prop for custom UI */
  children?: (state: MediaUploaderState) => React.ReactNode;
}

/**
 * State exposed by MediaUploader for custom rendering
 */
export interface MediaUploaderState {
  /** Currently selected files */
  files: File[];
  /** Upload queue items */
  uploads: UploadQueueItem[];
  /** Overall upload status */
  status: UploadStatus;
  /** Whether uploader is busy */
  isUploading: boolean;
  /** Validation errors */
  validationErrors: string[];
  /** Completed upload results */
  results: UploadResult[];
  /** Function to trigger file selection */
  selectFiles: () => void;
  /** Function to start upload (when autoUpload is false) */
  startUpload: () => void;
  /** Function to cancel all uploads */
  cancelAll: () => void;
  /** Function to clear all state */
  clear: () => void;
}

/**
 * Options for chunked file upload
 */
export interface ChunkedUploadOptions {
  /** Chunk size in megabytes (default: 5MB) */
  chunkSizeMB?: number;
  /** Maximum concurrent chunks (default: 3) */
  maxConcurrentChunks?: number;
  /** Progress callback for chunked upload */
  onProgress?: (progress: number) => void;
}

/**
 * Audio metadata extracted from audio files
 */
export interface AudioMetadata {
  /** Duration in seconds */
  duration?: number;
  /** Sample rate in Hz */
  sampleRate?: number;
  /** Number of channels */
  channels?: number;
  /** Bitrate in kbps */
  bitrate?: number;
}

/**
 * Image metadata extracted from image files
 */
export interface ImageMetadata {
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** Aspect ratio */
  aspectRatio?: number;
}

/**
 * Generic file metadata
 */
export interface FileMetadata {
  /** File category */
  category: FileCategory;
  /** Audio-specific metadata */
  audio?: AudioMetadata;
  /** Image-specific metadata */
  image?: ImageMetadata;
}
