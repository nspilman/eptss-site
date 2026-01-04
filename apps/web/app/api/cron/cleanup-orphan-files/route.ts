import { NextRequest, NextResponse } from "next/server";
import { runComprehensiveCleanup } from "@eptss/data-access/services/orphanFileCleanupService";

/**
 * Cron job to clean up orphan files from storage
 *
 * This endpoint should be called periodically (e.g., every hour or daily) by a cron service.
 * It performs two cleanup operations:
 * 1. Removes files that were uploaded but never committed to the database (expired pending uploads)
 * 2. Cleans up old tracking records to keep the database tidy
 *
 * Configure your cron service (Vercel Cron, etc.) to call this endpoint at:
 * - URL: /api/cron/cleanup-orphan-files
 * - Schedule: Recommended every 1-6 hours (e.g., "0 * * * *" for hourly)
 * - Method: POST
 * - Headers: Authorization with your CRON_SECRET
 *
 * Example Vercel cron configuration in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-orphan-files",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[cleanup-orphan-files] Starting cleanup job");

    // Run comprehensive cleanup
    const result = await runComprehensiveCleanup(30); // Keep records for 30 days

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      expiredUploads: {
        filesDeleted: result.expiredUploads.filesDeleted,
        errorCount: result.expiredUploads.errors.length,
        errors: result.expiredUploads.errors.slice(0, 10), // Limit errors in response
      },
      oldRecords: {
        deletedCount: result.oldRecords.deletedCount,
        error: result.oldRecords.error,
      },
      totalDuration: result.totalDuration,
    };

    console.log("[cleanup-orphan-files] Cleanup completed:", response);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[cleanup-orphan-files] Cleanup failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for monitoring/health checks
 * Returns statistics about pending cleanups without performing cleanup
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Add auth check for monitoring endpoint
    const { getCleanupStats } = await import("@eptss/data-access/services/orphanFileCleanupService");

    const stats = await getCleanupStats();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      pendingExpiredCount: stats.pendingExpiredCount,
      error: stats.error,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
