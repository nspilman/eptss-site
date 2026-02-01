import { createBrowserClient } from "@supabase/ssr";

// Key prefix used by Supabase for localStorage
const SUPABASE_STORAGE_KEY = `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.com').hostname.split('.')[0]}-auth-token`;

/**
 * Clears corrupted Supabase session data from localStorage
 * This can happen when session data gets double-stringified
 */
function clearCorruptedSession() {
  if (typeof window === 'undefined') return;

  try {
    const storedSession = localStorage.getItem(SUPABASE_STORAGE_KEY);
    if (storedSession) {
      // Check if the stored value is a string that starts with a quote
      // (indicating it was double-stringified)
      const parsed = JSON.parse(storedSession);
      if (typeof parsed === 'string') {
        console.warn('Detected corrupted Supabase session, clearing...');
        localStorage.removeItem(SUPABASE_STORAGE_KEY);
      }
    }
  } catch {
    // If we can't parse it at all, it might be corrupted - clear it
    console.warn('Failed to parse Supabase session, clearing...');
    localStorage.removeItem(SUPABASE_STORAGE_KEY);
  }
}

export const createClient = () => {
  // Check for and clear corrupted session before creating client
  clearCorruptedSession();

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
};
