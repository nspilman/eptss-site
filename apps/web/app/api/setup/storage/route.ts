import { NextResponse } from "next/server";
import { setupStorageBuckets } from "@eptss/bucket-storage/src/setupBuckets";

/**
 * API route to set up Supabase storage buckets
 * Run this once: GET /api/setup/storage
 */
export async function GET() {
  try {
    const result = await setupStorageBuckets();

    if (result.success) {
      return NextResponse.json({
        message: "Storage buckets set up successfully",
        result,
      });
    }

    return NextResponse.json(
      {
        message: "Failed to set up storage buckets",
        error: result.error,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Setup storage error:", error);
    return NextResponse.json(
      {
        message: "Failed to set up storage buckets",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
