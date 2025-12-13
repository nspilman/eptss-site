"use server";

import { db } from "@eptss/data-access/db";
import { projects } from "@eptss/data-access/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { projectConfigSchema, type ProjectConfig } from "@eptss/project-config";

export async function updateProjectConfig(projectId: string, config: ProjectConfig) {
  try {
    // Validate the config
    const validatedConfig = projectConfigSchema.parse(config);

    // Update the project config in the database
    await db
      .update(projects)
      .set({
        config: validatedConfig,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    // Revalidate the admin page and any project pages
    revalidatePath("/admin/projects");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to update project config:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update project config",
    };
  }
}
