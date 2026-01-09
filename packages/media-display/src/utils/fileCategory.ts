/**
 * File category utilities
 */

export type FileCategory = 'audio' | 'image' | 'video' | 'document' | 'other';

/**
 * Common MIME type patterns
 */
export const MIME_PATTERNS = {
  AUDIO: [
    'audio/mpeg', // MP3
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/m4a',
    'audio/mp4',
    'audio/aac',
    'audio/x-aac',
    'audio/ogg',
    'audio/opus',
    'audio/flac',
    'audio/x-flac',
    'audio/webm',
  ],
  IMAGE: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
  ],
  VIDEO: [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
  ],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ],
} as const;

/**
 * Get file category from MIME type
 */
export function getFileCategory(mimeType: string): FileCategory {
  if (MIME_PATTERNS.AUDIO.includes(mimeType as any)) return 'audio';
  if (MIME_PATTERNS.IMAGE.includes(mimeType as any)) return 'image';
  if (MIME_PATTERNS.VIDEO.includes(mimeType as any)) return 'video';
  if (MIME_PATTERNS.DOCUMENT.includes(mimeType as any)) return 'document';
  return 'other';
}
