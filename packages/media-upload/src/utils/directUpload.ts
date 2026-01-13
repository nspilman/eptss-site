/**
 * Client-side direct upload utility
 * Uploads files directly to Supabase storage using signed URLs,
 * bypassing server size limits (like Vercel's 4.5MB limit)
 */

import { getSignedUploadUrl } from '../actions/uploadActions';
import type { UploadResult, UploadError } from '../types';
import { generateUniqueFileName } from './mimeTypes';

/**
 * Performs direct upload using signed URL (runs on client)
 * 1. Gets a signed upload URL from the server (small request)
 * 2. Uploads the file directly to Supabase storage (bypasses server completely)
 *
 * @param bucket - The storage bucket name
 * @param file - The file to upload
 * @param path - Optional file path (will be generated if not provided)
 * @param options - Upload options including metadata
 * @returns Upload result with URL and file info, or error
 */
export async function uploadWithSignedUrl(
  bucket: string,
  file: File,
  path?: string,
  options?: {
    metadata?: Record<string, unknown>;
  }
): Promise<{ result: UploadResult | null; error: UploadError | null }> {
  try {
    // Generate path if not provided
    const filePath = path || generateUniqueFileName(file.name);

    // Step 1: Get signed upload URL from server (small request, no file data)
    const { signedUrl, publicUrl, error: urlError } = await getSignedUploadUrl(
      bucket,
      filePath,
      file.name
    );

    if (urlError || !signedUrl || !publicUrl) {
      return {
        result: null,
        error: {
          code: 'SIGNED_URL_ERROR',
          message: urlError || 'Failed to get signed upload URL',
          file,
        },
      };
    }

    // Step 2: Upload directly to the signed URL (bypasses server completely!)
    // The file data goes directly from client browser to Supabase storage
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text().catch(() => 'Unknown error');
      return {
        result: null,
        error: {
          code: 'DIRECT_UPLOAD_ERROR',
          message: `Direct upload failed: ${uploadResponse.status} ${errorText}`,
          file,
        },
      };
    }

    // Return upload result
    const result: UploadResult = {
      url: publicUrl,
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
