import { NextRequest, NextResponse } from "next/server";
import { getContentSlugById } from "@eptss/data-access";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contentId = searchParams.get("contentId");

    if (!contentId) {
      return NextResponse.json(
        { error: "Content ID is required" },
        { status: 400 }
      );
    }

    const result = await getContentSlugById(contentId);

    if (result.status !== "success" || !result.data) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      slug: result.data.slug,
      projectId: result.data.projectId
    });
  } catch (error) {
    console.error("Error fetching content slug:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
