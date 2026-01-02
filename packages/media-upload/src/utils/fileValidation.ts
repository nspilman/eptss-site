/**
 * File validation utilities
 */

import type { FileValidationConfig } from '../types';
import { matchesAcceptPattern } from './mimeTypes';

/**
 * Validation error messages
 */
export const VALIDATION_ERRORS = {
  FILE_TOO_LARGE: (maxSizeMB: number) => `File size must not exceed ${maxSizeMB}MB`,
  FILE_TOO_SMALL: (minSizeMB: number) => `File size must be at least ${minSizeMB}MB`,
  INVALID_FILE_TYPE: (accept: string | string[]) => {
    const types = Array.isArray(accept) ? accept.join(', ') : accept;
    return `File type not allowed. Accepted types: ${types}`;
  },
  TOO_MANY_FILES: (maxFiles: number) => `Cannot upload more than ${maxFiles} file${maxFiles > 1 ? 's' : ''}`,
  GENERIC_ERROR: 'Invalid file',
} as const;

/**
 * Convert megabytes to bytes
 */
export function mbToBytes(mb: number): number {
  return mb * 1024 * 1024;
}

/**
 * Convert bytes to megabytes
 */
export function bytesToMb(bytes: number): number {
  return bytes / (1024 * 1024);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validate a single file against configuration
 * Returns error message or null if valid
 */
export function validateFile(file: File, config: FileValidationConfig): string | null {
  // Check file size (maximum)
  if (config.maxSizeMB !== undefined) {
    const maxBytes = mbToBytes(config.maxSizeMB);
    if (file.size > maxBytes) {
      return VALIDATION_ERRORS.FILE_TOO_LARGE(config.maxSizeMB);
    }
  }

  // Check file size (minimum)
  if (config.minSizeMB !== undefined) {
    const minBytes = mbToBytes(config.minSizeMB);
    if (file.size < minBytes) {
      return VALIDATION_ERRORS.FILE_TOO_SMALL(config.minSizeMB);
    }
  }

  // Check file type
  if (config.accept) {
    if (!matchesAcceptPattern(file, config.accept)) {
      return VALIDATION_ERRORS.INVALID_FILE_TYPE(config.accept);
    }
  }

  // Run custom validator if provided
  if (config.customValidator) {
    const customError = config.customValidator(file);
    if (customError) {
      return customError;
    }
  }

  return null;
}

/**
 * Validate multiple files against configuration
 * Returns array of errors (index matches file array)
 */
export function validateFiles(files: File[], config: FileValidationConfig): (string | null)[] {
  // Check file count
  if (config.maxFiles !== undefined && files.length > config.maxFiles) {
    // Return the same error for all files
    const error = VALIDATION_ERRORS.TOO_MANY_FILES(config.maxFiles);
    return files.map(() => error);
  }

  // Validate each file individually
  return files.map((file) => validateFile(file, config));
}

/**
 * Filter out invalid files and return only valid ones with their errors
 */
export function getValidFiles(
  files: File[],
  config: FileValidationConfig
): { validFiles: File[]; errors: Array<{ file: File; error: string }> } {
  const errors = validateFiles(files, config);

  const validFiles: File[] = [];
  const invalidFiles: Array<{ file: File; error: string }> = [];

  files.forEach((file, index) => {
    const error = errors[index];
    if (error === null) {
      validFiles.push(file);
    } else {
      invalidFiles.push({ file, error });
    }
  });

  return {
    validFiles,
    errors: invalidFiles,
  };
}

/**
 * Check if any files are valid
 */
export function hasValidFiles(files: File[], config: FileValidationConfig): boolean {
  return validateFiles(files, config).some((error) => error === null);
}
