/**
 * Auth fixture for Playwright integration tests
 *
 * Provides a `loginAs` function that injects Supabase auth cookies
 * to simulate authenticated users without hitting the real auth service.
 */

import { test as base, BrowserContext, Page } from '@playwright/test';
import { MockUser, mockUsers, MockUserKey } from '../mocks/auth/users';
import { getSupabaseCookies } from '../mocks/auth/session';

/**
 * Extended test fixtures with auth capabilities
 */
export interface AuthFixtures {
  /**
   * Login as a specific mock user by injecting auth cookies
   * Can accept a MockUser object or a key from mockUsers
   */
  loginAs: (userOrKey: MockUser | MockUserKey) => Promise<void>;

  /**
   * Clear all auth cookies to simulate logged out state
   */
  logout: () => Promise<void>;

  /**
   * Check if currently authenticated (has auth cookies)
   */
  isAuthenticated: () => Promise<boolean>;
}

/**
 * Create the auth fixture
 */
export const authFixture = base.extend<AuthFixtures>({
  /**
   * loginAs - Inject auth cookies for a mock user
   */
  loginAs: async ({ context }: { context: BrowserContext }, use) => {
    const loginAs = async (userOrKey: MockUser | MockUserKey) => {
      // Resolve user from key or use directly
      const user: MockUser =
        typeof userOrKey === 'string' ? mockUsers[userOrKey] : userOrKey;

      if (!user) {
        throw new Error(
          `Invalid user or user key: ${userOrKey}. Available keys: ${Object.keys(mockUsers).join(', ')}`
        );
      }

      // Get the cookies for this user
      const cookies = getSupabaseCookies(user);

      // Add cookies to the browser context
      await context.addCookies(cookies);
    };

    await use(loginAs);
  },

  /**
   * logout - Clear auth cookies
   */
  logout: async ({ context }: { context: BrowserContext }, use) => {
    const logout = async () => {
      // Get all cookies and filter out auth-related ones
      const cookies = await context.cookies();

      // Find and clear Supabase auth cookies
      const authCookiePattern = /^sb-.*-auth-token/;
      const authCookies = cookies.filter((c) => authCookiePattern.test(c.name));

      // Clear each auth cookie by setting it to expired
      for (const cookie of authCookies) {
        await context.addCookies([
          {
            name: cookie.name,
            value: '',
            domain: cookie.domain,
            path: cookie.path,
            expires: 0,
          },
        ]);
      }

      // Also clear the entire context cookies as fallback
      await context.clearCookies();
    };

    await use(logout);
  },

  /**
   * isAuthenticated - Check if auth cookies exist
   */
  isAuthenticated: async ({ context }: { context: BrowserContext }, use) => {
    const isAuthenticated = async (): Promise<boolean> => {
      const cookies = await context.cookies();
      const authCookiePattern = /^sb-.*-auth-token/;
      return cookies.some((c) => authCookiePattern.test(c.name));
    };

    await use(isAuthenticated);
  },
});

export { authFixture as test };
