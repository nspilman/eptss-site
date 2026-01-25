/**
 * Server-Side Test Auth for Playwright Integration Tests
 *
 * This module provides test authentication bypass for Server Components.
 * Unlike testAuthBypass.ts (which uses NextRequest for middleware),
 * this uses next/headers to read cookies in server components.
 *
 * ONLY active when PLAYWRIGHT_TEST_MODE environment variable is 'true'.
 *
 * Security Note: This bypass should NEVER be enabled in production.
 */

import {
  TEST_AUTH_COOKIE_NAME,
  parseTestAuthCookie,
  type TestAuthUser,
} from './testAuthBypass';

// Re-export for convenience
export { TEST_AUTH_COOKIE_NAME, type TestAuthUser };

/**
 * Check if running in Playwright test mode
 */
export function isTestMode(): boolean {
  return process.env.PLAYWRIGHT_TEST_MODE === 'true';
}

/**
 * Get test user from cookies in Server Components
 *
 * Uses next/headers to read the test auth cookie.
 * Returns null if not in test mode or no valid cookie.
 */
export async function getTestUserFromCookies(): Promise<TestAuthUser | null> {
  if (!isTestMode()) {
    return null;
  }

  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const testAuthCookie = cookieStore.get(TEST_AUTH_COOKIE_NAME)?.value;
    return parseTestAuthCookie(testAuthCookie);
  } catch {
    // Cookie reading failed (e.g., not in a server context)
    return null;
  }
}
