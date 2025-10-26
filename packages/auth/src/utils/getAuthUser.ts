import { cookies } from 'next/headers';
import { AUTH_HEADER_KEYS } from '@eptss/shared';

export async function getAuthUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('x-user-id')?.value || '';
  const email = cookieStore.get(AUTH_HEADER_KEYS.EMAIL)?.value || '';
  return { userId, email };
}