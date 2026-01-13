'use server';

/**
 * Server actions for media upload
 */

import { uploadFile, deleteFile, getPublicUrl, createSignedUploadUrl } from '@eptss/bucket-storage';
import type { UploadResult, UploadError } from '../types';
import { validateFile } from '../utils/fileValidation';
import { sanitizeFileName, generateUniqueFileName } from '../utils/mimeTypes';

/**
 * Upload a single file to Supabase storage
 */
export async function uploadMediaFile(
  bucket: string,
  file: File,
  path?: string,
  options?: {
    upsert?: boolean;
    validateSize?: number; // Max size in MB for server-side validation
    validateType?: string | string[]; // Allowed MIME types for server-side validation
    metadata?: Record<string, unknown>; // Optional metadata to include in the result
  }
): Promise<{ result: UploadResult | null; error: UploadError | null }> {
  try {
    // Server-side validation
    if (options?.validateSize || options?.validateType) {
      const validationError = validateFile(file, {
        maxSizeMB: options.validateSize,
        accept: options.validateType,
      });

      if (validationError) {
        return {
          result: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationError,
            file,
          },
        };
      }
    }

    // Generate path if not provided
    const filePath = path || generateUniqueFileName(file.name);

    // Upload file using bucket-storage
    const { url, error } = await uploadFile(bucket as any, filePath, file, {
      upsert: options?.upsert,
      contentType: file.type,
    });

    if (error || !url) {
      return {
        result: null,
        error: {
          code: 'UPLOAD_ERROR',
          message: error || 'Upload failed',
          file,
        },
      };
    }

    // Return upload result with optional metadata from client
    const result: UploadResult = {
      url,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      path: filePath,
      uploadedAt: new Date(),
      ...(options?.metadata && { metadata: options.metadata }),
    };

    return { result, error: null };
  } catch (err) {
    return {
      result: null,
      error: {
        code: 'UNKNOWN_ERROR',
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        file,
      },
    };
  }
}

/**
 * Upload multiple files to Supabase storage
 */
export async function uploadMediaFiles(
  bucket: string,
  files: File[],
  generatePath?: (file: File) => string,
  options?: {
    upsert?: boolean;
    validateSize?: number;
    validateType?: string | string[];
  }
): Promise<{
  results: UploadResult[];
  errors: UploadError[];
}> {
  const results: UploadResult[] = [];
  const errors: UploadError[] = [];

  // Upload files sequentially to avoid overwhelming the server
  // In production, you might want to implement batching or parallel uploads with a limit
  for (const file of files) {
    const path = generatePath ? generatePath(file) : generateUniqueFileName(file.name);

    const { result, error } = await uploadMediaFile(bucket, file, path, options);

    if (result) {
      results.push(result);
    }

    if (error) {
      errors.push(error);
    }
  }

  return { results, errors };
}

/**
 * Delete a media file from storage
 */
export async function deleteMediaFile(
  bucket: string,
  path: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    return await deleteFile(bucket as any, path);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get public URL for a media file
 */
export async function getMediaFileUrl(bucket: string, path: string): Promise<string> {
  try {
    return await getPublicUrl(bucket as any, path);
  } catch (err) {
    throw err;
  }
}

/**
 * Get a signed upload URL for direct client-to-storage uploads
 * This bypasses server size limits (like Vercel's 4.5MB limit) by letting
 * the client upload directly to Supabase storage.
 *
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket (optional, will be generated if not provided)
 * @param fileName - Original file name (used to generate path if path not provided)
 * @returns The signed upload URL, token, and path for direct upload
 */
export async function getSignedUploadUrl(
  bucket: string,
  path?: string,
  fileName?: string
): Promise<{
  signedUrl: string | null;
  token: string | null;
  path: string | null;
  publicUrl: string | null;
  error: string | null;
}> {
  try {
    // Generate path if not provided
    const filePath = path || generateUniqueFileName(fileName || 'file');

    const { signedUrl, token, error } = await createSignedUploadUrl(bucket as any, filePath);

    if (error || !signedUrl || !token) {
      return {
        signedUrl: null,
        token: null,
        path: null,
        publicUrl: null,
        error: error || 'Failed to create signed upload URL',
      };
    }

    // Get the public URL that will be available after upload
    const publicUrl = await getPublicUrl(bucket as any, filePath);

    return {
      signedUrl,
      token,
      path: filePath,
      publicUrl,
      error: null,
    };
  } catch (err) {
    return {
      signedUrl: null,
      token: null,
      path: null,
      publicUrl: null,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

