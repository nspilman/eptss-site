/**
 * Supabase Server Utilities for Data Access Package
 * 
 * This module re-exports utilities from @eptss/auth/server and provides
 * a typed createClient specific to the data-access Database schema.
 */

import { createClient as createAuthClient, getAuthUser as getAuthUserBase, getHeaders as getHeadersBase } from '@eptss/auth/server';
import type { Database } from '../../types/database';

/**
 * Creates a Supabase client with the data-access Database type
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