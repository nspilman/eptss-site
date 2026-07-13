"use server";

import { db } from "../db";
import { pendingUploads } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { BucketName } from "@eptss/bucket-storage";
import { logger } from "@eptss/logger/server";

/**
 * Register a file upload as pending
 * This should be called immediately after a successful file upload
 */
export async function registerPendingUpload(params: {
  bucket: BucketName;
  filePath: string;
  fileUrl?: string;
  uploadedBy?: string;
  relatedTable?: string;
  relatedId?: string;
  metadata?: Record<string, any>;
  expiresInHours?: number; // Default: 24 hours
}): Promise<{ id: string | null; error: string | null }> {
  try {
    const expiresInHours = params.expiresInHours || 24;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const [result] = await db
      .insert(pendingUploads)
      .values({
        bucket: params.bucket,
        filePath: params.filePath,
        fileUrl: params.fileUrl,
        uploadedBy: params.uploadedBy,
        status: "pending",
        relatedTable: params.relatedTable,
        relatedId: params.relatedId,
        metadata: params.metadata,
        expiresAt,
      })
      .returning({ id: pendingUploads.id });

    return { id: result.id, error: null };
  } catch (error) {
    logger.error("Register pending upload error", { component: "uploadTrackingService", operation: "registerPendingUpload", error });
    return {
      id: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Mark a pending upload as committed (successfully saved to database)
 * This should be called after the related database record is successfully inserted
 */
export async function commitPendingUpload(
  uploadId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    await db
      .update(pendingUploads)
      .set({
        status: "committed",
        committedAt: new Date(),
      })
      .where(eq(pendingUploads.id, uploadId));

    return { success: true, error: null };
  } catch (error) {
    logger.error("Commit pending upload error", { component: "uploadTrackingService", operation: "commitPendingUpload", error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Mark a pending upload as failed
 * This should be called if the database insert fails
 */
export async function failPendingUpload(
  uploadId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    await db
      .update(pendingUploads)
      .set({
        status: "failed",
      })
      .where(eq(pendingUploads.id, uploadId));

    return { success: true, error: null };
  } catch (error) {
    logger.error("Fail pending upload error", { component: "uploadTrackingService", operation: "failPendingUpload", error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Mark multiple pending uploads as committed
 * Useful when a transaction involves multiple file uploads
 */
export async function commitMultiplePendingUploads(
  uploadIds: string[]
): Promise<{ success: boolean; error: string | null }> {
  try {
    await db
      .update(pendingUploads)
      .set({
        status: "committed",
        committedAt: new Date(),
      })
      .where(sql`${pendingUploads.id} = ANY(${uploadIds})`);

    return { success: true, error: null };
  } catch (error) {
    logger.error("Commit multiple pending uploads error", { component: "uploadTrackingService", operation: "commitMultiplePendingUploads", error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get pending uploads that have expired and should be cleaned up
 */
export async function getExpiredPendingUploads(): Promise<{
  uploads: Array<{
    id: string;
    bucket: string;
    filePath: string;
    fileUrl: string | null;
    status: "pending" | "committed" | "failed";
    createdAt: Date;
    expiresAt: Date;
  }>;
  error: string | null;
}> {
  try {
    const uploads = await db
      .select({
        id: pendingUploads.id,
        bucket: pendingUploads.bucket,
        filePath: pendingUploads.filePath,
        fileUrl: pendingUploads.fileUrl,
        status: pendingUploads.status,
        createdAt: pendingUploads.createdAt,
        expiresAt: pendingUploads.expiresAt,
      })
      .from(pendingUploads)
      .where(
        and(
          eq(pendingUploads.status, "pending"),
          sql`${pendingUploads.expiresAt} < NOW()`
        )
      );

    return { uploads, error: null };
  } catch (error) {
    logger.error("Get expired pending uploads error", { component: "uploadTrackingService", operation: "getExpiredPendingUploads", error });
    return {
      uploads: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a pending upload record
 * Should be called after the file has been cleaned up
 */
export async function deletePendingUploadRecord(
  uploadId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    await db.delete(pendingUploads).where(eq(pendingUploads.id, uploadId));

    return { success: true, error: null };
  } catch (error) {
    logger.error("Delete pending upload record error", { component: "uploadTrackingService", operation: "deletePendingUploadRecord", error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Clean up old committed/failed records (housekeeping)
 * Keeps records for a certain period for auditing, then removes them
 *
 * **Limitation**: This function always returns `deletedCount: 0` because Drizzle ORM
 * does not return rowCount for delete operations in the current implementation.
 *
 * To get the actual count of deleted rows, you would need to:
 * - Use `.returning()` to get deleted records (e.g., `.returning({ id: pendingUploads.id })`)
 * - Or perform a COUNT query before deletion
 *
 * @param daysToKeep - Number of days to keep records before deletion (default: 30)
 * @returns Object with deletedCount (always 0) and error (if any)
 */
export async function cleanupOldUploadRecords(
  daysToKeep: number = 30
): Promise<{ deletedCount: number; error: string | null }> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await db
      .delete(pendingUploads)
      .where(
        and(
          sql`${pendingUploads.status} IN ('committed', 'failed')`,
          sql`${pendingUploads.createdAt} < ${cutoffDate}`
        )
      );

    // LIMITATION: Drizzle doesn't return rowCount for delete operations
    // Always returns 0 - use .returning() if you need the actual count
    return { deletedCount: 0, error: null };
  } catch (error) {
    logger.error("Cleanup old upload records error", { component: "uploadTrackingService", operation: "cleanupOldUploadRecords", error });
    return {
      deletedCount: 0,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
