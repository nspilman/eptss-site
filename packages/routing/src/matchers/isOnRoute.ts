/**
 * Route matching utilities
 * Supports exact matching, tree matching, and pattern matching
 */

import { matchesPattern } from './patterns';

/**
 * Options for route matching
 */
export interface RouteMatchOptions {
  /**
   * Exact match - pathname must exactly equal the route
   * @default false
   */
  exact?: boolean;

  /**
   * Tree match - pathname must start with the route (useful for nested routes)
   * @default false
   */
  tree?: boolean;

  /**
   * Pattern match - pathname must match the route pattern with dynamic segments
   * @default false
   */
  pattern?: boolean;

  /**
   * Case sensitive matching
   * @default true
   */
  caseSensitive?: boolean;
}

/**
 * Check if a pathname matches a route based on the specified options
 *
 * @example
 * // Exact match
 * isOnRoute('/dashboard', '/dashboard', { exact: true }) -> true
 * isOnRoute('/dashboard/profile', '/dashboard', { exact: true }) -> false
 *
 * @example
 * // Tree match
 * isOnRoute('/dashboard/profile', '/dashboard', { tree: true }) -> true
 * isOnRoute('/projects/cover/reflections', '/projects', { tree: true }) -> true
 *
 * @example
 * // Pattern match
 * isOnRoute('/projects/cover/reflections', '/projects/[slug]/reflections', { pattern: true }) -> true
 * isOnRoute('/projects/cover/dashboard', '/projects/[slug]/reflections', { pattern: true }) -> false
 *
 * @example
 * // Default behavior (exact match)
 * isOnRoute('/dashboard', '/dashboard') -> true
 */
export function isOnRoute(
  pathname: string,
  route: string,
  options: RouteMatchOptions = {}
): boolean {
  const {
    exact = !options.tree && !options.pattern, // Default to exact if no other option specified
    tree = false,
    pattern = false,
    caseSensitive = true,
  } = options;

  // Normalize paths for comparison
  const normalizePath = (path: string) => {
    // Remove trailing slash except for root
    const normalized = path === '/' ? path : path.replace(/\/$/, '');
    return caseSensitive ? normalized : normalized.toLowerCase();
  };

  const normalizedPathname = normalizePath(pathname);
  const normalizedRoute = normalizePath(route);

  // Pattern match (highest priority)
  if (pattern) {
    const patternToCheck = caseSensitive ? route : route.toLowerCase();
    const pathnameToCheck = caseSensitive ? pathname : pathname.toLowerCase();
    return matchesPattern(pathnameToCheck, patternToCheck);
  }

  // Tree match (check if pathname starts with route)
  if (tree) {
    // Special case for root
    if (normalizedRoute === '/') {
      return normalizedPathname === '/' || normalizedPathname.startsWith('/');
    }
    return (
      normalizedPathname === normalizedRoute ||
      normalizedPathname.startsWith(normalizedRoute + '/')
    );
  }

  // Exact match (default)
  if (exact) {
    return normalizedPathname === normalizedRoute;
  }

  // If no options specified, default to exact match
  return normalizedPathname === normalizedRoute;
}

/**
 * Check if pathname matches any of the provided routes
 *
 * @example
 * isOnAnyRoute('/dashboard', ['/dashboard', '/profile']) -> true
 * isOnAnyRoute('/settings', ['/dashboard', '/profile']) -> false
 */
export function isOnAnyRoute(
  pathname: string,
  routes: string[],
  options?: RouteMatchOptions
): boolean {
  return routes.some(route => isOnRoute(pathname, route, options));
}
