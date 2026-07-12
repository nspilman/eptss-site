# Migration Guide: From Old Dashboard to @eptss/dashboard

This guide shows how to migrate your existing dashboard (`apps/web/app/dashboard/page.tsx`) to use the new modular dashboard system.

## Current Structure (Before)

```tsx
// apps/web/app/dashboard/page.tsx
export default async function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<HeroSkeleton />}>
        <DashboardHero />
      </Suspense>

      <Suspense fallback={null}>
        <VerificationAlert />
      </Suspense>

      <Suspense fallback={<CurrentRoundSkeleton />}>
        <CurrentRoundCard />
      </Suspense>

      <Suspense fallback={<ReflectionSkeleton />}>
        <ReflectionCard />
      </Suspense>

      <Suspense fallback={<NextRoundSkeleton />}>
        <NextRoundCard />
      </Suspense>
    </div>
  );
}
```

## New Structure (After)

### Step 1: Install dependencies

```bash
cd apps/web
bun add @eptss/dashboard
```

Update `apps/web/package.json`:
```json
{
  "dependencies": {
    "@eptss/dashboard": "workspace:*"
  }
}
```

### Step 2: Create dashboard configuration

Create `apps/web/app/dashboard/config.ts`:

```tsx
import { DashboardConfig, createPanel, definePanelConfig } from '@eptss/dashboard';
import {
  HeroPanel,
  HeroSkeleton,
  CurrentRoundPanel,
  CurrentRoundSkeleton,
  ReflectionPanel,
  ReflectionSkeleton,
} from '@eptss/dashboard/panels';

// Import your existing NextRoundDisplay component
import { NextRoundDisplay } from './components/NextRoundCard/NextRoundDisplay';
import { NextRoundSkeleton } from './components/NextRoundCard/NextRoundSkeleton';

// Wrap NextRoundDisplay to match PanelProps interface
function NextRoundPanel({ data }) {
  return <NextRoundDisplay {...data} />;
}

export const dashboardConfig: DashboardConfig = {
  panels: [
    // Hero - Top of page
    createPanel(
      definePanelConfig('hero', {
        name: 'Round Header',
        priority: 'primary',
        order: 1,
        showSkeleton: true,
      }),
      HeroPanel,
      { skeleton: HeroSkeleton }
    ),

    // Current Round - Main content
    createPanel(
      definePanelConfig('current-round', {
        name: 'Current Round Progress',
        priority: 'primary',
        order: 2,
        showSkeleton: true,
      }),
      CurrentRoundPanel,
      { skeleton: CurrentRoundSkeleton }
    ),

    // Reflections - Collapsible below fold
    createPanel(
      definePanelConfig('reflections', {
        name: 'My Reflections',
        priority: 'tertiary',
        order: 1,
        collapsible: true,
        defaultCollapsed: false,
        showSkeleton: true,
      }),
      ReflectionPanel,
      { skeleton: ReflectionSkeleton }
    ),

    // Next Round - Below fold
    createPanel(
      definePanelConfig('next-round', {
        name: 'Next Round',
        priority: 'tertiary',
        order: 2,
        showSkeleton: true,
      }),
      NextRoundPanel,
      { skeleton: NextRoundSkeleton }
    ),
  ],

  layout: {
    variant: 'default',
    useGrid: true,
    gap: 'md',
  },
};
```

### Step 3: Update dashboard page

Update `apps/web/app/dashboard/page.tsx`:

```tsx
import { Dashboard } from '@eptss/dashboard';
import { dashboardConfig } from './config';
import { getCurrentUser } from '@eptss/auth';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <Dashboard
      config={dashboardConfig}
      user={user ? { id: user.id, role: user.role } : undefined}
    />
  );
}
```

### Step 4: Import dashboard styles

In your `apps/web/app/layout.tsx` or global CSS:

```tsx
import '@eptss/dashboard/styles/dashboard.css';
```

Or in your CSS:
```css
@import '@eptss/dashboard/styles/dashboard.css';
```

## Benefits of Migration

### Before (Old Approach)
- ❌ Adding panels requires editing page.tsx
- ❌ No easy way to reorder panels
- ❌ No collapsible sections
- ❌ Hard to conditionally show panels
- ❌ Manual Suspense boundary management
- ❌ No priority-based layout

### After (New Approach)
- ✅ Add panels by updating config array
- ✅ Reorder with `order` property
- ✅ Built-in collapsible support
- ✅ Role-based panel visibility
- ✅ Automatic Suspense handling
- ✅ Grid layout with priority columns

## Adding Future Panels

When you're ready to add the Community panel later:

### 1. Create the panel component

```tsx
// packages/dashboard/src/panels/CommunityPanel.tsx
export function CommunityPanel({ data }: PanelProps<CommunityData>) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
      <h2 className="text-xl font-bold mb-4">Community Activity</h2>
      {/* Your community content */}
    </div>
  );
}

export function CommunitySkeleton() {
  return (
    <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800 animate-pulse">
      <div className="h-6 bg-gray-800 rounded w-1/3 mb-4" />
      {/* Skeleton content */}
    </div>
  );
}
```

### 2. Export it

```tsx
// packages/dashboard/src/panels/index.ts
export { CommunityPanel, CommunitySkeleton } from './CommunityPanel';
```

### 3. Add to config (just one line!)

```tsx
// apps/web/app/dashboard/config.ts
import { CommunityPanel, CommunitySkeleton } from '@eptss/dashboard/panels';

export const dashboardConfig: DashboardConfig = {
  panels: [
    // ... existing panels ...

    // NEW: Community panel in sidebar
    createPanel(
      definePanelConfig('community', {
        name: 'Community Activity',
        priority: 'secondary',  // Shows in sidebar!
        order: 1,
      }),
      CommunityPanel,
      { skeleton: CommunitySkeleton }
    ),
  ],
};
```

That's it! The community panel will automatically appear in the sidebar with the grid layout.

## Common Patterns

### Panel with Custom Styling

```tsx
createPanel(
  definePanelConfig('my-panel', {
    priority: 'primary',
    order: 1,
    className: 'my-custom-panel-class',
  }),
  MyPanel
)
```

### Admin-Only Panel

```tsx
createPanel(
  definePanelConfig('admin-panel', {
    priority: 'secondary',
    order: 1,
    requiredRole: 'admin',
  }),
  AdminPanel
)
```

### Collapsible Panel

```tsx
createPanel(
  definePanelConfig('details', {
    priority: 'tertiary',
    order: 1,
    collapsible: true,
    defaultCollapsed: true,  // Start collapsed
  }),
  DetailsPanel
)
```

### Panel without Skeleton

```tsx
createPanel(
  definePanelConfig('simple', {
    priority: 'secondary',
    order: 1,
    showSkeleton: false,  // No loading state
  }),
  SimplePanel
)
```

## Troubleshooting

### Panel not showing

1. Check `requiredRole` - does user have required role?
2. Check `order` - is it ordered correctly?
3. Check imports - is panel exported from `@eptss/dashboard/panels`?

### Layout looks wrong

1. Import dashboard CSS: `@eptss/dashboard/styles/dashboard.css`
2. Check `layout.useGrid` - set to `true` for grid layout
3. Check panel `priority` - primary goes left, secondary goes right

### TypeScript errors

```bash
cd packages/dashboard
bun run check-types
```

## Rollback Plan

If you need to rollback:

1. Keep your old `page.tsx` as `page.tsx.old`
2. Keep your old components in `components/` folder
3. Simply revert `page.tsx` to the old implementation

The new package doesn't modify any existing code, so rollback is safe.
