/**
 * Test Auth Bypass for Playwright Integration Tests
 *
 * This module provides a mechanism for Playwright tests to bypass Supabase
 * authentication by using a special cookie. This is ONLY active when the
 * PLAYWRIGHT_TEST_MODE environment variable is set to 'true'.
 *
 * Security Note: This bypass should NEVER be enabled in production.
 * The env var check ensures it only works in test environments.
 */

import { type NextRequest } from 'next/server';

/**
 * Test user data structure for auth bypass
 */
export interface TestAuthUser {
  id: string;
  email: string;
  username?: string;
  adminLevel?: number;
}

/**
 * Cookie name used for test authentication
 */
export const TEST_AUTH_COOKIE_NAME = '__playwright_test_auth';

/**
 * Parse test auth cookie for integration testing
 * Cookie format: JSON with { id, email, username?, adminLevel? }
 *
 * @returns Parsed user data or null if invalid/missing
 */
export function parseTestAuthCookie(cookieValue: string | undefined): TestAuthUser | null {
  if (!cookieValue) return null;
  try {
    const parsed = JSON.parse(cookieValue);
    if (parsed.id && parsed.email) {
      return {
        id: parsed.id,
        email: parsed.email,
        username: parsed.username,
        adminLevel: parsed.adminLevel,
      };
    }
  } catch {
    // Invalid JSON - return null
  }
  return null;
}

/**
 * Check if test mode is enabled and extract test user from cookie
 *
 * This function checks for:
 * 1. PLAYWRIGHT_TEST_MODE environment variable set to 'true'
 * 2. Valid __playwright_test_auth cookie with user data
 *
 * @param request - The Next.js request object
 * @returns Test user data if in test mode with valid cookie, null otherwise
 */
export function getTestAuthUser(request: NextRequest): TestAuthUser | null {
  // Only allow test bypass when explicitly enabled
  if (process.env.PLAYWRIGHT_TEST_MODE !== 'true') {
    return null;
  }

  const testAuthCookie = request.cookies.get(TEST_AUTH_COOKIE_NAME)?.value;
  return parseTestAuthCookie(testAuthCookie);
}

/**
 * Check if a test user has admin privileges
 */
export function isTestUserAdmin(testUser: TestAuthUser): boolean {
  return testUser.adminLevel !== undefined && testUser.adminLevel > 0;
}
