/**
 * File preview utilities
 */

import type { FileCategory, FileMetadata, AudioMetadata, ImageMetadata } from '../types';
import { getFileCategory } from './mimeTypes';

/**
 * Create a preview URL for a file (for images and videos)
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL to free memory
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Extract metadata from an image file
 */
export function extractImageMetadata(file: File): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = createPreviewUrl(file);

    img.onload = () => {
      const metadata: ImageMetadata = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
      };
      revokePreviewUrl(url);
      resolve(metadata);
    };

    img.onerror = () => {
      revokePreviewUrl(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Extract metadata from an audio file
 */
export function extractAudioMetadata(file: File): Promise<AudioMetadata> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = createPreviewUrl(file);

    audio.onloadedmetadata = () => {
      const metadata: AudioMetadata = {
        duration: audio.duration,
        // Note: sampleRate, channels, and bitrate require Web Audio API
        // which is more complex - we'll add that in the AudioPreview component
      };
      revokePreviewUrl(url);
      resolve(metadata);
    };

    audio.onerror = () => {
      revokePreviewUrl(url);
      reject(new Error('Failed to load audio'));
    };

    audio.src = url;
  });
}

/**
 * Extract metadata from a file based on its category
 */
export async function extractFileMetadata(file: File): Promise<FileMetadata> {
  const category = getFileCategory(file.type);
  const metadata: FileMetadata = { category };

  try {
    if (category === 'image') {
      metadata.image = await extractImageMetadata(file);
    } else if (category === 'audio') {
      metadata.audio = await extractAudioMetadata(file);
    }
  } catch (error) {
    // Metadata extraction is optional, so we don't throw
    console.warn('Failed to extract file metadata:', error);
  }

  return metadata;
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '--:--';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(hours.toString());
    parts.push(minutes.toString().padStart(2, '0'));
  } else {
    parts.push(minutes.toString());
  }

  parts.push(secs.toString().padStart(2, '0'));

  return parts.join(':');
}

/**
 * Check if a file can have a visual preview
 */
export function canPreview(file: File): boolean {
  const category = getFileCategory(file.type);
  return category === 'image' || category === 'video';
}

/**
 * Check if a file is an audio file
 */
export function isAudio(file: File): boolean {
  return getFileCategory(file.type) === 'audio';
}

/**
 * Check if a file is an image file
 */
export function isImage(file: File): boolean {
  return getFileCategory(file.type) === 'image';
}

/**
 * Check if a file is a video file
 */
export function isVideo(file: File): boolean {
  return getFileCategory(file.type) === 'video';
}
