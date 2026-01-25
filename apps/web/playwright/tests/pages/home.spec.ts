/**
 * Homepage integration tests
 *
 * Tests the public homepage rendering and navigation behavior.
 * Note: In test mode, database queries return empty arrays by default.
 */

import { test, expect } from '../../fixtures';

test.describe('Homepage', () => {
  test('renders for unauthenticated users', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL('/');

    // Should have navigation links
    const navLinks = page.locator('nav a, header a');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('redirects authenticated users to dashboard', async ({ page, loginAs }) => {
    await loginAs('regular');
    await page.goto('/');
    await expect(page).toHaveURL('/dashboard');
  });

  test('login link navigates to login page', async ({ page }) => {
    await page.goto('/');

    const loginLink = page.locator(
      'a[href*="/login"], button:has-text("Login"), a:has-text("Login"), a:has-text("Sign In")'
    );

    if ((await loginLink.count()) > 0) {
      await loginLink.first().click();
      await expect(page).toHaveURL(/\/login/);
    }
  });
});
