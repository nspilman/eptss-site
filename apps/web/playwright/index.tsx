/**
 * Playwright Component Testing Hooks
 *
 * This file provides hooks for setting up the component testing environment.
 * It's used to mock Next.js features and provide necessary context to components.
 */

import { beforeMount, afterMount } from '@playwright/experimental-ct-react/hooks';

// Mock Next.js navigation hooks
const mockRouter = {
  push: async (url: string) => {
    console.log('[Mock Router] push:', url);
  },
  replace: async (url: string) => {
    console.log('[Mock Router] replace:', url);
  },
  refresh: () => {
    console.log('[Mock Router] refresh');
  },
  back: () => {
    console.log('[Mock Router] back');
  },
  forward: () => {
    console.log('[Mock Router] forward');
  },
  prefetch: async (url: string) => {
    console.log('[Mock Router] prefetch:', url);
  },
};

// Type for hook configuration
export interface HooksConfig {
  router?: typeof mockRouter;
  pathname?: string;
  searchParams?: Record<string, string>;
}

beforeMount<HooksConfig>(async ({ App, hooksConfig }) => {
  // Set up any global providers or mocks here
  // The hooksConfig object contains configuration passed from tests

  // Example: You can wrap the App with providers here
  // return <SomeProvider>{App}</SomeProvider>;
});

afterMount<HooksConfig>(async () => {
  // Cleanup after mount if needed
});

export { mockRouter };
