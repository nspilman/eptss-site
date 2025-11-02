/**
 * Re-export auth utilities from centralized supabase-server module
 * This maintains backward compatibility for existing imports
 */
export { getAuthUser, getCurrentUsername } from './supabase-server';