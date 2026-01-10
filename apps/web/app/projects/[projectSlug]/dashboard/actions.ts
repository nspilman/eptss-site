"use server";

import { cookies } from 'next/headers';

/**
 * Store the last viewed project slug in a cookie
 */
export async function setLastViewedProject(projectSlug: string) {
  const cookieStore = await cookies();
  cookieStore.set('lastViewedProject', projectSlug, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
  });
}
