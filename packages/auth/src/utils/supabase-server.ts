/**
 * Centralized Supabase Server Utilities
 *
 * This module provides server-side Supabase client creation and auth utilities.
 * Used across the monorepo to avoid duplication.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { getTestUserFromCookies } from '../middleware/testAuthServer';

// Type for the database - can be overridden by consumers
type Database = any;

/**
 * Creates a Supabase server client with cookie handling
 * 
 * This client is configured to work with Next.js Server Components
 * and properly handles cookie-based authentication.
 */
export async function createClient<DB = Database>() {
  // Dynamic import to avoid module-level evaluation issues
  const { cookies } = await import('next/headers');
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
 * In test mode, returns test user data from the test auth cookie.
 * Returns userId and email, or empty strings if not authenticated.
 */
export async function getAuthUser() {
  // Check for test mode first
  const testUser = await getTestUserFromCookies();
  if (testUser) {
    return {
      userId: testUser.id,
      email: testUser.email,
    };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return {
    userId: user?.id || '',
    email: user?.email || ''
  };
}

/**
 * Gets the current authenticated user's username from the database
 *
 * In test mode, returns the username from the test auth cookie.
 * Returns username or null if not authenticated or not found.
 */
export async function getCurrentUsername(): Promise<string | null> {
  // Check for test mode first
  const testUser = await getTestUserFromCookies();
  if (testUser) {
    return testUser.username || null;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: userData } = await supabase
    .from('users')
    .select('username')
    .eq('userid', user.id)
    .single();

  return userData?.username || null;
}

/**
 * User profile data for header display
 */
export interface HeaderUserProfile {
  userId: string;
  email: string;
  username: string | null;
  profilePictureUrl: string | null;
}

/**
 * Gets authenticated user profile data for header display
 *
 * In test mode, returns mock profile data from the test auth cookie.
 * Returns user profile with username and avatar, or null if not authenticated.
 */
export async function getUserProfileForHeader(): Promise<HeaderUserProfile | null> {
  // Check for test mode first
  const testUser = await getTestUserFromCookies();
  if (testUser) {
    return {
      userId: testUser.id,
      email: testUser.email,
      username: testUser.username || null,
      profilePictureUrl: null,
    };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: userData } = await supabase
    .from('users')
    .select('username, profile_picture_url')
    .eq('userid', user.id)
    .single();

  return {
    userId: user.id,
    email: user.email || '',
    username: userData?.username || null,
    profilePictureUrl: userData?.profile_picture_url || null,
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

// Re-export ensureUserExists for convenience
export { ensureUserExists } from './ensureUserExists';
