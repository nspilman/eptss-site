/**
 * Mock Supabase session factory for integration tests
 *
 * Creates valid-looking Supabase sessions for cookie injection
 */

import { MockUser } from './users';

export interface MockSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: 'bearer';
  user: MockUser;
}

/**
 * Get the Supabase project reference from the URL
 * Used to construct the correct cookie names
 */
export function getSupabaseProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
  // Extract project ref from URL like https://abcdefgh.supabase.co
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] || 'test';
}

/**
 * Create a mock JWT-like access token
 * Note: This is not a real JWT, just a base64-encoded mock for testing
 */
function createMockAccessToken(user: MockUser): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    iat: Math.floor(Date.now() / 1000),
    iss: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co/auth/v1',
    sub: user.id,
    email: user.email,
    phone: '',
    app_metadata: user.app_metadata,
    user_metadata: user.user_metadata,
    role: 'authenticated',
    aal: 'aal1',
    amr: [{ method: 'password', timestamp: Math.floor(Date.now() / 1000) }],
    session_id: crypto.randomUUID(),
  };

  // Create a mock JWT (header.payload.signature)
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  // In real JWTs, the signature is cryptographically generated
  // For mocking, we just create a deterministic fake signature
  const fakeSignature = Buffer.from(`mock_sig_${user.id}`).toString('base64url');

  return `${base64Header}.${base64Payload}.${fakeSignature}`;
}

/**
 * Create a mock refresh token
 */
function createMockRefreshToken(): string {
  return `mock_refresh_${crypto.randomUUID()}`;
}

/**
 * Create a mock Supabase session for a user
 */
export function createMockSession(user: MockUser): MockSession {
  const expiresIn = 3600; // 1 hour
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

  return {
    access_token: createMockAccessToken(user),
    refresh_token: createMockRefreshToken(),
    expires_in: expiresIn,
    expires_at: expiresAt,
    token_type: 'bearer',
    user,
  };
}

/**
 * Get the Supabase auth cookie name
 * Supabase SSR stores auth in a cookie named: sb-<project-ref>-auth-token
 */
export function getAuthCookieName(): string {
  const projectRef = getSupabaseProjectRef();
  return `sb-${projectRef}-auth-token`;
}

/**
 * Encode a session into the format Supabase SSR expects in cookies
 * Supabase stores the session as base64-encoded JSON
 */
export function encodeSessionForCookie(session: MockSession): string {
  return Buffer.from(JSON.stringify(session)).toString('base64');
}

/**
 * Get cookies needed to authenticate as a user
 * Returns an array of cookie objects ready for Playwright's context.addCookies()
 */
export function getSupabaseCookies(
  user: MockUser,
  domain = 'localhost'
): Array<{
  name: string;
  value: string;
  domain: string;
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
}> {
  const session = createMockSession(user);
  const cookieName = getAuthCookieName();

  // Supabase SSR may split large cookies into chunks
  // For our mock sessions, a single cookie should suffice
  // The format is: sb-<ref>-auth-token.0, sb-<ref>-auth-token.1, etc.
  // But for simplicity, we'll use a single cookie

  const sessionValue = encodeSessionForCookie(session);

  return [
    {
      name: `${cookieName}.0`,
      value: `base64-${sessionValue}`,
      domain,
      path: '/',
      httpOnly: true,
      secure: false, // Set to false for localhost
      sameSite: 'Lax' as const,
    },
  ];
}
