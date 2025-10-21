'use client';

import { useEffect } from 'react';

let isInitialized = false;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize once
    if (isInitialized || !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      return;
    }

    // Dynamically import posthog-js to avoid bundling Node.js modules
    import('posthog-js').then((posthogModule) => {
      const posthog = posthogModule.default;
      
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: '/ingest',
        ui_host: 'https://us.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: false,
        capture_pageleave: true,
        debug: process.env.NODE_ENV === 'development',
      });

      isInitialized = true;
    }).catch((error) => {
      console.error('Failed to load PostHog:', error);
    });
  }, []);

  return <>{children}</>;
}
