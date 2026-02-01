/**
 * Centralized Supabase Server Utilities
 *
 * This module provides server-side Supabase client creation and auth utilities.
 * Used across the monorepo to avoid duplication.
 */

import { createServerClient } from '@supabase/ssr';
import { headers } from 'next/headers';
import { cache } from 'react';
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
 * Internal implementation of getAuthUser
 * Wrapped with React cache() for request-level deduplication
 */
async function getAuthUserInternal() {
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
 * Gets the authenticated user from Supabase
 *
 * In test mode, returns test user data from the test auth cookie.
 * Returns userId and email, or empty strings if not authenticated.
 *
 * This function is wrapped with React cache() for request-level deduplication.
 * Multiple calls within the same request will return the same result without
 * making duplicate network calls to Supabase.
 */
export const getAuthUser = cache(getAuthUserInternal);

/**
 * Internal implementation of getCurrentUsername
 */
async function getCurrentUsernameInternal(): Promise<string | null> {
  // Reuse cached getAuthUser
  const { userId } = await getAuthUser();
  if (!userId) {
    return null;
  }

  // Check for test mode
  const testUser = await getTestUserFromCookies();
  if (testUser) {
    return testUser.username || null;
  }

  const supabase = await createClient();
  const { data: userData } = await supabase
    .from('users')
    .select('username')
    .eq('userid', userId)
    .single();

  return userData?.username || null;
}

/**
 * Gets the current authenticated user's username from the database
 *
 * In test mode, returns the username from the test auth cookie.
 * Returns username or null if not authenticated or not found.
 *
 * This function is wrapped with React cache() for request-level deduplication.
 */
export const getCurrentUsername = cache(getCurrentUsernameInternal);

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
 * Internal implementation of getUserProfileForHeader
 */
async function getUserProfileForHeaderInternal(): Promise<HeaderUserProfile | null> {
  // Reuse cached getAuthUser to avoid duplicate Supabase calls
  const { userId, email } = await getAuthUser();
  if (!userId) {
    return null;
  }

  // Check for test mode
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
  const { data: userData } = await supabase
    .from('users')
    .select('username, profile_picture_url')
    .eq('userid', userId)
    .single();

  return {
    userId,
    email,
    username: userData?.username || null,
    profilePictureUrl: userData?.profile_picture_url || null,
  };
}

/**
 * Gets authenticated user profile data for header display
 *
 * In test mode, returns mock profile data from the test auth cookie.
 * Returns user profile with username and avatar, or null if not authenticated.
 *
 * This function is wrapped with React cache() for request-level deduplication.
 */
export const getUserProfileForHeader = cache(getUserProfileForHeaderInternal);

/**
 * Gets all request headers
 *
 * Useful for debugging and passing headers to external services
 */
export async function getHeaders() {
  const rawHeaders = await headers();
  return Object.fromEntries(rawHeaders.entries());
}

/**
 * Combined layout user data for root layout
 * Fetches all user data needed for the layout in parallel
 */
export interface LayoutUserData {
  userId: string;
  email: string;
  isAdmin: boolean;
  profile: HeaderUserProfile | null;
  projects: Array<{ id: string; slug: string; name: string; config: unknown }>;
}

/**
 * Internal implementation of getLayoutUserData
 */
async function getLayoutUserDataInternal(): Promise<LayoutUserData | null> {
  // Get auth data (cached)
  const { userId, email } = await getAuthUser();

  if (!userId) {
    return null;
  }

  // Compute isAdmin inline - no need for separate function call
  const isAdmin = email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    process.env.NODE_ENV === 'development';

  // Fetch profile and projects in parallel
  const [profile, userProjects] = await Promise.all([
    getUserProfileForHeader(),
    // Dynamic import to avoid circular dependency
    import('@eptss/core').then(mod => mod.getUserProjects(userId)),
  ]);

  return {
    userId,
    email,
    isAdmin,
    profile,
    projects: userProjects.map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      config: p.config,
    })),
  };
}

/**
 * Gets all user data needed for the root layout in a single cached call
 *
 * This combines:
 * - getAuthUser() (userId, email)
 * - isAdmin check
 * - getUserProfileForHeader() (username, avatar)
 * - getUserProjects() (user's project memberships)
 *
 * Benefits:
 * - Single entry point for layout data
 * - Parallel fetching of profile and projects
 * - Request-level caching with React cache()
 */
export const getLayoutUserData = cache(getLayoutUserDataInternal);

// Re-export ensureUserExists for convenience
export { ensureUserExists } from './ensureUserExists';
