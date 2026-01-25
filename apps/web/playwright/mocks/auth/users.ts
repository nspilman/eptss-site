/**
 * Mock user data for integration tests
 *
 * These users match the Supabase User type and our internal user schema
 */

export interface MockUser {
  id: string;
  email: string;
  username: string;
  publicDisplayName?: string | null;
  adminLevel?: number | null;
  profilePictureUrl?: string | null;
  createdAt: Date;
  // Supabase-specific fields
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  aud: string;
  confirmed_at?: string;
  email_confirmed_at?: string;
  phone?: string;
  last_sign_in_at?: string;
  role?: string;
}

function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  const id = overrides.id || crypto.randomUUID();
  const email = overrides.email || `test-${id.slice(0, 8)}@example.com`;
  const username = overrides.username || `testuser_${id.slice(0, 8)}`;
  const now = new Date().toISOString();

  return {
    id,
    email,
    username,
    publicDisplayName: overrides.publicDisplayName ?? null,
    adminLevel: overrides.adminLevel ?? null,
    profilePictureUrl: overrides.profilePictureUrl ?? null,
    createdAt: overrides.createdAt || new Date(),
    app_metadata: {
      provider: 'email',
      providers: ['email'],
      ...overrides.app_metadata,
    },
    user_metadata: {
      username,
      ...overrides.user_metadata,
    },
    aud: 'authenticated',
    confirmed_at: now,
    email_confirmed_at: now,
    last_sign_in_at: now,
    role: 'authenticated',
    ...overrides,
  };
}

/**
 * Pre-defined mock users for common test scenarios
 */
export const mockUsers = {
  /**
   * Regular authenticated user
   */
  regular: createMockUser({
    id: '11111111-1111-1111-1111-111111111111',
    email: 'regular@example.com',
    username: 'regularuser',
    publicDisplayName: 'Regular User',
  }),

  /**
   * Admin user with elevated privileges
   */
  admin: createMockUser({
    id: '22222222-2222-2222-2222-222222222222',
    email: 'admin@example.com',
    username: 'adminuser',
    publicDisplayName: 'Admin User',
    adminLevel: 1,
  }),

  /**
   * Super admin with highest privileges
   */
  superAdmin: createMockUser({
    id: '33333333-3333-3333-3333-333333333333',
    email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'superadmin@example.com',
    username: 'superadmin',
    publicDisplayName: 'Super Admin',
    adminLevel: 2,
  }),

  /**
   * New user (recently created, minimal data)
   */
  newUser: createMockUser({
    id: '44444444-4444-4444-4444-444444444444',
    email: 'newuser@example.com',
    username: 'newuser',
    createdAt: new Date(),
  }),

  /**
   * User with profile picture
   */
  withAvatar: createMockUser({
    id: '55555555-5555-5555-5555-555555555555',
    email: 'avatar@example.com',
    username: 'avataruser',
    publicDisplayName: 'Avatar User',
    profilePictureUrl: 'https://example.com/avatar.jpg',
  }),
};

export { createMockUser };

/**
 * Type for mock user keys
 */
export type MockUserKey = keyof typeof mockUsers;
