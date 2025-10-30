/**
 * Centralized Supabase Server Utilities
 * 
 * This module provides server-side Supabase client creation and auth utilities.
 * Used across the monorepo to avoid duplication.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { AUTH_HEADER_KEYS } from '@eptss/shared';

// Type for the database - can be overridden by consumers
type Database = any;

/**
 * Creates a Supabase server client with cookie handling
 * 
 * This client is configured to work with Next.js Server Components
 * and properly handles cookie-based authentication.
 */
export async function createClient<DB = Database>() {
  const cookieStore = await cookies();

  return createServerClient<DB>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Gets the authenticated user from Supabase
 * 
 * Returns userId and email, or empty strings if not authenticated
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return {
    userId: user?.id || '',
    email: user?.email || ''
  };
}

/**
 * Gets all request headers
 * 
 * Useful for debugging and passing headers to external services
 */
export async function getHeaders() {
  const rawHeaders = await headers();
  return Object.fromEntries(rawHeaders.entries());
}
