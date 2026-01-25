/**
 * Client-side project utilities
 * All database queries are in @eptss/core/services/projectService
 */

export type { ProjectSlug, ProjectInfo } from '@eptss/core';
export {
  PROJECT_SLUG_TO_ID,
  PROJECT_ID_TO_SLUG,
  isValidProjectSlug,
  getProjectIdFromSlug,
  getProjectSlugFromId,
} from '@eptss/core';

/**
 * Generate project-scoped routes
 * Use getProjectRoute from @eptss/shared for dynamic route building
 */
export function getProjectRoute(slug: string, path: string = ''): string {
  const basePath = `/projects/${slug}`;
  return path ? `${basePath}/${path}` : basePath;
}

/**
 * Get display name for a project
 * Projects now store their display name in the database
 * Use project.name from ProjectInfo instead of this utility
 *
 * @deprecated Use project.name from ProjectInfo directly
 */
export function getProjectDisplayName(projectName: string): string {
  return projectName;
}
