# @eptss/routing

Centralized routing package for the EPTSS application. Provides type-safe route building and matching utilities.

## Installation

```bash
# Already installed as part of the monorepo
pnpm install
```

## Usage

### Route Builders (Server & Client Safe)

```typescript
import { routes, api } from '@eptss/routing';

// Basic routes
routes.home()                                    // "/"
routes.dashboard.root()                          // "/dashboard"
routes.dashboard.profile()                       // "/dashboard/profile"

// Project-scoped routes
routes.projects.dashboard('cover')               // "/projects/cover/dashboard"
routes.projects.reflections.list('cover')        // "/projects/cover/reflections"
routes.projects.reflections.detail('cover', 'my-reflection')
// "/projects/cover/reflections/my-reflection"

// Auth routes with redirect
routes.auth.login('/dashboard')                  // "/login?redirectUrl=%2Fdashboard"

// API routes
api.notifications.root()                         // "/api/notifications"
api.notifications.markRead('notif-123')          // "/api/notifications/notif-123/read"
```

### Route Matching (Client Components)

```typescript
'use client';

import { useRoute, useIsOnRoute, useActiveSection } from '@eptss/routing/client';

function MyComponent() {
  // Use the route hook for multiple checks
  const route = useRoute();

  const isOnDashboard = route.is('/dashboard');
  const isInProjects = route.isTree('/projects');
  const isDashboardSection = route.isSection('dashboard');

  // Or use individual hooks
  const isOnProfile = useIsOnRoute('/dashboard/profile', { exact: true });
  const activeSection = useActiveSection();

  return (
    <div>
      {isOnDashboard && <p>You're on the dashboard!</p>}
      {activeSection === 'projects' && <p>Projects section</p>}
    </div>
  );
}
```

### Route Matching (Server Components & Utilities)

```typescript
import { isOnRoute, isActiveSection, matchesPattern } from '@eptss/routing';

// In server components, middleware, or utilities
function checkRoute(pathname: string) {
  // Exact match
  if (isOnRoute(pathname, '/dashboard', { exact: true })) {
    // ...
  }

  // Tree match (includes sub-routes)
  if (isOnRoute(pathname, '/projects', { tree: true })) {
    // Matches /projects, /projects/cover, /projects/cover/dashboard, etc.
  }

  // Pattern match with dynamic segments
  if (matchesPattern(pathname, '/projects/[slug]/reflections')) {
    // Matches /projects/cover/reflections, /projects/other/reflections, etc.
  }

  // Section detection
  if (isActiveSection(pathname, 'admin')) {
    // ...
  }
}
```

### Using in Components

#### Links

```typescript
import Link from 'next/link';
import { routes } from '@eptss/routing';

// ❌ Old way (hardcoded)
<Link href="/projects/cover/reflections">Reflections</Link>

// ✅ New way (type-safe)
<Link href={routes.projects.reflections.list('cover')}>Reflections</Link>
```

#### Redirects

```typescript
import { redirect } from 'next/navigation';
import { routes } from '@eptss/routing';

// ❌ Old way
redirect('/dashboard');

// ✅ New way
redirect(routes.dashboard.root());
```

#### Navigation

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { routes } from '@eptss/routing';

function MyComponent() {
  const router = useRouter();

  const handleClick = () => {
    router.push(routes.projects.dashboard('cover'));
  };

  return <button onClick={handleClick}>Go to Dashboard</button>;
}
```

#### Active State

```typescript
'use client';

import Link from 'next/link';
import { routes } from '@eptss/routing';
import { useIsOnRoute } from '@eptss/routing/client';

function NavItem({ projectSlug }: { projectSlug: string }) {
  const isActive = useIsOnRoute(routes.projects.reflections.list(projectSlug), {
    tree: true, // Matches the route and all sub-routes
  });

  return (
    <Link
      href={routes.projects.reflections.list(projectSlug)}
      className={isActive ? 'active' : ''}
    >
      Reflections
    </Link>
  );
}
```

## API Reference

### Route Builders

#### `routes.*`

Hierarchical object containing all page route builders:

- `routes.home()` - Home page
- `routes.dashboard.*` - Dashboard routes
- `routes.projects.*` - Project-scoped routes
- `routes.auth.*` - Authentication routes
- `routes.admin.*` - Admin routes

#### `api.*`

API endpoint builders:

- `api.comments.*` - Comment API routes
- `api.notifications.*` - Notification API routes
- `api.profile.*` - Profile API routes
- `api.rounds.*` - Rounds API routes
- `api.admin.*` - Admin API routes

### Client Hooks

#### `useRoute()`

Returns an object with the current pathname and helper methods:

```typescript
const route = useRoute();

route.pathname         // Current pathname
route.is(path)         // Exact match
route.isTree(path)     // Tree match
route.matches(pattern) // Pattern match
route.isAny(paths)     // Match any of the paths
route.isSection(name)  // Check if in section
route.section          // Current section name
```

#### `useIsOnRoute(route, options?)`

Check if current pathname matches a route:

```typescript
const isOnDashboard = useIsOnRoute('/dashboard', { exact: true });
const isInProjects = useIsOnRoute('/projects', { tree: true });
```

#### `useActiveSection()`

Get the currently active section:

```typescript
const section = useActiveSection(); // 'dashboard' | 'projects' | 'admin' | 'auth' | 'home' | 'other'
```

### Server-Safe Utilities

#### `isOnRoute(pathname, route, options?)`

Check if a pathname matches a route (server-safe):

```typescript
isOnRoute('/dashboard', '/dashboard', { exact: true });  // true
isOnRoute('/dashboard/profile', '/dashboard', { tree: true }); // true
```

Options:
- `exact` - Exact match (default if no other option specified)
- `tree` - Matches route and all sub-routes
- `pattern` - Pattern match with dynamic segments
- `caseSensitive` - Case sensitive matching (default: true)

#### `matchesPattern(pathname, pattern)`

Match pathname against a pattern with dynamic segments:

```typescript
matchesPattern('/projects/cover/reflections', '/projects/[slug]/reflections'); // true
```

#### `extractParams(pathname, pattern)`

Extract parameters from a pathname:

```typescript
extractParams('/projects/cover/reflections', '/projects/[slug]/reflections');
// Returns: { slug: 'cover' }
```

## Migration Guide

### From Navigation Enum

```typescript
// ❌ Old
import { Navigation } from '@eptss/shared';
<Link href={Navigation.Dashboard}>Dashboard</Link>

// ✅ New
import { routes } from '@eptss/routing';
<Link href={routes.dashboard.root()}>Dashboard</Link>
```

### From getProjectRoute

```typescript
// ❌ Old
import { getProjectRoute } from '@eptss/shared';
<Link href={getProjectRoute.reflections('cover')}>Reflections</Link>

// ✅ New
import { routes } from '@eptss/routing';
<Link href={routes.projects.reflections.list('cover')}>Reflections</Link>
```

### From Hardcoded Paths

```typescript
// ❌ Old
<Link href="/projects/cover/dashboard">Dashboard</Link>
redirect('/login?redirectUrl=/dashboard');
if (pathname === '/dashboard') { ... }

// ✅ New
import { routes } from '@eptss/routing';
import { useIsOnRoute } from '@eptss/routing/client';

<Link href={routes.projects.dashboard('cover')}>Dashboard</Link>
redirect(routes.auth.login('/dashboard'));

const isOnDashboard = useIsOnRoute('/dashboard', { exact: true });
if (isOnDashboard) { ... }
```

## Benefits

✅ **Type Safety** - Invalid routes are caught at compile time
✅ **Discoverability** - Autocomplete shows all available routes
✅ **Refactoring** - Change a route in one place, updates everywhere
✅ **No Broken Links** - Impossible to create invalid routes
✅ **Server & Client** - Works in both server and client components
✅ **Pattern Matching** - Powerful route matching capabilities
✅ **Tree-Shakeable** - Only import what you need

## Architecture

```
packages/routing/
├── src/
│   ├── index.ts              # Main export (server-safe)
│   ├── client.ts             # Client hooks
│   ├── builders/
│   │   ├── routes.ts         # Page route builders
│   │   ├── api.ts            # API route builders
│   │   └── types.ts          # TypeScript types
│   ├── matchers/
│   │   ├── isOnRoute.ts      # Route matching logic
│   │   ├── isActiveSection.ts # Section detection
│   │   └── patterns.ts       # Pattern matching
│   └── constants/
│       ├── sections.ts       # App sections
│       └── protected.ts      # Protected routes
```

## License

Private - EPTSS Project
