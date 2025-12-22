'use client';

/**
 * Client-side routing hooks and utilities
 * These can only be used in client components
 */

import { usePathname } from 'next/navigation';
import { isOnRoute, isOnAnyRoute, type RouteMatchOptions } from './matchers/isOnRoute';
import { isActiveSection, getActiveSection } from './matchers/isActiveSection';
import type { AppSection } from './constants/sections';

/**
 * Hook to check if the current pathname matches a route
 *
 * @example
 * const isOnDashboard = useIsOnRoute('/dashboard', { exact: true });
 * const isInProjects = useIsOnRoute('/projects', { tree: true });
 */
export function useIsOnRoute(route: string, options?: RouteMatchOptions): boolean {
  const pathname = usePathname();
  return isOnRoute(pathname, route, options);
}

/**
 * Hook to check if the current pathname matches any of the provided routes
 *
 * @example
 * const isOnAuthPages = useIsOnAnyRoute(['/login', '/auth/callback']);
 */
export function useIsOnAnyRoute(routes: string[], options?: RouteMatchOptions): boolean {
  const pathname = usePathname();
  return isOnAnyRoute(pathname, routes, options);
}

/**
 * Hook to check if the current section is active
 *
 * @example
 * const isDashboardSection = useIsActiveSection('dashboard');
 * const isAdminSection = useIsActiveSection('admin');
 */
export function useIsActiveSection(section: AppSection): boolean {
  const pathname = usePathname();
  return isActiveSection(pathname, section);
}

/**
 * Hook to get the currently active section
 *
 * @example
 * const activeSection = useActiveSection(); // 'dashboard' | 'projects' | 'admin' | etc.
 */
export function useActiveSection(): AppSection {
  const pathname = usePathname();
  return getActiveSection(pathname);
}

/**
 * Hook that returns a route checker bound to the current pathname
 * Useful for checking multiple routes against the current location
 *
 * @example
 * const route = useRoute();
 * const isOnDashboard = route.is('/dashboard');
 * const isInProjects = route.isTree('/projects');
 */
export function useRoute() {
  const pathname = usePathname();

  return {
    /**
     * Current pathname
     */
    pathname,

    /**
     * Check if current pathname exactly matches the route
     */
    is: (route: string, caseSensitive = true) =>
      isOnRoute(pathname, route, { exact: true, caseSensitive }),

    /**
     * Check if current pathname is within the route tree
     */
    isTree: (route: string, caseSensitive = true) =>
      isOnRoute(pathname, route, { tree: true, caseSensitive }),

    /**
     * Check if current pathname matches the route pattern
     */
    matches: (pattern: string, caseSensitive = true) =>
      isOnRoute(pathname, pattern, { pattern: true, caseSensitive }),

    /**
     * Check if current pathname matches any of the routes
     */
    isAny: (routes: string[], options?: RouteMatchOptions) =>
      isOnAnyRoute(pathname, routes, options),

    /**
     * Check if current section is active
     */
    isSection: (section: AppSection) => isActiveSection(pathname, section),

    /**
     * Get current active section
     */
    section: getActiveSection(pathname),
  };
}

// Re-export server-safe utilities that can also be used client-side
export { isOnRoute, isOnAnyRoute } from './matchers/isOnRoute';
export { isActiveSection, getActiveSection } from './matchers/isActiveSection';
export { matchesPattern, extractParams } from './matchers/patterns';
export type { RouteMatchOptions } from './matchers/isOnRoute';
export type { AppSection } from './constants/sections';
