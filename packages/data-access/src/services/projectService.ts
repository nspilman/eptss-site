"use server";

import { db } from "../db";
import { projects, signUps, submissions, songSelectionVotes } from "../db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import {
  isValidProjectSlug,
  getProjectIdFromSlug,
  getProjectSlugFromId,
  type ProjectSlug,
} from "../utils/projectUtils";

// NOTE: Cannot re-export non-async functions from "use server" file
// Import and use them locally, but export from index.ts instead

export interface ProjectInfo {
  id: string;
  name: string;
  slug: string;
  config: any;
  isActive: boolean;
}

/**
 * Fetch project details by slug from database
 */
export async function getProjectBySlug(slug: string): Promise<ProjectInfo | null> {
  if (!isValidProjectSlug(slug)) {
    return null;
  }

  const projectId = getProjectIdFromSlug(slug);

  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!result.length) {
    return null;
  }

  const project = result[0];

  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    config: project.config,
    isActive: project.isActive,
  };
}

/**
 * Fetch all projects
 */
export async function getAllProjects(): Promise<ProjectInfo[]> {
  const result = await db
    .select()
    .from(projects)
    .orderBy(projects.name);

  return result.map(project => ({
    id: project.id,
    name: project.name,
    slug: project.slug,
    config: project.config,
    isActive: project.isActive,
  }));
}

/**
 * Get user's projects (projects they've participated in)
 */
export async function getUserProjects(userId: string): Promise<ProjectInfo[]> {
  // Get distinct project IDs from all participation sources
  const participatedProjectIds = await db.execute(sql`
    SELECT DISTINCT project_id
    FROM (
      SELECT project_id FROM ${signUps} WHERE user_id = ${userId}
      UNION
      SELECT project_id FROM ${submissions} WHERE user_id = ${userId}
      UNION
      SELECT project_id FROM ${songSelectionVotes} WHERE user_id = ${userId}
    ) AS user_projects
  `);

  if (!participatedProjectIds.length) {
    return [];
  }

  const projectIds = participatedProjectIds.map((row: any) => row.project_id);

  // Fetch project details for these IDs
  const projectResults = await db
    .select()
    .from(projects)
    .where(inArray(projects.id, projectIds))
    .orderBy(projects.name);

  return projectResults.map(project => ({
    id: project.id,
    name: project.name,
    slug: project.slug,
    config: project.config,
    isActive: project.isActive,
  }));
}
