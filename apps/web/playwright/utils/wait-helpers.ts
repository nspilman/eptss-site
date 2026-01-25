/**
 * Custom wait utilities for Playwright tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Wait for the page to be fully loaded (no network activity)
 */
export async function waitForPageLoad(page: Page, timeout = 10000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Wait for Next.js hydration to complete
 * Checks for absence of data-loading attributes or presence of loaded state
 */
export async function waitForHydration(page: Page, timeout = 10000): Promise<void> {
  // Wait for the main content to be visible
  await page.waitForLoadState('domcontentloaded', { timeout });

  // Give React time to hydrate
  await page.waitForTimeout(100);

  // Wait for any loading skeletons to disappear
  const skeletons = page.locator('[data-testid="loading-skeleton"], .skeleton');
  const skeletonCount = await skeletons.count();
  if (skeletonCount > 0) {
    await expect(skeletons.first()).not.toBeVisible({ timeout });
  }
}

/**
 * Wait for a specific API response
 * Returns the Playwright Response object (not the native Response)
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 10000
): Promise<import('@playwright/test').Response> {
  const response = await page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
  return response;
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 10000
): Promise<void> {
  await page.waitForURL(urlPattern, { timeout });
}

/**
 * Wait for an element to be stable (not animating/transitioning)
 */
export async function waitForElementStable(
  page: Page,
  selector: string,
  timeout = 5000
): Promise<void> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout });

  // Wait for any CSS transitions to complete
  await page.waitForTimeout(300);
}

/**
 * Retry an action until it succeeds or times out
 */
export async function retryUntil<T>(
  action: () => Promise<T>,
  options: { timeout?: number; interval?: number } = {}
): Promise<T> {
  const { timeout = 10000, interval = 100 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      return await action();
    } catch {
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  // One final try that will throw if it fails
  return action();
}
