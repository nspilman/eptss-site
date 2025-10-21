'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

let isInitialized = false;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize once
    if (isInitialized || !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      return;
    }

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: '/ingest',
      ui_host: 'https://us.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // We'll capture pageviews manually
      capture_pageleave: true,
      debug: process.env.NODE_ENV === 'development',
    });

    isInitialized = true;
  }, []);

  return <>{children}</>;
}
