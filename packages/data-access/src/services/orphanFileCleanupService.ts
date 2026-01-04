"use server";

import { deleteFile, listFiles, BUCKETS, BucketName } from "@eptss/bucket-storage";
import {
  getExpiredPendingUploads,
  deletePendingUploadRecord,
  cleanupOldUploadRecords,
} from "./uploadTrackingService";

interface CleanupResult {
  bucket: string;
  filesScanned: number;
  filesDeleted: number;
  errors: string[];
}

interface CleanupSummary {
  totalFilesScanned: number;
  totalFilesDeleted: number;
  totalErrors: number;
  results: CleanupResult[];
  duration: number;
}

/**
 * Clean up expired pending uploads
 * This removes files that were uploaded but never committed to the database
 */
export async function cleanupExpiredUploads(): Promise<{
  filesDeleted: number;
  errors: string[];
}> {
  const startTime = Date.now();
  let filesDeleted = 0;
  const errors: string[] = [];

  try {
    console.log("[orphanFileCleanupService] Starting cleanup of expired uploads");

    // Get all expired pending uploads
    const { uploads, error } = await getExpiredPendingUploads();

    if (error) {
      errors.push(`Failed to get expired uploads: ${error}`);
      return { filesDeleted, errors };
    }

    console.log(`[orphanFileCleanupService] Found ${uploads.length} expired uploads to clean`);

    // Delete each expired upload file and record
    for (const upload of uploads) {
      try {
        // Delete the file from storage
        const deleteResult = await deleteFile(
          upload.bucket as BucketName,
          upload.filePath
        );

        if (deleteResult.error) {
          errors.push(
            `Failed to delete file ${upload.filePath} from ${upload.bucket}: ${deleteResult.error}`
          );
          continue;
        }

        // Delete the tracking record
        const recordDeleteResult = await deletePendingUploadRecord(upload.id);

        if (recordDeleteResult.error) {
          errors.push(
            `Failed to delete pending upload record ${upload.id}: ${recordDeleteResult.error}`
          );
          continue;
        }

        filesDeleted++;
        console.log(
          `[orphanFileCleanupService] Cleaned up expired upload: ${upload.bucket}/${upload.filePath}`
        );
      } catch (error) {
        errors.push(
          `Error cleaning up ${upload.bucket}/${upload.filePath}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    const duration = Date.now() - startTime;
    console.log(
      `[orphanFileCleanupService] Cleanup completed in ${duration}ms. Deleted ${filesDeleted} files with ${errors.length} errors`
    );

    return { filesDeleted, errors };
  } catch (error) {
    errors.push(
      `Cleanup failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return { filesDeleted, errors };
  }
}

/**
 * Clean up old tracking records (housekeeping)
 * Removes committed/failed records older than specified days
 */
export async function cleanupOldTrackingRecords(
  daysToKeep: number = 30
): Promise<{
  deletedCount: number;
  error: string | null;
}> {
  console.log(
    `[orphanFileCleanupService] Cleaning up tracking records older than ${daysToKeep} days`
  );

  const result = await cleanupOldUploadRecords(daysToKeep);

  if (result.error) {
    console.error("[orphanFileCleanupService] Failed to cleanup old records:", result.error);
  } else {
    console.log(
      `[orphanFileCleanupService] Cleaned up ${result.deletedCount} old tracking records`
    );
  }

  return result;
}

/**
 * Comprehensive cleanup job
 * Runs both expired upload cleanup and old record cleanup
 */
export async function runComprehensiveCleanup(
  oldRecordsDaysToKeep: number = 30
): Promise<{
  expiredUploads: { filesDeleted: number; errors: string[] };
  oldRecords: { deletedCount: number; error: string | null };
  totalDuration: number;
}> {
  const startTime = Date.now();

  console.log("[orphanFileCleanupService] Starting comprehensive cleanup");

  // Clean up expired uploads
  const expiredUploads = await cleanupExpiredUploads();

  // Clean up old tracking records
  const oldRecords = await cleanupOldTrackingRecords(oldRecordsDaysToKeep);

  const totalDuration = Date.now() - startTime;

  console.log(
    `[orphanFileCleanupService] Comprehensive cleanup completed in ${totalDuration}ms`
  );
  console.log(`  - Expired uploads deleted: ${expiredUploads.filesDeleted}`);
  console.log(`  - Old records deleted: ${oldRecords.deletedCount}`);
  console.log(`  - Total errors: ${expiredUploads.errors.length + (oldRecords.error ? 1 : 0)}`);

  return {
    expiredUploads,
    oldRecords,
    totalDuration,
  };
}

/**
 * Get cleanup statistics without performing cleanup
 * Useful for monitoring and dashboards
 */
export async function getCleanupStats(): Promise<{
  pendingExpiredCount: number;
  error: string | null;
}> {
  try {
    const { uploads, error } = await getExpiredPendingUploads();

    if (error) {
      return { pendingExpiredCount: 0, error };
    }

    return { pendingExpiredCount: uploads.length, error: null };
  } catch (error) {
    return {
      pendingExpiredCount: 0,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
