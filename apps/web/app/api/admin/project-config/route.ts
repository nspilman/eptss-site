import { NextRequest, NextResponse } from "next/server";
import { db, projects, eq } from "@eptss/db";
import { revalidatePath } from "next/cache";
import { projectConfigSchema, type ProjectConfig, safeParseProjectConfig } from "@eptss/project-config";
import { getProjectIdFromSlug, isValidProjectSlug } from "@eptss/core";

/**
 * GET /api/admin/project-config?slug=PROJECT_SLUG
 * Retrieves the current project configuration
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Project slug is required" },
        { status: 400 }
      );
    }

    if (!isValidProjectSlug(slug)) {
      return NextResponse.json(
        { error: `Invalid project slug: ${slug}` },
        { status: 400 }
      );
    }

    const projectId = getProjectIdFromSlug(slug);

    // Fetch project config
    const result = await db
      .select({ config: projects.config, name: projects.name })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!result.length) {
      return NextResponse.json(
        { error: `Project not found: ${slug}` },
        { status: 404 }
      );
    }

    const parsedConfig = safeParseProjectConfig(result[0].config);

    return NextResponse.json({
      success: true,
      projectName: result[0].name,
      config: parsedConfig,
    });
  } catch (error) {
    console.error("Failed to get project config:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get project config",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/project-config?slug=PROJECT_SLUG
 * Updates specific fields in the project configuration (deep merge)
 *
 * Body should contain partial config updates, e.g.:
 * {
 *   "content.pages.home.howItWorks.testimonial.quote": "New quote",
 *   "content.pages.home.howItWorks.testimonial.author": "New Author",
 *   "content.pages.home.roundInfo.voting.title": "New Title"
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Project slug is required" },
        { status: 400 }
      );
    }

    if (!isValidProjectSlug(slug)) {
      return NextResponse.json(
        { error: `Invalid project slug: ${slug}` },
        { status: 400 }
      );
    }

    const projectId = getProjectIdFromSlug(slug);

    // Parse request body
    const updates = await request.json();

    if (typeof updates !== "object" || updates === null) {
      return NextResponse.json(
        { error: "Request body must be an object" },
        { status: 400 }
      );
    }

    // Fetch current config
    const result = await db
      .select({ config: projects.config })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!result.length) {
      return NextResponse.json(
        { error: `Project not found: ${slug}` },
        { status: 404 }
      );
    }

    const currentConfig = safeParseProjectConfig(result[0].config);

    // Deep merge function
    const deepMerge = (target: any, source: any): any => {
      const output = { ...target };
      for (const key in source) {
        if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
          output[key] = deepMerge(target[key] || {}, source[key]);
        } else {
          output[key] = source[key];
        }
      }
      return output;
    };

    // Apply updates
    const updatedConfig = deepMerge(currentConfig, updates);

    // Validate the merged config
    const validatedConfig = projectConfigSchema.parse(updatedConfig);

    // Update in database
    await db
      .update(projects)
      .set({
        config: validatedConfig as any,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    // Revalidate pages
    revalidatePath("/admin/projects");
    revalidatePath(`/projects/${slug}`);
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Project config updated successfully",
      config: validatedConfig,
    });
  } catch (error) {
    console.error("Failed to update project config:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update project config",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/project-config?slug=PROJECT_SLUG
 * Replaces the entire project configuration
 *
 * Body should contain the complete config object
 */
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Project slug is required" },
        { status: 400 }
      );
    }

    if (!isValidProjectSlug(slug)) {
      return NextResponse.json(
        { error: `Invalid project slug: ${slug}` },
        { status: 400 }
      );
    }

    const projectId = getProjectIdFromSlug(slug);

    // Parse request body
    const config: ProjectConfig = await request.json();

    // Validate the config
    const validatedConfig = projectConfigSchema.parse(config);

    // Update in database
    await db
      .update(projects)
      .set({
        config: validatedConfig as any,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    // Revalidate pages
    revalidatePath("/admin/projects");
    revalidatePath(`/projects/${slug}`);
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Project config replaced successfully",
      config: validatedConfig,
    });
  } catch (error) {
    console.error("Failed to replace project config:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to replace project config",
      },
      { status: 500 }
    );
  }
}
