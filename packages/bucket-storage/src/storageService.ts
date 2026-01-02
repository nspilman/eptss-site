import { createClient } from "@eptss/data-access/utils/supabase/server";

export const BUCKETS = {
  PROFILE_PICTURES: "profile-pictures",
  AUDIO_SUBMISSIONS: "audio-submissions",
  SUBMISSION_IMAGES: "submission-images",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

/**
 * Upload a file to Supabase storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param file - The file to upload
 * @param options - Upload options (upsert, contentType, etc.)
 * @returns The public URL of the uploaded file or error
 */
export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File | Blob,
  options?: {
    upsert?: boolean;
    contentType?: string;
  }
): Promise<{ url: string | null; error: string | null }> {
  "use server";
  try {
    const supabase = await createClient();

    // Convert File/Blob to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        upsert: options?.upsert ?? false,
        contentType: options?.contentType || (file as File).type || 'application/octet-stream',
      });

    if (error) {
      console.error("Upload error:", error);
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (error) {
    console.error("Upload file error:", error);
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
  "use server";
  try {
    const supabase = await createClient();

    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error("Delete error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Delete file error:", error);
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
 */
export async function getPublicUrl(
  bucket: BucketName,
  path: string
): Promise<string> {
  "use server";
  const supabase = await createClient();

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Generate a unique file path for a user's profile picture
 * @param userId - The user ID
 * @param fileName - Original file name
 * @returns A unique file path
 */
export function generateProfilePicturePath(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const extension = fileName.split('.').pop() || 'jpg';
  return `${userId}/${timestamp}.${extension}`;
}
