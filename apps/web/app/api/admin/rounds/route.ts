import { NextRequest, NextResponse } from "next/server";
import { db, roundMetadata, eq } from "@eptss/db";
import { getProjectIdFromSlug, isValidProjectSlug } from "@eptss/core";

/**
 * GET /api/admin/rounds?projectSlug=PROJECT_SLUG
 * Lists all rounds for a project
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectSlug = searchParams.get("projectSlug");

    if (!projectSlug) {
      return NextResponse.json(
        { error: "Project slug is required" },
        { status: 400 }
      );
    }

    if (!isValidProjectSlug(projectSlug)) {
      return NextResponse.json(
        { error: `Invalid project slug: ${projectSlug}` },
        { status: 400 }
      );
    }

    const projectId = getProjectIdFromSlug(projectSlug);

    const rounds = await db
      .select({
        id: roundMetadata.id,
        slug: roundMetadata.slug,
        signupOpens: roundMetadata.signupOpens,
        votingOpens: roundMetadata.votingOpens,
        coveringBegins: roundMetadata.coveringBegins,
        coversDue: roundMetadata.coversDue,
        listeningParty: roundMetadata.listeningParty,
      })
      .from(roundMetadata)
      .where(eq(roundMetadata.projectId, projectId))
      .orderBy(roundMetadata.signupOpens);

    return NextResponse.json({
      success: true,
      projectSlug,
      projectId,
      count: rounds.length,
      rounds,
    });
  } catch (error) {
    console.error("Failed to get rounds:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get rounds",
      },
      { status: 500 }
    );
  }
}
