/**
 * Server-side file validation utilities
 * Provides MIME type verification and magic number validation
 */

import { logger } from "@eptss/logger/server";

/**
 * Audio file magic numbers (file signatures)
 * These are the first bytes of the file that identify the file type
 */
const AUDIO_MAGIC_NUMBERS = {
  // MP3
  mp3: [
    [0xff, 0xfb], // MPEG-1 Layer 3
    [0xff, 0xf3], // MPEG-2 Layer 3
    [0xff, 0xf2], // MPEG-2.5 Layer 3
    [0x49, 0x44, 0x33], // ID3v2 tag (also MP3)
  ],
  // WAV
  wav: [[0x52, 0x49, 0x46, 0x46]], // "RIFF"
  // FLAC
  flac: [[0x66, 0x4c, 0x61, 0x43]], // "fLaC"
  // OGG (Vorbis, Opus)
  ogg: [[0x4f, 0x67, 0x67, 0x53]], // "OggS"
  // M4A/AAC
  m4a: [
    [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], // ftyp at offset 4
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp at offset 4
  ],
  // AIFF
  aiff: [[0x46, 0x4f, 0x52, 0x4d]], // "FORM"
};

/**
 * Image file magic numbers
 */
const IMAGE_MAGIC_NUMBERS = {
  // JPEG
  jpeg: [[0xff, 0xd8, 0xff]],
  // PNG
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  // GIF
  gif: [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  // WebP
  webp: [[0x52, 0x49, 0x46, 0x46]], // "RIFF" (need to check "WEBP" at offset 8)
};

/**
 * Allowed MIME types for audio files
 */
const ALLOWED_AUDIO_MIMES = [
  "audio/mpeg", // MP3
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/flac",
  "audio/x-flac",
  "audio/ogg",
  "audio/opus",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aiff",
  "audio/x-aiff",
] as const;

/**
 * Allowed MIME types for images
 */
const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

/**
 * Maximum allowed audio duration in seconds (30 minutes)
 * Prevents DoS attacks via extremely long files
 */
export const MAX_AUDIO_DURATION_SECONDS = 30 * 60; // 30 minutes

/**
 * Maximum allowed audio file size in bytes (50 MB)
 */
export const MAX_AUDIO_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * Maximum allowed image file size in bytes (5 MB)
 */
export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Server-side validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  details?: {
    mimeType?: string;
    detectedType?: string;
    fileSize?: number;
    duration?: number;
  };
}

/**
 * Check if bytes match a magic number signature
 */
function matchesMagicNumber(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false;

  for (let i = 0; i < signature.length; i++) {
    if (bytes[i] !== signature[i]) return false;
  }

  return true;
}

/**
 * Detect file type from magic number
 */
function detectFileType(bytes: Uint8Array): string | undefined {
  // Check audio types
  for (const [type, signatures] of Object.entries(AUDIO_MAGIC_NUMBERS)) {
    for (const signature of signatures) {
      if (matchesMagicNumber(bytes, signature)) {
        return `audio/${type}`;
      }
    }
  }

  // Check image types
  for (const [type, signatures] of Object.entries(IMAGE_MAGIC_NUMBERS)) {
    for (const signature of signatures) {
      if (matchesMagicNumber(bytes, signature)) {
        return `image/${type}`;
      }
    }
  }

  // Special case for WebP - need to check "WEBP" at offset 8
  if (matchesMagicNumber(bytes, [0x52, 0x49, 0x46, 0x46]) && bytes.length >= 12) {
    if (
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      return "image/webp";
    }
  }

  return undefined;
}

/**
 * Validate audio file on server
 * Checks MIME type, magic number, file size, and duration
 */
export async function validateAudioFile(
  file: File | Blob,
  options?: {
    maxDurationSeconds?: number;
    maxFileSizeBytes?: number;
    providedDuration?: number; // Duration in seconds provided by client
  }
): Promise<ValidationResult> {
  try {
    const maxDuration = options?.maxDurationSeconds ?? MAX_AUDIO_DURATION_SECONDS;
    const maxFileSize = options?.maxFileSizeBytes ?? MAX_AUDIO_FILE_SIZE_BYTES;

    // 1. Check file size
    if (file.size > maxFileSize) {
      logger.warn("Audio file size exceeds limit", {
        fileSize: file.size,
        maxFileSize,
      });
      return {
        valid: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed size (${(maxFileSize / 1024 / 1024).toFixed(0)} MB)`,
        details: { fileSize: file.size },
      };
    }

    // 2. Check MIME type (from File object)
    const mimeType = (file as File).type || "application/octet-stream";
    if (!ALLOWED_AUDIO_MIMES.includes(mimeType as any)) {
      logger.warn("Invalid audio MIME type", { mimeType });
      return {
        valid: false,
        error: `Invalid audio file type: ${mimeType}. Allowed types: ${ALLOWED_AUDIO_MIMES.join(", ")}`,
        details: { mimeType },
      };
    }

    // 3. Verify magic number (read first 12 bytes)
    const arrayBuffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const detectedType = detectFileType(bytes);

    if (!detectedType || !detectedType.startsWith("audio/")) {
      logger.warn("File magic number does not match audio type", {
        mimeType,
        detectedType,
      });
      return {
        valid: false,
        error: "File content does not match expected audio format",
        details: { mimeType, detectedType },
      };
    }

    // 4. Validate duration if provided
    if (options?.providedDuration !== undefined) {
      if (options.providedDuration > maxDuration) {
        logger.warn("Audio duration exceeds limit", {
          duration: options.providedDuration,
          maxDuration,
        });
        return {
          valid: false,
          error: `Audio duration (${Math.round(options.providedDuration / 60)} minutes) exceeds maximum allowed duration (${Math.round(maxDuration / 60)} minutes)`,
          details: {
            duration: options.providedDuration,
            mimeType,
            detectedType,
          },
        };
      }

      // Duration should be positive
      if (options.providedDuration <= 0) {
        logger.warn("Invalid audio duration", { duration: options.providedDuration });
        return {
          valid: false,
          error: "Invalid audio duration",
          details: { duration: options.providedDuration },
        };
      }
    }

    // All validations passed
    logger.debug("Audio file validation successful", {
      mimeType,
      detectedType,
      fileSize: file.size,
      duration: options?.providedDuration,
    });

    return {
      valid: true,
      details: {
        mimeType,
        detectedType,
        fileSize: file.size,
        duration: options?.providedDuration,
      },
    };
  } catch (error) {
    logger.error("Audio file validation error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      valid: false,
      error: "Failed to validate audio file",
    };
  }
}

/**
 * Validate image file on server
 * Checks MIME type, magic number, and file size
 */
export async function validateImageFile(
  file: File | Blob,
  options?: {
    maxFileSizeBytes?: number;
  }
): Promise<ValidationResult> {
  try {
    const maxFileSize = options?.maxFileSizeBytes ?? MAX_IMAGE_FILE_SIZE_BYTES;

    // 1. Check file size
    if (file.size > maxFileSize) {
      logger.warn("Image file size exceeds limit", {
        fileSize: file.size,
        maxFileSize,
      });
      return {
        valid: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed size (${(maxFileSize / 1024 / 1024).toFixed(0)} MB)`,
        details: { fileSize: file.size },
      };
    }

    // 2. Check MIME type (from File object)
    const mimeType = (file as File).type || "application/octet-stream";
    if (!ALLOWED_IMAGE_MIMES.includes(mimeType as any)) {
      logger.warn("Invalid image MIME type", { mimeType });
      return {
        valid: false,
        error: `Invalid image file type: ${mimeType}. Allowed types: ${ALLOWED_IMAGE_MIMES.join(", ")}`,
        details: { mimeType },
      };
    }

    // 3. Verify magic number (read first 12 bytes)
    const arrayBuffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const detectedType = detectFileType(bytes);

    if (!detectedType || !detectedType.startsWith("image/")) {
      logger.warn("File magic number does not match image type", {
        mimeType,
        detectedType,
      });
      return {
        valid: false,
        error: "File content does not match expected image format",
        details: { mimeType, detectedType },
      };
    }

    // All validations passed
    logger.debug("Image file validation successful", {
      mimeType,
      detectedType,
      fileSize: file.size,
    });

    return {
      valid: true,
      details: {
        mimeType,
        detectedType,
        fileSize: file.size,
      },
    };
  } catch (error) {
    logger.error("Image file validation error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      valid: false,
      error: "Failed to validate image file",
    };
  }
}

/**
 * Convert File to Blob for validation
 * Useful when receiving FormData on server
 */
export async function fileToBlob(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  return new Blob([arrayBuffer], { type: file.type });
}
