/**
 * Project utility functions (non-async, can be used in client or server)
 */

import { COVER_PROJECT_ID, ORIGINAL_PROJECT_ID } from "../db/schema";

export type ProjectSlug = 'cover' | 'original' | 'monthly-original';

/**
 * Map of project slugs to their fixed UUIDs
 */
export const PROJECT_SLUG_TO_ID: Record<ProjectSlug, string> = {
  cover: COVER_PROJECT_ID,
  original: ORIGINAL_PROJECT_ID,
  'monthly-original': ORIGINAL_PROJECT_ID,
};

/**
 * Map of project IDs to their slugs
 */
export const PROJECT_ID_TO_SLUG: Record<string, ProjectSlug> = {
  [COVER_PROJECT_ID]: 'cover',
  [ORIGINAL_PROJECT_ID]: 'original',
};

/**
 * Validate if a slug is a valid project slug
 */
export function isValidProjectSlug(slug: string): slug is ProjectSlug {
  return slug === 'cover' || slug === 'original' || slug === 'monthly-original';
}

/**
 * Get project ID from slug
 */
export function getProjectIdFromSlug(slug: ProjectSlug): string {
  return PROJECT_SLUG_TO_ID[slug];
}

/**
 * Get project slug from ID
 */
export function getProjectSlugFromId(id: string): ProjectSlug | null {
  return PROJECT_ID_TO_SLUG[id] || null;
}
