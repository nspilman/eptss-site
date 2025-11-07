/**
 * Client-side instrumentation
 *
 * This file runs on the client before anything else.
 * Used to initialize observability tools like PostHog.
 */

import { initPostHog } from '@eptss/logger/client';

// Initialize PostHog for client-side tracking
initPostHog();
