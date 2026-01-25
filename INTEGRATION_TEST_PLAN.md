# Integration Test Suite Plan

## Overview

Create a Playwright-based integration test suite for the EPTSS Next.js 15 monorepo with:
- Auth mocking harness (Supabase)
- API/network request mocking
- Page rendering state testing
- Component testing
- Foundation for future E2E tests

---

## Current Codebase Context

### Tech Stack
- **Framework**: Next.js 15.5.7, React 18.3.1
- **Package Manager**: Bun
- **Build Tool**: Turbo (monorepo)
- **Auth**: Supabase (`@supabase/ssr`, `@supabase/auth-helpers-nextjs`)
- **Database**: Drizzle ORM with PostgreSQL
- **UI**: Custom components + Radix UI

### Existing Test Infrastructure
- **Jest**: `apps/web/__tests__/form-submission.test.tsx` (25 test cases)
- **Vitest**: `packages/media-upload/src/__tests__/*.test.ts`
- **Cypress**: Basic E2E in `apps/web/cypress/` (magic link auth testing)
- **No Playwright setup exists**

### Key Auth Files
| File | Purpose |
|------|---------|
| `packages/auth/src/index.ts` | Auth package exports (LoginForm, useAuth, RequireAuth) |
| `packages/auth/src/hooks/useAuthState.ts` | Client-side auth state hook |
| `packages/auth/src/utils/ensureUserExists.ts` | User creation/verification |
| `apps/web/middleware.ts` | Route protection middleware |
| `packages/core/src/utils/supabase/server.ts` | Server-side Supabase client |

### Protected Routes (from middleware)
```
/dashboard/*
/submit/*
/voting/*
/projects/*/submit/*
/projects/*/voting/*
/projects/*/create-reflection/*
/admin/* (admin only)
```

### API Routes Structure
```
apps/web/app/api/
├── admin/           # Admin operations
├── auth/            # Auth callbacks (magic link, Google OAuth)
├── cron/            # Background jobs
├── notifications/   # User notifications
├── profile/         # Profile updates
├── round-info/      # Current round data
├── rounds/          # Round CRUD
└── comments/        # Comment operations
```

### Database Schema (Key Types)
Located in `packages/db/src/schema.ts`:
- `users` - User accounts
- `rounds` - Round configuration
- `signUps` - User signups to rounds
- `submissions` - User submissions
- `votes` - Voting records
- `notifications` - User notifications

---

## Decisions Made

- **Mock data**: Realistic data matching existing TypeScript types with factories
- **Browser coverage**: Chromium only (expand later if needed)
- **CI Integration**: Skip for now (manual runs)
- **Component tests**: Yes, include `@playwright/experimental-ct-react`
- **Auth strategy**: Cookie-based injection (tests actual middleware behavior)

---

## Target Architecture

```
apps/web/
├── playwright.config.ts           # Page-level test config
├── playwright-ct.config.ts        # Component test config
├── playwright/
│   ├── index.tsx                  # Component test hooks (router mocking)
│   ├── fixtures/
│   │   ├── auth.fixture.ts        # Auth mocking fixture
│   │   ├── api.fixture.ts         # API mocking fixture
│   │   └── index.ts               # Combined fixtures, export `test`
│   ├── mocks/
│   │   ├── auth/
│   │   │   ├── users.ts           # Mock user data
│   │   │   └── session.ts         # Mock session factory
│   │   └── api/
│   │       ├── rounds.ts          # Round data mocks
│   │       ├── notifications.ts   # Notification mocks
│   │       └── handlers.ts        # Centralized route handlers
│   ├── tests/                     # Page-level tests
│   │   ├── pages/
│   │   │   ├── home.spec.ts
│   │   │   ├── dashboard.spec.ts
│   │   │   ├── rounds.spec.ts
│   │   │   └── voting.spec.ts
│   │   ├── auth/
│   │   │   ├── protected-routes.spec.ts
│   │   │   ├── login-redirect.spec.ts
│   │   │   └── middleware.spec.ts
│   │   └── api/
│   │       ├── round-info.spec.ts
│   │       └── notifications.spec.ts
│   └── components/                # Component tests
│       ├── NotificationBell.spec.tsx
│       ├── RoundCard.spec.tsx
│       └── LoginForm.spec.tsx
```

---

## Implementation Steps

### Phase 1: Core Setup

**1.1 Install Dependencies**
```bash
cd apps/web
bun add -d @playwright/test playwright @playwright/experimental-ct-react
npx playwright install chromium
```

**1.2 Create `playwright.config.ts`**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

**1.3 Create `playwright-ct.config.ts`**
```typescript
import { defineConfig, devices } from '@playwright/experimental-ct-react';

export default defineConfig({
  testDir: './playwright/components',
  use: {
    ctPort: 3100,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

**1.4 Update `package.json` scripts**
```json
{
  "test:integration": "playwright test",
  "test:integration:ui": "playwright test --ui",
  "test:integration:headed": "playwright test --headed",
  "test:ct": "playwright test -c playwright-ct.config.ts",
  "test:ct:ui": "playwright test -c playwright-ct.config.ts --ui"
}
```

**1.5 Update `.gitignore`**
```
# Playwright
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```

---

### Phase 2: Auth Mocking Harness

**2.1 Mock User Factory** (`playwright/mocks/auth/users.ts`)
```typescript
import type { User } from '@supabase/supabase-js';

export interface MockUser extends Partial<User> {
  id: string;
  email: string;
  user_metadata: {
    username?: string;
    display_name?: string;
    is_admin?: boolean;
  };
}

export const mockUsers = {
  regular: {
    id: 'test-user-123',
    email: 'test@example.com',
    user_metadata: {
      username: 'testuser',
      display_name: 'Test User',
      is_admin: false,
    },
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
  } satisfies MockUser,

  admin: {
    id: 'admin-user-456',
    email: 'admin@example.com',
    user_metadata: {
      username: 'adminuser',
      display_name: 'Admin User',
      is_admin: true,
    },
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
  } satisfies MockUser,

  unverified: {
    id: 'unverified-789',
    email: 'unverified@example.com',
    user_metadata: {},
    aud: 'authenticated',
    role: 'authenticated',
    email_confirmed_at: undefined,
    created_at: new Date().toISOString(),
  } satisfies MockUser,
};
```

**2.2 Session Factory** (`playwright/mocks/auth/session.ts`)
```typescript
import type { Session } from '@supabase/supabase-js';
import type { MockUser } from './users';

// Simple JWT-like token for testing (not cryptographically valid)
function createMockJWT(user: MockUser): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
    role: 'authenticated',
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    iat: Math.floor(Date.now() / 1000),
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
}

export function createMockSession(user: MockUser): Session {
  return {
    access_token: createMockJWT(user),
    refresh_token: 'mock-refresh-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: user as any,
  };
}

export function getSupabaseCookies(user: MockUser, projectRef = 'test') {
  const session = createMockSession(user);
  const cookieName = `sb-${projectRef}-auth-token`;

  return [
    {
      name: cookieName,
      value: JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        token_type: session.token_type,
        user: session.user,
      }),
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax' as const,
    },
  ];
}
```

**2.3 Auth Fixture** (`playwright/fixtures/auth.fixture.ts`)
```typescript
import { test as base, type BrowserContext } from '@playwright/test';
import { mockUsers, type MockUser } from '../mocks/auth/users';
import { getSupabaseCookies } from '../mocks/auth/session';

// Get your Supabase project ref from env or hardcode for tests
const SUPABASE_PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'test';

export type AuthFixtures = {
  loginAs: (user: MockUser) => Promise<void>;
  loginAsRegular: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  logout: () => Promise<void>;
};

export const authFixture = base.extend<AuthFixtures>({
  loginAs: async ({ context }, use) => {
    const loginAs = async (user: MockUser) => {
      const cookies = getSupabaseCookies(user, SUPABASE_PROJECT_REF);
      await context.addCookies(cookies);
    };
    await use(loginAs);
  },

  loginAsRegular: async ({ loginAs }, use) => {
    await use(async () => {
      await loginAs(mockUsers.regular);
    });
  },

  loginAsAdmin: async ({ loginAs }, use) => {
    await use(async () => {
      await loginAs(mockUsers.admin);
    });
  },

  logout: async ({ context }, use) => {
    await use(async () => {
      await context.clearCookies();
    });
  },
});
```

---

### Phase 3: API/Network Mocking

**3.1 Mock Data Factories** (`playwright/mocks/api/rounds.ts`)
```typescript
// Match types from packages/core or packages/db
export interface MockRound {
  id: number;
  slug: string;
  title: string;
  song_title?: string;
  artist?: string;
  phase: 'signups' | 'covering' | 'voting' | 'celebration';
  signup_opens: string;
  covering_begins: string;
  voting_opens: string;
  celebration_starts: string;
  project_id: number;
}

export const mockRounds = {
  signupPhase: {
    id: 1,
    slug: 'round-1',
    title: 'Test Round 1',
    song_title: 'Test Song',
    artist: 'Test Artist',
    phase: 'signups',
    signup_opens: new Date(Date.now() - 86400000).toISOString(),
    covering_begins: new Date(Date.now() + 86400000).toISOString(),
    voting_opens: new Date(Date.now() + 172800000).toISOString(),
    celebration_starts: new Date(Date.now() + 259200000).toISOString(),
    project_id: 1,
  } satisfies MockRound,

  votingPhase: {
    id: 2,
    slug: 'round-2',
    title: 'Voting Round',
    song_title: 'Voting Song',
    artist: 'Voting Artist',
    phase: 'voting',
    signup_opens: new Date(Date.now() - 259200000).toISOString(),
    covering_begins: new Date(Date.now() - 172800000).toISOString(),
    voting_opens: new Date(Date.now() - 86400000).toISOString(),
    celebration_starts: new Date(Date.now() + 86400000).toISOString(),
    project_id: 1,
  } satisfies MockRound,
};

export const mockRoundsList = Object.values(mockRounds);
```

**3.2 API Fixture** (`playwright/fixtures/api.fixture.ts`)
```typescript
import { test as base, type Page, type Route } from '@playwright/test';
import { mockRoundsList, type MockRound } from '../mocks/api/rounds';

export type ApiFixtures = {
  mockApi: {
    rounds: (data?: MockRound[]) => Promise<void>;
    roundInfo: (data?: any) => Promise<void>;
    notifications: (data?: any[]) => Promise<void>;
    custom: (pattern: string, handler: (route: Route) => Promise<void>) => Promise<void>;
    failWith: (pattern: string, status: number, error?: string) => Promise<void>;
  };
};

export const apiFixture = base.extend<ApiFixtures>({
  mockApi: async ({ page }, use) => {
    const mockApi = {
      rounds: async (data = mockRoundsList) => {
        await page.route('**/api/rounds', route =>
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(data),
          })
        );
      },

      roundInfo: async (data = { currentRound: mockRoundsList[0] }) => {
        await page.route('**/api/round-info', route =>
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(data),
          })
        );
      },

      notifications: async (data = []) => {
        await page.route('**/api/notifications**', route =>
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(data),
          })
        );
      },

      custom: async (pattern, handler) => {
        await page.route(pattern, handler);
      },

      failWith: async (pattern, status, error = 'Server error') => {
        await page.route(pattern, route =>
          route.fulfill({
            status,
            contentType: 'application/json',
            body: JSON.stringify({ error }),
          })
        );
      },
    };

    await use(mockApi);
  },
});
```

**3.3 Combined Fixtures** (`playwright/fixtures/index.ts`)
```typescript
import { mergeTests } from '@playwright/test';
import { authFixture } from './auth.fixture';
import { apiFixture } from './api.fixture';

// Merge all fixtures into single test export
export const test = mergeTests(authFixture, apiFixture);
export { expect } from '@playwright/test';

// Re-export types
export type { AuthFixtures } from './auth.fixture';
export type { ApiFixtures } from './api.fixture';

// Re-export mocks for use in tests
export { mockUsers } from '../mocks/auth/users';
export { mockRounds, mockRoundsList } from '../mocks/api/rounds';
```

---

### Phase 4: Page-Level Tests

**4.1 Protected Routes Test** (`playwright/tests/auth/protected-routes.spec.ts`)
```typescript
import { test, expect, mockUsers } from '../../fixtures';

test.describe('Route Protection', () => {
  test('redirects unauthenticated user from /dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/(login|auth)/);
  });

  test('allows authenticated user to access /dashboard', async ({ page, loginAs }) => {
    await loginAs(mockUsers.regular);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('redirects non-admin from /admin', async ({ page, loginAs }) => {
    await loginAs(mockUsers.regular);
    await page.goto('/admin');
    // Should redirect to home or show unauthorized
    await expect(page).not.toHaveURL(/\/admin/);
  });

  test('allows admin to access /admin', async ({ page, loginAs }) => {
    await loginAs(mockUsers.admin);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);
  });
});
```

**4.2 Dashboard Page Test** (`playwright/tests/pages/dashboard.spec.ts`)
```typescript
import { test, expect, mockUsers, mockRoundsList } from '../../fixtures';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(mockUsers.regular);
  });

  test('renders dashboard with round data', async ({ page, mockApi }) => {
    await mockApi.rounds(mockRoundsList);
    await mockApi.notifications([]);

    await page.goto('/dashboard');

    // Wait for page to load
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('shows empty state when no rounds', async ({ page, mockApi }) => {
    await mockApi.rounds([]);
    await mockApi.notifications([]);

    await page.goto('/dashboard');

    // Adjust selector based on your actual empty state UI
    await expect(page.getByText(/no.*round/i)).toBeVisible();
  });

  test('handles API error gracefully', async ({ page, mockApi }) => {
    await mockApi.failWith('**/api/rounds', 500, 'Database connection failed');

    await page.goto('/dashboard');

    // Should show error state
    await expect(page.getByText(/error/i)).toBeVisible();
  });
});
```

**4.3 Homepage Test** (`playwright/tests/pages/home.spec.ts`)
```typescript
import { test, expect } from '../../fixtures';

test.describe('Homepage', () => {
  test('renders without auth', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/EPTSS/i);
  });

  test('shows login link when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /login|sign in/i })).toBeVisible();
  });

  test('shows dashboard link when authenticated', async ({ page, loginAs, mockUsers }) => {
    await loginAs(mockUsers.regular);
    await page.goto('/');
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
  });
});
```

---

### Phase 5: Component Testing Setup

**5.1 Component Test Hooks** (`playwright/index.tsx`)
```typescript
import { beforeMount, afterMount } from '@playwright/experimental-ct-react/hooks';

type HooksConfig = {
  router?: {
    pathname?: string;
    query?: Record<string, string>;
    push?: () => void;
    back?: () => void;
  };
};

beforeMount<HooksConfig>(async ({ hooksConfig }) => {
  // Mock next/navigation if needed
  if (hooksConfig?.router) {
    // Router mocking will be handled via props or context in components
    console.log('Router config:', hooksConfig.router);
  }
});
```

**5.2 Example Component Test** (`playwright/components/NotificationBell.spec.tsx`)
```typescript
import { test, expect } from '@playwright/experimental-ct-react';
import { NotificationBell } from '../../components/notifications/NotificationBell';

// Note: You may need to create a wrapper component that doesn't depend on
// server-side data fetching for component testing

test.describe('NotificationBell', () => {
  test('displays unread count', async ({ mount }) => {
    const component = await mount(
      <NotificationBell unreadCount={5} />
    );

    await expect(component.getByText('5')).toBeVisible();
  });

  test('hides count when zero', async ({ mount }) => {
    const component = await mount(
      <NotificationBell unreadCount={0} />
    );

    await expect(component.locator('[data-testid="badge"]')).not.toBeVisible();
  });
});
```

---

### Phase 6: Test Utilities

**6.1 Custom Wait Helpers** (`playwright/utils/wait-helpers.ts`)
```typescript
import type { Page } from '@playwright/test';

export async function waitForHydration(page: Page) {
  // Wait for Next.js hydration to complete
  await page.waitForFunction(() => {
    return document.querySelector('[data-nextjs-hydrated]') !== null ||
           !document.querySelector('#__next')?.hasAttribute('data-reactroot');
  });
}

export async function waitForLoadingComplete(page: Page) {
  // Wait for any loading spinners to disappear
  await page.waitForSelector('[data-testid="loading"]', { state: 'hidden' }).catch(() => {});
}
```

**6.2 Test Data Utilities** (`playwright/utils/data-helpers.ts`)
```typescript
import { mockRounds, type MockRound } from '../mocks/api/rounds';

export function createRound(overrides: Partial<MockRound> = {}): MockRound {
  return {
    ...mockRounds.signupPhase,
    id: Math.floor(Math.random() * 10000),
    slug: `round-${Date.now()}`,
    ...overrides,
  };
}

export function createRoundInPhase(phase: MockRound['phase']): MockRound {
  const now = Date.now();
  const day = 86400000;

  switch (phase) {
    case 'signups':
      return createRound({
        phase,
        signup_opens: new Date(now - day).toISOString(),
        covering_begins: new Date(now + day).toISOString(),
      });
    case 'covering':
      return createRound({
        phase,
        signup_opens: new Date(now - 2 * day).toISOString(),
        covering_begins: new Date(now - day).toISOString(),
        voting_opens: new Date(now + day).toISOString(),
      });
    case 'voting':
      return createRound({
        phase,
        voting_opens: new Date(now - day).toISOString(),
        celebration_starts: new Date(now + day).toISOString(),
      });
    case 'celebration':
      return createRound({
        phase,
        celebration_starts: new Date(now - day).toISOString(),
      });
  }
}
```

---

## Implementation Order

| Step | Task | Validates |
|------|------|-----------|
| 1 | Install deps, create configs | Build works |
| 2 | Create mock user/session factories | Type correctness |
| 3 | Create auth fixture | Cookie injection |
| 4 | Create API fixture | Route mocking |
| 5 | Write first page test (homepage) | Basic setup |
| 6 | Write protected route tests | Auth harness works |
| 7 | Write dashboard tests | Full integration |
| 8 | Setup component testing | CT config works |
| 9 | Write component tests | Isolated testing |

---

## Running Tests

```bash
# Run all integration tests
bun run test:integration

# Run with UI (debugging)
bun run test:integration:ui

# Run headed (see browser)
bun run test:integration:headed

# Run specific test file
bunx playwright test playwright/tests/auth/protected-routes.spec.ts

# Run component tests
bun run test:ct

# Update snapshots (if using visual regression)
bunx playwright test --update-snapshots
```

---

## Testing Priority

### High Priority (Start Here)
- Protected route behavior (auth redirects)
- Dashboard page states (loading, loaded, empty, error)
- Homepage rendering

### Medium Priority
- Round detail pages
- Voting page states
- Profile page
- Form states (but not submissions)

### Lower Priority (Build Toward E2E)
- Form submissions (signup, submit)
- Complex multi-step flows
- Cross-page navigation journeys

---

## Key Considerations

### Why Playwright over Extending Cypress?
- Separate concerns: Cypress for true E2E, Playwright for integration
- Better `page.route()` flexibility
- Superior auto-wait behavior
- Better TypeScript support
- Component testing built-in

### Auth Strategy: Cookie Injection
**Chosen approach** - Inject Supabase session cookies directly

| Pros | Cons |
|------|------|
| Tests actual middleware | Must match cookie format |
| Simple to implement | May break if Supabase changes format |
| Fast (no network) | Not testing actual auth flow |

### When to Mock vs Real API
- **Mock**: Page rendering, error states, empty states, auth flows
- **Real**: E2E flows, data integrity tests (future)

---

## Files to Create/Modify Summary

| File | Action |
|------|--------|
| `apps/web/playwright.config.ts` | Create |
| `apps/web/playwright-ct.config.ts` | Create |
| `apps/web/playwright/fixtures/auth.fixture.ts` | Create |
| `apps/web/playwright/fixtures/api.fixture.ts` | Create |
| `apps/web/playwright/fixtures/index.ts` | Create |
| `apps/web/playwright/mocks/auth/users.ts` | Create |
| `apps/web/playwright/mocks/auth/session.ts` | Create |
| `apps/web/playwright/mocks/api/rounds.ts` | Create |
| `apps/web/playwright/index.tsx` | Create |
| `apps/web/playwright/tests/auth/protected-routes.spec.ts` | Create |
| `apps/web/playwright/tests/pages/dashboard.spec.ts` | Create |
| `apps/web/playwright/tests/pages/home.spec.ts` | Create |
| `apps/web/package.json` | Modify (add scripts) |
| `apps/web/.gitignore` | Modify (add playwright artifacts) |
