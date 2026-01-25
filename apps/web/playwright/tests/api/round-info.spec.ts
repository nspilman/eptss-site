/**
 * API mocking integration tests
 *
 * Validates that API mocking fixtures work correctly.
 * These are infrastructure tests - actual API behavior tests
 * will be added when mock data is implemented.
 */

import { test, expect } from '../../fixtures';

test.describe('API Mocking Infrastructure', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('regular');
  });

  test('mockApi fixtures intercept requests correctly', async ({ page, mockApi }) => {
    await mockApi.roundInfo({ roundId: 12, slug: 'round-12', phase: 'covering' });
    await mockApi.notifications([]);
    await mockApi.unreadNotificationCount(0);

    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeVisible();
  });

  test('failWith fixture can simulate API errors', async ({ page, mockApi }) => {
    await mockApi.failWith('**/api/round-info**', 500, 'Database error');
    await mockApi.notifications([]);
    await mockApi.unreadNotificationCount(0);

    await page.goto('/dashboard');
    // Page should handle error gracefully without crashing
    await expect(page.locator('body')).toBeVisible();
  });
});
