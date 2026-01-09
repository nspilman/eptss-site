/**
 * Re-export auth utilities from centralized supabase-server module
 * This maintains backward compatibility for existing imports
 */
export { getAuthUser, getCurrentUsername, getUserProfileForHeader } from './supabase-server';
export type { HeaderUserProfile } from './supabase-server';