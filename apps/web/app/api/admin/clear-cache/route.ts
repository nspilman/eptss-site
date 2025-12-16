import { clearProjectConfigCache } from "@eptss/project-config";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Clear all project config caches
    await clearProjectConfigCache();

    return NextResponse.json({
      success: true,
      message: "Project config cache cleared successfully"
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}
