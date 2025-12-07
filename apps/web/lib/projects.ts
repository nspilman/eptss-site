/**
 * Client-side project utilities
 * All database queries are in @eptss/data-access/services/projectService
 */

export type { ProjectSlug, ProjectInfo } from '@eptss/data-access';
export {
  PROJECT_SLUG_TO_ID,
  PROJECT_ID_TO_SLUG,
  isValidProjectSlug,
  getProjectIdFromSlug,
  getProjectSlugFromId,
} from '@eptss/data-access';

/**
 * Generate project-scoped routes
 */
export function getProjectRoute(slug: string, path: string = ''): string {
  const basePath = `/project/${slug}`;
  return path ? `${basePath}/${path}` : basePath;
}

/**
 * Project display names
 */
export const PROJECT_DISPLAY_NAMES = {
  cover: 'Cover Project',
  original: 'Original Songs',
} as const;

/**
 * Get display name for a project slug
 */
export function getProjectDisplayName(slug: string): string {
  if (slug === 'cover' || slug === 'original') {
    return PROJECT_DISPLAY_NAMES[slug];
  }
  return slug;
}
