/**
 * Supabase Server Utilities for Web App
 * 
 * This module re-exports utilities from @eptss/auth/server and provides
 * a typed createClient specific to the web app's Database schema.
 */

import { createClient as createAuthClient, getAuthUser as getAuthUserBase, getHeaders as getHeadersBase } from '@eptss/auth/server';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client with the web app's Database type
 */
export async function createClient() {
  return createAuthClient<Database>();
}

/**
 * Re-export getAuthUser from @eptss/auth/server
 */
export const getAuthUser = getAuthUserBase;

/**
 * Re-export getHeaders from @eptss/auth/server
 */
export const getHeaders = getHeadersBase;