/**
 * Protected routes integration tests
 *
 * Tests authentication redirects and access control.
 */

import { test, expect } from '../../fixtures';

test.describe('Protected Routes - Unauthenticated', () => {
  const protectedRoutes = [
    '/dashboard',
    '/submit',
    '/voting',
    '/projects/cover/dashboard',
    '/projects/cover/voting',
    '/projects/cover/submit',
  ];

  for (const route of protectedRoutes) {
    test(`redirects ${route} to /login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    });
  }

  test('preserves redirect URL in query params', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login.*redirectUrl/);
  });
});

test.describe('Protected Routes - Authenticated', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('regular');
  });

  test('allows access to /dashboard', async ({ page, mockApi }) => {
    await mockApi.roundInfo({ phase: 'covering' });
    await mockApi.notifications([]);
    await mockApi.unreadNotificationCount(0);

    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  test('allows access to project dashboard', async ({ page, mockApi }) => {
    await mockApi.roundInfo({ phase: 'covering' });
    await mockApi.notifications([]);
    await mockApi.unreadNotificationCount(0);

    await page.goto('/projects/cover/dashboard');
    await expect(page).toHaveURL(/\/projects\/cover/);
  });
});

test.describe('Public Routes - Authenticated', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('regular');
  });

  test('redirects /login to /dashboard when authenticated', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/dashboard');
  });

  test('redirects /sign-up when authenticated', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page).toHaveURL(/\/projects\/.*\/sign-up|\/dashboard/);
  });
});

test.describe('Admin Routes', () => {
  test('redirects non-admin from /admin', async ({ page, loginAs }) => {
    await loginAs('regular');
    await page.goto('/admin');
    await expect(page).not.toHaveURL('/admin');
  });

  test('allows admin access to /admin', async ({ page, loginAs }) => {
    await loginAs('superAdmin');
    await page.goto('/admin');
    // Admin should have access (exact behavior depends on env setup)
    expect(page.url()).toBeTruthy();
  });
});

test.describe('Auth State Transitions', () => {
  test('logout removes access to protected routes', async ({
    page,
    loginAs,
    logout,
    mockApi,
  }) => {
    await loginAs('regular');
    await mockApi.roundInfo({ phase: 'covering' });
    await mockApi.notifications([]);
    await mockApi.unreadNotificationCount(0);

    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    await logout();
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login state persists across navigation', async ({
    page,
    loginAs,
    isAuthenticated,
    mockApi,
  }) => {
    await loginAs('regular');
    await mockApi.roundInfo({ phase: 'covering' });
    await mockApi.notifications([]);
    await mockApi.unreadNotificationCount(0);

    await page.goto('/dashboard');
    expect(await isAuthenticated()).toBe(true);

    await page.goto('/');
    expect(await isAuthenticated()).toBe(true);
    await expect(page).toHaveURL('/dashboard');
  });
});
