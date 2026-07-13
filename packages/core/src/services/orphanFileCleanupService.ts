"use server";

import { deleteFile, listFiles, BUCKETS, BucketName } from "@eptss/bucket-storage";
import { logger } from "@eptss/logger/server";
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
    logger.info("Starting cleanup of expired uploads", {
      component: "orphanFileCleanupService",
    });

    // Get all expired pending uploads
    const { uploads, error } = await getExpiredPendingUploads();

    if (error) {
      errors.push(`Failed to get expired uploads: ${error}`);
      return { filesDeleted, errors };
    }

    logger.info("Found expired uploads to clean", {
      component: "orphanFileCleanupService",
      count: uploads.length,
    });

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
        logger.info("Cleaned up expired upload", {
          component: "orphanFileCleanupService",
          bucket: upload.bucket,
          filePath: upload.filePath,
        });
      } catch (error) {
        errors.push(
          `Error cleaning up ${upload.bucket}/${upload.filePath}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    const duration = Date.now() - startTime;
    logger.info("Expired upload cleanup completed", {
      component: "orphanFileCleanupService",
      durationMs: duration,
      filesDeleted,
      errorCount: errors.length,
    });

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
  logger.info("Cleaning up old tracking records", {
    component: "orphanFileCleanupService",
    daysToKeep,
  });

  const result = await cleanupOldUploadRecords(daysToKeep);

  if (result.error) {
    logger.error("Failed to cleanup old records", {
      component: "orphanFileCleanupService",
      error: result.error,
    });
  } else {
    logger.info("Cleaned up old tracking records", {
      component: "orphanFileCleanupService",
      deletedCount: result.deletedCount,
    });
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

  logger.info("Starting comprehensive cleanup", {
    component: "orphanFileCleanupService",
  });

  // Clean up expired uploads
  const expiredUploads = await cleanupExpiredUploads();

  // Clean up old tracking records
  const oldRecords = await cleanupOldTrackingRecords(oldRecordsDaysToKeep);

  const totalDuration = Date.now() - startTime;

  logger.info("Comprehensive cleanup completed", {
    component: "orphanFileCleanupService",
    durationMs: totalDuration,
    expiredUploadsDeleted: expiredUploads.filesDeleted,
    oldRecordsDeleted: oldRecords.deletedCount,
    totalErrors: expiredUploads.errors.length + (oldRecords.error ? 1 : 0),
  });

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
