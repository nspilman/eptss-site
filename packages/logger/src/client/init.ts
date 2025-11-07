/**
 * PostHog Client Initialization
 *
 * This file initializes PostHog for client-side tracking.
 * It should be imported in your Next.js instrumentation file or root layout.
 */

import posthog from 'posthog-js';

/**
 * Initialize PostHog for client-side tracking
 *
 * Call this once at app startup (e.g., in instrumentation-client.ts or root layout)
 */
export function initPostHog() {
  // Only run in browser
  if (typeof window === 'undefined') {
    return;
  }

  // Check if already initialized
  if (posthog.__loaded) {
    return;
  }

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  console.log({key, host})
  if (!key) {
    console.warn('PostHog: NEXT_PUBLIC_POSTHOG_KEY not set - client tracking disabled');
    return;
  }

  try {
    posthog.init(key, {
      api_host: host || 'https://us.posthog.com',
      person_profiles: 'identified_only', // Only create profiles for identified users
      capture_pageview: true, // Auto-capture pageviews
      capture_pageleave: true, // Track when users leave pages
      autocapture: true, // Auto-capture clicks and interactions
    });

//     posthog.init('phc_XHMaIiC8s1hcz8QGVB00BfzrHWgmat2se2JowGMFPbj', {
//   api_host: 'https://us.i.posthog.com',
//   defaults: '2025-05-24'
// })
  } catch (error) {
    console.error('PostHog initialization failed:', error);
  }
}

/**
 * Get the PostHog client instance
 *
 * Use this to manually track events or identify users
 */
export function getPostHog() {
  return posthog;
}
