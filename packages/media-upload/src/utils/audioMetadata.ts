/**
 * Audio Metadata Extraction Utilities
 *
 * Utilities for extracting metadata from audio files
 */

import type { AudioMetadata } from '../types';

/**
 * Extract audio metadata from an audio file
 * Uses the HTML5 Audio API to get duration and other metadata
 */
export async function extractAudioMetadata(file: File): Promise<AudioMetadata> {
  return new Promise((resolve) => {
    // Create an audio element
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);

    // Set up event handlers
    audio.addEventListener('loadedmetadata', () => {
      const metadata: AudioMetadata = {
        duration: audio.duration && isFinite(audio.duration) ? audio.duration : undefined,
      };

      // Clean up
      URL.revokeObjectURL(objectUrl);

      resolve(metadata);
    });

    // Handle error case
    audio.addEventListener('error', () => {
      // Clean up
      URL.revokeObjectURL(objectUrl);

      // Return empty metadata on error
      resolve({});
    });

    // Start loading the audio
    audio.src = objectUrl;
  });
}

/**
 * Check if a file is an audio file based on MIME type
 */
export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/');
}
