import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'
import type { Database } from '@/types/database'
import { AUTH_HEADER_KEYS } from '@eptss/shared'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('x-user-id')?.value || '';
  const email = cookieStore.get(AUTH_HEADER_KEYS.EMAIL)?.value || '';
  return { userId, email };
}

export async function getHeaders() {
  const rawHeaders = await headers();
  console.log('Raw headers:', Object.fromEntries(rawHeaders.entries()));
  return Object.fromEntries(rawHeaders.entries());
}