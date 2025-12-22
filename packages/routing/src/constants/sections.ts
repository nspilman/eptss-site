/**
 * Application section definitions
 * Used for determining which major section of the app is currently active
 */

export type AppSection =
  | 'home'
  | 'dashboard'
  | 'projects'
  | 'admin'
  | 'auth'
  | 'other';

/**
 * Section path prefixes
 * Used to determine which section a pathname belongs to
 */
export const SECTION_PREFIXES: Record<Exclude<AppSection, 'other'>, string[]> = {
  home: ['/'],
  dashboard: ['/dashboard'],
  projects: ['/projects', '/rounds', '/reporting', '/reflections'], // Includes legacy routes
  admin: ['/admin'],
  auth: ['/login', '/auth'],
};

/**
 * Determine which app section a pathname belongs to
 */
export function getSection(pathname: string): AppSection {
  // Exact match for home
  if (pathname === '/') return 'home';

  // Check prefixes (order matters - more specific first)
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/projects')) return 'projects';
  if (pathname.startsWith('/auth') || pathname.startsWith('/login')) return 'auth';

  // Legacy routes that belong to projects section
  if (pathname.startsWith('/rounds')) return 'projects';
  if (pathname.startsWith('/reporting')) return 'projects';
  if (pathname.startsWith('/reflections')) return 'projects';

  return 'other';
}
