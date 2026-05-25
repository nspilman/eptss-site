"use server";

import { db } from "../db";
import { projects, signUps, submissions, songSelectionVotes } from "../db/schema";
import { and, eq, sql, inArray, isNull } from "drizzle-orm";
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
  archivedAt: Date | null;
}

export interface ListProjectsOptions {
  includeArchived?: boolean;
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
    archivedAt: project.archivedAt,
  };
}

/**
 * Fetch all projects. Archived projects are excluded by default — pass
 * `includeArchived: true` from admin surfaces that need to see them.
 */
export async function getAllProjects(options: ListProjectsOptions = {}): Promise<ProjectInfo[]> {
  const query = db.select().from(projects);
  const rows = options.includeArchived
    ? await query.orderBy(projects.name)
    : await query.where(isNull(projects.archivedAt)).orderBy(projects.name);

  return rows.map(project => ({
    id: project.id,
    name: project.name,
    slug: project.slug,
    config: project.config,
    isActive: project.isActive,
    archivedAt: project.archivedAt,
  }));
}

/**
 * Get user's projects (projects they've participated in). Archived projects
 * are excluded by default.
 */
export async function getUserProjects(
  userId: string,
  options: ListProjectsOptions = {},
): Promise<ProjectInfo[]> {
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

  const whereClause = options.includeArchived
    ? inArray(projects.id, projectIds)
    : and(inArray(projects.id, projectIds), isNull(projects.archivedAt));

  const projectResults = await db
    .select()
    .from(projects)
    .where(whereClause)
    .orderBy(projects.name);

  return projectResults.map(project => ({
    id: project.id,
    name: project.name,
    slug: project.slug,
    config: project.config,
    isActive: project.isActive,
    archivedAt: project.archivedAt,
  }));
}
