/**
 * @eptss/routing
 *
 * Centralized routing package for the EPTSS application
 * Provides type-safe route building and matching utilities
 *
 * This is the main export (server-safe)
 * For client-side hooks, import from '@eptss/routing/client'
 */

// Route builders (server-safe)
import { routes } from './builders/routes';
import { api } from './builders/api';

// Types
export type { ProjectSlug, RouteOptions } from './builders/types';
export type { AppSection } from './constants/sections';
export type { RouteMatchOptions } from './matchers/isOnRoute';

// Server-safe matching utilities
import { isOnRoute, isOnAnyRoute } from './matchers/isOnRoute';
import { isActiveSection, getActiveSection } from './matchers/isActiveSection';
import { matchesPattern, extractParams } from './matchers/patterns';

// Constants
import {
  PROTECTED_ROUTES,
  ADMIN_ROUTES,
  PUBLIC_ROUTES,
  isProtectedRoute,
  isAdminRoute,
  isPublicRoute,
} from './constants/protected';

import { getSection, SECTION_PREFIXES } from './constants/sections';

// Re-export named values for consumers
export {
  routes,
  api,
  isOnRoute,
  isOnAnyRoute,
  isActiveSection,
  getActiveSection,
  matchesPattern,
  extractParams,
  PROTECTED_ROUTES,
  ADMIN_ROUTES,
  PUBLIC_ROUTES,
  isProtectedRoute,
  isAdminRoute,
  isPublicRoute,
  getSection,
  SECTION_PREFIXES,
};

/**
 * Re-export for convenience
 */
export const routing = {
  routes,
  api,
  isOnRoute,
  isOnAnyRoute,
  isActiveSection,
  getActiveSection,
  matchesPattern,
  extractParams,
  isProtectedRoute,
  isAdminRoute,
  isPublicRoute,
  getSection,
} as const;
