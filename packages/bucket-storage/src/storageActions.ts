"use server";

import { createClient } from "@eptss/core/utils/supabase/server";
import { logger } from "@eptss/logger/server";
import {
  validateAudioFile,
  validateImageFile,
  type ValidationResult,
} from "@eptss/core/utils/serverFileValidation";
import { BUCKETS, type BucketName } from "./storageService";

/**
 * Upload a file to Supabase storage with server-side validation
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param file - The file to upload
 * @param options - Upload options (upsert, contentType, validation metadata)
 * @returns The public URL of the uploaded file or error
 */
export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File | Blob,
  options?: {
    upsert?: boolean;
    contentType?: string;
    /** Audio duration in seconds (for validation) */
    audioDuration?: number;
    /** Skip server-side validation (not recommended) */
    skipValidation?: boolean;
  }
): Promise<{ url: string | null; error: string | null }> {
  try {
    logger.debug('uploadFile called', { bucket, path });

    // SERVER-SIDE VALIDATION
    // Validate file type and content before uploading
    if (!options?.skipValidation) {
      let validation: ValidationResult;

      if (bucket === BUCKETS.AUDIO_SUBMISSIONS) {
        // Validate audio files
        validation = await validateAudioFile(file, {
          providedDuration: options?.audioDuration,
        });
      } else if (bucket === BUCKETS.SUBMISSION_IMAGES || bucket === BUCKETS.PROFILE_PICTURES) {
        // Validate image files
        validation = await validateImageFile(file);
      } else {
        // Unknown bucket - skip validation
        logger.warn("Unknown bucket type, skipping validation", { bucket });
        validation = { valid: true };
      }

      if (!validation.valid) {
        logger.error("File validation failed", {
          bucket,
          path,
          error: validation.error,
          details: validation.details,
        });
        return { url: null, error: validation.error || "File validation failed" };
      }

      logger.debug("File validation successful", {
        bucket,
        path,
        details: validation.details,
      });
    }

    const supabase = await createClient();

    // Convert File/Blob to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    logger.debug('Calling supabase.storage upload', { bucket, path });
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        upsert: options?.upsert ?? false,
        contentType: options?.contentType || (file as File).type || 'application/octet-stream',
      });

    if (error) {
      logger.error("Upload error", { bucket, error: error.message });
      return { url: null, error: error.message };
    }

    logger.debug('Upload successful', { bucket, path, uploadPath: data.path });

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (error) {
    logger.error("Upload file error", { error: error instanceof Error ? error.message : "Unknown error" });
    return {
      url: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a file from Supabase storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns Success or error
 */
export async function deleteFile(
  bucket: BucketName,
  path: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      logger.error("Delete error", { bucket, path, error: error.message });
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    logger.error("Delete file error", { bucket, path, error: error instanceof Error ? error.message : "Unknown error" });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get the public URL for a file in storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns The public URL
 *
 * @deprecated Use getSignedUrl for better security, or use this only for truly public files
 */
export async function getPublicUrl(
  bucket: BucketName,
  path: string
): Promise<string> {
  const supabase = await createClient();

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Get a signed URL with expiration for a file in storage
 * Provides better security than public URLs by:
 * - Requiring authentication to generate
 * - Expiring after a set time
 * - Being revocable
 *
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param options - Signed URL options
 * @returns The signed URL with expiration or error
 */
export async function getSignedUrl(
  bucket: BucketName,
  path: string,
  options?: {
    /** Expiration time in seconds (default: 1 hour) */
    expiresIn?: number;
    /** Download file instead of displaying inline */
    download?: boolean | string; // true or filename
  }
): Promise<{ url: string | null; error: string | null; expiresAt?: Date }> {
  try {
    const supabase = await createClient();

    const expiresIn = options?.expiresIn ?? 3600; // Default 1 hour

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn, {
        download: options?.download,
      });

    if (error) {
      logger.error("Create signed URL error", { bucket, path, error: error.message });
      return { url: null, error: error.message };
    }

    if (!data || !data.signedUrl) {
      logger.error("No signed URL returned", { bucket, path });
      return { url: null, error: "Failed to generate signed URL" };
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    logger.debug("Signed URL created", { bucket, path, expiresAt });

    return { url: data.signedUrl, error: null, expiresAt };
  } catch (error) {
    logger.error("Get signed URL error", {
      bucket,
      path,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      url: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get multiple signed URLs in batch
 * Useful for gallery views or lists of files
 *
 * @param bucket - The storage bucket name
 * @param paths - Array of file paths
 * @param options - Signed URL options
 * @returns Array of signed URLs with their paths
 */
export async function getSignedUrls(
  bucket: BucketName,
  paths: string[],
  options?: {
    expiresIn?: number;
    download?: boolean | string;
  }
): Promise<Array<{ path: string; url: string | null; error: string | null; expiresAt?: Date }>> {
  // Process in parallel for better performance
  const results = await Promise.all(
    paths.map(async (path) => {
      const result = await getSignedUrl(bucket, path, options);
      return {
        path,
        ...result,
      };
    })
  );

  return results;
}

/**
 * List all files in a bucket with optional path prefix
 * @param bucket - The storage bucket name
 * @param options - List options (path prefix, limit, offset)
 * @returns List of file metadata or error
 */
/**
 * Create a signed upload URL for direct client-to-storage uploads
 * This bypasses server size limits (like Vercel's 4.5MB limit) by letting
 * the client upload directly to Supabase storage.
 *
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns The signed upload URL and token, or error
 */
export async function createSignedUploadUrl(
  bucket: BucketName,
  path: string
): Promise<{
  signedUrl: string | null;
  token: string | null;
  path: string | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error) {
      logger.error("Create signed upload URL error", { bucket, path, error: error.message });
      return { signedUrl: null, token: null, path: null, error: error.message };
    }

    if (!data) {
      logger.error("No signed upload URL returned", { bucket, path });
      return { signedUrl: null, token: null, path: null, error: "Failed to generate signed upload URL" };
    }

    logger.debug("Signed upload URL created", { bucket, path });

    return {
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      error: null,
    };
  } catch (error) {
    logger.error("Create signed upload URL error", {
      bucket,
      path,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      signedUrl: null,
      token: null,
      path: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Upload a file using a signed upload URL (client-side)
 * Call this from the client after getting a signed URL from createSignedUploadUrl
 *
 * @param signedUrl - The signed upload URL from createSignedUploadUrl
 * @param token - The upload token from createSignedUploadUrl
 * @param file - The file to upload
 * @returns Success status and any error
 */
export async function uploadToSignedUrl(
  bucket: BucketName,
  path: string,
  token: string,
  file: File | Blob
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.storage
      .from(bucket)
      .uploadToSignedUrl(path, token, file, {
        contentType: (file as File).type || 'application/octet-stream',
      });

    if (error) {
      logger.error("Upload to signed URL error", { bucket, path, error: error.message });
      return { success: false, error: error.message };
    }

    logger.debug("Upload to signed URL successful", { bucket, path });
    return { success: true, error: null };
  } catch (error) {
    logger.error("Upload to signed URL error", {
      bucket,
      path,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function listFiles(
  bucket: BucketName,
  options?: {
    path?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{
  files: Array<{ name: string; id: string; updated_at: string; created_at: string; last_accessed_at: string; metadata: any }> | null;
  error: string | null
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(options?.path || '', {
        limit: options?.limit || 1000,
        offset: options?.offset || 0,
      });

    if (error) {
      logger.error("List files error", { bucket, error: error.message });
      return { files: null, error: error.message };
    }

    return { files: data, error: null };
  } catch (error) {
    logger.error("List files error", { bucket, error: error instanceof Error ? error.message : "Unknown error" });
    return {
      files: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
