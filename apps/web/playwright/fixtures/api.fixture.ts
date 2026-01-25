/**
 * API fixture for Playwright integration tests
 *
 * Provides utilities for mocking API routes and network requests
 */

import { test as base, Page, Route } from '@playwright/test';
import { MockRound, mockRounds, createMockRound } from '../mocks/api/rounds';
import {
  MockNotification,
  createMockNotificationList,
} from '../mocks/api/notifications';

/**
 * Extended test fixtures with API mocking capabilities
 */
export interface ApiFixtures {
  /**
   * Mock API utilities
   */
  mockApi: {
    /**
     * Mock the /api/rounds endpoint
     */
    rounds: (data?: MockRound[]) => Promise<void>;

    /**
     * Mock the /api/round-info endpoint
     */
    roundInfo: (data?: Partial<MockRound> | null) => Promise<void>;

    /**
     * Mock the /api/round/current endpoint
     */
    currentRound: (data?: Partial<MockRound> | null) => Promise<void>;

    /**
     * Mock the /api/notifications endpoint
     */
    notifications: (data?: MockNotification[]) => Promise<void>;

    /**
     * Mock the /api/notifications/unread-count endpoint
     */
    unreadNotificationCount: (count?: number) => Promise<void>;

    /**
     * Mock a custom route with a handler
     */
    custom: (pattern: string, handler: (route: Route) => Promise<void>) => Promise<void>;

    /**
     * Mock a route to fail with a specific status
     */
    failWith: (pattern: string, status: number, error?: string) => Promise<void>;

    /**
     * Mock Supabase storage URLs
     */
    mockStorage: () => Promise<void>;

    /**
     * Clear all route mocks
     */
    clearAll: () => Promise<void>;
  };
}

/**
 * Create the API fixture
 */
export const apiFixture = base.extend<ApiFixtures>({
  mockApi: async ({ page }: { page: Page }, use) => {
    // Track mocked routes for cleanup
    const mockedRoutes: string[] = [];

    const mockApi = {
      /**
       * Mock /api/rounds
       */
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

      /**
       * Mock /api/round-info
       */
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
              body: JSON.stringify({
                currentRound: createMockRound(data),
              }),
            });
          }
        });
      },

      /**
       * Mock /api/round/current
       */
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

      /**
       * Mock /api/notifications
       */
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

      /**
       * Mock /api/notifications/unread-count
       */
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

      /**
       * Mock a custom route
       */
      custom: async (pattern: string, handler: (route: Route) => Promise<void>) => {
        mockedRoutes.push(pattern);
        await page.route(pattern, handler);
      },

      /**
       * Mock a route to fail
       */
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

      /**
       * Mock Supabase storage for audio files and images
       */
      mockStorage: async () => {
        const storagePattern = '**/*.supabase.co/storage/**';
        mockedRoutes.push(storagePattern);

        await page.route(storagePattern, async (route) => {
          const url = route.request().url();

          // Return a small placeholder based on file type
          if (url.includes('.mp3') || url.includes('.wav') || url.includes('.m4a')) {
            // Return empty audio for audio files
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
            // Return a 1x1 transparent PNG for images
            await route.fulfill({
              status: 200,
              contentType: 'image/png',
              body: Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                'base64'
              ),
            });
          } else {
            // Default: continue with request
            await route.continue();
          }
        });
      },

      /**
       * Clear all mocked routes
       */
      clearAll: async () => {
        for (const pattern of mockedRoutes) {
          await page.unroute(pattern);
        }
        mockedRoutes.length = 0;
      },
    };

    await use(mockApi);

    // Cleanup: unroute all mocked routes after test
    await mockApi.clearAll();
  },
});

export { apiFixture as test };
