/**
 * MIME type utilities and constants
 */

import type { FileCategory } from '../types';

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
 * All supported MIME types
 */
export const ALL_MIME_TYPES = [
  ...MIME_PATTERNS.AUDIO,
  ...MIME_PATTERNS.IMAGE,
  ...MIME_PATTERNS.VIDEO,
  ...MIME_PATTERNS.DOCUMENT,
] as const;

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

/**
 * Check if MIME type matches a pattern (supports wildcards)
 * e.g., 'audio/*' matches 'audio/mp3'
 */
export function matchesMimePattern(mimeType: string, pattern: string): boolean {
  if (pattern === '*/*') return true;
  if (pattern.endsWith('/*')) {
    const prefix = pattern.slice(0, -2);
    return mimeType.startsWith(prefix);
  }
  return mimeType === pattern;
}

/**
 * Check if file matches any of the provided accept patterns
 */
export function matchesAcceptPattern(file: File, accept: string | string[]): boolean {
  const patterns = Array.isArray(accept) ? accept : [accept];

  return patterns.some((pattern) => {
    // Handle MIME type patterns
    if (pattern.includes('/')) {
      return matchesMimePattern(file.type, pattern);
    }

    // Handle file extension patterns (e.g., '.mp3')
    if (pattern.startsWith('.')) {
      return file.name.toLowerCase().endsWith(pattern.toLowerCase());
    }

    return false;
  });
}

/**
 * Get file extension from filename
 */
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return '';
  return fileName.slice(lastDot + 1).toLowerCase();
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFileName(fileName: string): string {
  // Remove or replace special characters
  const sanitized = fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^[._-]+|[._-]+$/g, ''); // Remove leading/trailing special chars

  // Ensure we still have a filename
  return sanitized || 'file';
}

/**
 * Generate unique filename with timestamp
 */
export function generateUniqueFileName(originalName: string): string {
  const extension = getFileExtension(originalName);
  const nameWithoutExt = originalName.slice(0, originalName.lastIndexOf('.') || originalName.length);
  const sanitized = sanitizeFileName(nameWithoutExt);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return extension
    ? `${sanitized}-${timestamp}-${random}.${extension}`
    : `${sanitized}-${timestamp}-${random}`;
}
