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
 * Check if a pathname requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if a pathname requires admin permissions
 */
export function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if a pathname is public (doesn't require auth)
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
}
