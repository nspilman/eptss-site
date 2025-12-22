/**
 * Active section detection utilities
 */

import { getSection, type AppSection } from '../constants/sections';

/**
 * Check if a pathname belongs to a specific app section
 *
 * @example
 * isActiveSection('/dashboard', 'dashboard') -> true
 * isActiveSection('/dashboard/profile', 'dashboard') -> true
 * isActiveSection('/projects/cover/reflections', 'projects') -> true
 * isActiveSection('/admin', 'dashboard') -> false
 */
export function isActiveSection(pathname: string, section: AppSection): boolean {
  return getSection(pathname) === section;
}

/**
 * Get the currently active section from a pathname
 *
 * @example
 * getActiveSection('/dashboard') -> 'dashboard'
 * getActiveSection('/projects/cover/reflections') -> 'projects'
 * getActiveSection('/') -> 'home'
 */
export function getActiveSection(pathname: string): AppSection {
  return getSection(pathname);
}
