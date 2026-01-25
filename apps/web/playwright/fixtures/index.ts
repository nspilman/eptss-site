/**
 * Combined Playwright fixtures for EPTSS integration tests
 *
 * This file combines auth and API fixtures into a single extended test
 * that can be used throughout the test suite.
 *
 * Usage:
 *   import { test, expect } from '../fixtures';
 *
 *   test('my test', async ({ page, loginAs, mockApi }) => {
 *     await loginAs('regular');
 *     await mockApi.roundInfo({ phase: 'covering' });
 *     await page.goto('/dashboard');
 *     // ...
 *   });
 */

import { test as base, expect } from '@playwright/test';
import { Route } from '@playwright/test';
import { MockUser, mockUsers, MockUserKey } from '../mocks/auth/users';
import { MockRound, mockRounds, createMockRound } from '../mocks/api/rounds';
import {
  MockNotification,
  createMockNotificationList,
} from '../mocks/api/notifications';

/**
 * Cookie name for test authentication (must match testAuthBypass.ts)
 */
const TEST_AUTH_COOKIE_NAME = '__playwright_test_auth';

/**
 * Combined fixtures interface
 */
interface Fixtures {
  // Auth fixtures
  loginAs: (userOrKey: MockUser | MockUserKey) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => Promise<boolean>;

  // API fixtures (for client-side requests)
  mockApi: {
    rounds: (data?: MockRound[]) => Promise<void>;
    roundInfo: (data?: Partial<MockRound> | null) => Promise<void>;
    currentRound: (data?: Partial<MockRound> | null) => Promise<void>;
    notifications: (data?: MockNotification[]) => Promise<void>;
    unreadNotificationCount: (count?: number) => Promise<void>;
    custom: (pattern: string, handler: (route: Route) => Promise<void>) => Promise<void>;
    failWith: (pattern: string, status: number, error?: string) => Promise<void>;
    mockStorage: () => Promise<void>;
    clearAll: () => Promise<void>;
  };
}

/**
 * Extended test with all fixtures
 */
export const test = base.extend<Fixtures>({
  // ============================================
  // AUTH FIXTURES
  // ============================================

  loginAs: async ({ context }, use) => {
    const loginAs = async (userOrKey: MockUser | MockUserKey) => {
      const user: MockUser =
        typeof userOrKey === 'string' ? mockUsers[userOrKey] : userOrKey;

      if (!user) {
        throw new Error(
          `Invalid user or user key: ${userOrKey}. Available keys: ${Object.keys(mockUsers).join(', ')}`
        );
      }

      // Set the test auth cookie that the middleware will recognize
      // This bypasses Supabase auth when PLAYWRIGHT_TEST_MODE=true
      await context.addCookies([
        {
          name: TEST_AUTH_COOKIE_NAME,
          value: JSON.stringify({
            id: user.id,
            email: user.email,
            username: user.username,
            adminLevel: user.adminLevel,
          }),
          domain: 'localhost',
          path: '/',
          httpOnly: false,
          secure: false,
          sameSite: 'Lax',
        },
      ]);
    };

    await use(loginAs);
  },

  logout: async ({ context }, use) => {
    const logout = async () => {
      await context.clearCookies();
    };

    await use(logout);
  },

  isAuthenticated: async ({ context }, use) => {
    const isAuthenticated = async (): Promise<boolean> => {
      const cookies = await context.cookies();
      return cookies.some((c) => c.name === TEST_AUTH_COOKIE_NAME);
    };

    await use(isAuthenticated);
  },

  // ============================================
  // API FIXTURES (for client-side requests)
  // ============================================

  mockApi: async ({ page }, use) => {
    const mockedRoutes: string[] = [];

    const mockApi = {
      rounds: async (data?: MockRound[]) => {
        const pattern = '**/api/rounds';
        mockedRoutes.push(pattern);
        await page.route(pattern, async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(data ?? [mockRounds.coveringPhase]),
          });
        });
      },

      roundInfo: async (data?: Partial<MockRound> | null) => {
        const pattern = '**/api/round-info**';
        mockedRoutes.push(pattern);
        await page.route(pattern, async (route) => {
          if (data === null) {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ currentRound: null }),
            });
          } else {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ currentRound: createMockRound(data) }),
            });
          }
        });
      },

      currentRound: async (data?: Partial<MockRound> | null) => {
        const pattern = '**/api/round/current**';
        mockedRoutes.push(pattern);
        await page.route(pattern, async (route) => {
          if (data === null) {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(null),
            });
          } else {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createMockRound(data)),
            });
          }
        });
      },

      notifications: async (data?: MockNotification[]) => {
        const pattern = '**/api/notifications';
        mockedRoutes.push(pattern);
        await page.route(pattern, async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              notifications: data ?? createMockNotificationList(5),
            }),
          });
        });
      },

      unreadNotificationCount: async (count = 3) => {
        const pattern = '**/api/notifications/unread-count';
        mockedRoutes.push(pattern);
        await page.route(pattern, async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ count }),
          });
        });
      },

      custom: async (pattern: string, handler: (route: Route) => Promise<void>) => {
        mockedRoutes.push(pattern);
        await page.route(pattern, handler);
      },

      failWith: async (pattern: string, status: number, error = 'Internal Server Error') => {
        mockedRoutes.push(pattern);
        await page.route(pattern, async (route) => {
          await route.fulfill({
            status,
            contentType: 'application/json',
            body: JSON.stringify({ error }),
          });
        });
      },

      mockStorage: async () => {
        const storagePattern = '**/*.supabase.co/storage/**';
        mockedRoutes.push(storagePattern);
        await page.route(storagePattern, async (route) => {
          const url = route.request().url();
          if (url.includes('.mp3') || url.includes('.wav') || url.includes('.m4a')) {
            await route.fulfill({
              status: 200,
              contentType: 'audio/mpeg',
              body: Buffer.from([]),
            });
          } else if (
            url.includes('.jpg') ||
            url.includes('.jpeg') ||
            url.includes('.png') ||
            url.includes('.webp')
          ) {
            await route.fulfill({
              status: 200,
              contentType: 'image/png',
              body: Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                'base64'
              ),
            });
          } else {
            await route.continue();
          }
        });
      },

      clearAll: async () => {
        for (const pattern of mockedRoutes) {
          await page.unroute(pattern);
        }
        mockedRoutes.length = 0;
      },
    };

    await use(mockApi);
    await mockApi.clearAll();
  },
});

// Re-export expect from Playwright
export { expect };

// Re-export mock data for convenience
export { mockUsers, mockRounds };
export type { MockUser, MockRound, MockNotification };
