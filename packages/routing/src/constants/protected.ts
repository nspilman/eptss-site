/**
 * Protected route definitions
 * These routes require authentication and/or specific permissions
 */

/**
 * Routes that require authentication
 */
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/dashboard/profile',
  '/feedback',
  '/submit',
  '/voting',
  '/admin',
  '/projects/:projectSlug/dashboard',
  '/projects/:projectSlug/submit',
  '/projects/:projectSlug/voting',
  '/projects/:projectSlug/discussions',
  '/projects/:projectSlug/reflections',
] as const;

/**
 * Routes that require admin permissions
 */
export const ADMIN_ROUTES = [
  '/admin',
] as const;

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/auth',
  '/sign-up',
  '/faq',
  '/privacy-policy',
  '/waitlist',
] as const;

/**
 * Helper function to match a pathname against a route pattern
 * Supports both static paths and regex patterns for dynamic routes
 */
function matchesPath(pathname: string, pattern: string): boolean {
  // Support regex patterns for dynamic routes (e.g., /projects/.*/dashboard)
  if (pattern.includes('.*') || pattern.includes(':')) {
    // Convert :param syntax to regex if present
    const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${regexPattern}`);
    return regex.test(pathname);
  }
  return pathname.startsWith(pattern);
}

/**
 * Check if a pathname matches any route in a list
 */
export function matchesAnyPath(pathname: string, paths: readonly string[]): boolean {
  return paths.some(path => matchesPath(pathname, path));
}

/**
 * Check if a pathname requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  return matchesAnyPath(pathname, PROTECTED_ROUTES);
}

/**
 * Check if a pathname requires admin permissions
 */
export function isAdminRoute(pathname: string): boolean {
  return matchesAnyPath(pathname, ADMIN_ROUTES);
}

/**
 * Check if a pathname is public (doesn't require auth)
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || matchesPath(pathname, route + '/'));
}
