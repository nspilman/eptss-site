/**
 * Re-export getAuthUser from centralized supabase-server module
 * This maintains backward compatibility for existing imports
 */
export { getAuthUser } from './supabase-server';