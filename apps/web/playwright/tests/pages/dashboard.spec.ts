/**
 * Dashboard page integration tests
 *
 * Tests the authenticated dashboard page rendering.
 * Note: In test mode, database returns empty arrays, so users see "No Projects" state.
 */

import { test, expect } from '../../fixtures';

test.describe('Dashboard Page', () => {
  test('renders empty state for authenticated user with no projects', async ({
    page,
    loginAs,
  }) => {
    await loginAs('regular');
    await page.goto('/dashboard');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /No Projects/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse Projects/i })).toBeVisible();
  });
});
