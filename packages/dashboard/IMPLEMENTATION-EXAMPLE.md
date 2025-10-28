# Implementation Example - Complete Walkthrough

This document shows **exactly** how to implement the dashboard package in your app, step by step.

## File Structure You'll Create

```
apps/web/app/dashboard/
├── config.ts          # NEW - Dashboard configuration
├── page.tsx           # MODIFIED - Use new Dashboard component
└── components/        # EXISTING - Keep for now, migrate later
    ├── DashboardHero/
    ├── CurrentRoundCard/
    └── ...
```

## Step 1: Create Dashboard Configuration

**File**: `apps/web/app/dashboard/config.ts`

```typescript
import {
  DashboardConfig,
  createPanel,
  definePanelConfig
} from '@eptss/dashboard';

import {
  HeroPanel,
  HeroSkeleton,
  CurrentRoundPanel,
  CurrentRoundSkeleton,
  ReflectionPanel,
  ReflectionSkeleton,
} from '@eptss/dashboard/panels';

/**
 * Dashboard Configuration for EPTSS
 *
 * To add a new panel:
 * 1. Create panel component in packages/dashboard/src/panels/
 * 2. Export from packages/dashboard/src/panels/index.ts
 * 3. Import here and add to panels array below
 */
export const eptssDeboardConfig: DashboardConfig = {
  panels: [
    // ============================================
    // PRIMARY PANELS (Main Content)
    // ============================================

    // Hero Banner - Shows current round and song
    createPanel(
      definePanelConfig('hero', {
        name: 'Round Header',
        description: 'Displays current round number and song',
        priority: 'primary',
        order: 1,
        showSkeleton: true,
      }),
      HeroPanel,
      { skeleton: HeroSkeleton }
    ),

    // Current Round Progress - Main dashboard content
    createPanel(
      definePanelConfig('current-round', {
        name: 'Current Round Progress',
        description: 'Shows phase progress and user actions',
        priority: 'primary',
        order: 2,
        showSkeleton: true,
      }),
      CurrentRoundPanel,
      { skeleton: CurrentRoundSkeleton }
    ),

    // ============================================
    // SECONDARY PANELS (Sidebar)
    // ============================================

    // FUTURE: Community Activity Panel
    // Uncomment when ready to implement:
    //
    // import { CommunityPanel, CommunitySkeleton } from '@eptss/dashboard/panels';
    //
    // createPanel(
    //   definePanelConfig('community', {
    //     name: 'Community Activity',
    //     description: 'Shows recent community activity and stats',
    //     priority: 'secondary',
    //     order: 1,
    //     showSkeleton: true,
    //   }),
    //   CommunityPanel,
    //   { skeleton: CommunitySkeleton }
    // ),

    // FUTURE: User Streak Counter
    // createPanel(
    //   definePanelConfig('streak', {
    //     name: 'Your Streak',
    //     description: 'Shows consecutive participation streak',
    //     priority: 'secondary',
    //     order: 2,
    //     showSkeleton: true,
    //   }),
    //   StreakPanel,
    //   { skeleton: StreakSkeleton }
    // ),

    // ============================================
    // TERTIARY PANELS (Below Fold)
    // ============================================

    // Reflections - User reflections for the round
    createPanel(
      definePanelConfig('reflections', {
        name: 'My Reflections',
        description: 'User reflections and journal entries',
        priority: 'tertiary',
        order: 1,
        collapsible: true,
        defaultCollapsed: false,
        showSkeleton: true,
      }),
      ReflectionPanel,
      { skeleton: ReflectionSkeleton }
    ),

    // FUTURE: Next Round Preview
    // createPanel(
    //   definePanelConfig('next-round', {
    //     name: 'Next Round',
    //     description: 'Preview and early signup for next round',
    //     priority: 'tertiary',
    //     order: 2,
    //     showSkeleton: true,
    //   }),
    //   NextRoundPanel,
    //   { skeleton: NextRoundSkeleton }
    // ),
  ],

  // Layout configuration
  layout: {
    variant: 'default',    // 'default' | 'compact' | 'wide'
    useGrid: true,         // true = grid layout, false = vertical stack
    gap: 'md',             // 'sm' | 'md' | 'lg'
  },
};
```

## Step 2: Update Dashboard Page

**File**: `apps/web/app/dashboard/page.tsx`

```typescript
import { Dashboard } from '@eptss/dashboard';
import { eptssDeboardConfig } from './config';
import { getCurrentUser } from '@eptss/auth';

// Keep these for now - they force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/**
 * Dashboard Page
 *
 * Uses the modular dashboard system from @eptss/dashboard
 * Configuration is in ./config.ts
 */
export default async function DashboardPage() {
  // Get current user for role-based panel visibility
  const user = await getCurrentUser();

  return (
    <Dashboard
      config={eptssDeboardConfig}
      user={user ? {
        id: user.id,
        role: user.role || 'user'
      } : undefined}
    />
  );
}
```

## Step 3: Import Dashboard Styles

**Option A**: In your global CSS file

**File**: `apps/web/app/globals.css`

```css
/* Add this line */
@import '@eptss/dashboard/styles/dashboard.css';

/* Your existing styles */
@tailwind base;
@tailwind components;
@tailwind utilities;
/* ... */
```

**Option B**: In your root layout

**File**: `apps/web/app/layout.tsx`

```typescript
import '@eptss/dashboard/styles/dashboard.css';
// ... other imports
```

## Step 4: Install Package (if not already)

```bash
cd apps/web
bun add @eptss/dashboard
```

Or manually update `apps/web/package.json`:

```json
{
  "dependencies": {
    "@eptss/dashboard": "workspace:*"
  }
}
```

Then run:
```bash
bun install
```

## Step 5: Test It

```bash
bun run dev
```

Navigate to `/dashboard` and you should see:
- Hero banner at top
- Current round progress in main content
- Reflections section below (collapsible)

## 🎯 What This Gives You

### Current State ✅
- Hero panel showing round info
- Current round progress with phase indicators
- Reflection panel (collapsible)
- Responsive grid layout
- Loading skeletons

### Future State (When Uncommented) 🔮
- Community activity sidebar
- User streak counter
- Next round preview
- Any other panels you create!

## 📝 To Add the Community Panel Later

### 1. Create the panel component

**File**: `packages/dashboard/src/panels/CommunityPanel.tsx`

```typescript
import { PanelProps } from '../types';

interface CommunityData {
  activeUsers: number;
  recentSubmissions: number;
  upcomingEvents: Array<{
    name: string;
    date: string;
  }>;
}

export function CommunityPanel({ data }: PanelProps<CommunityData>) {
  if (!data) {
    return (
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <p className="text-gray-400">No community data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">
        Community Activity
      </h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-400">Active Users</p>
          <p className="text-2xl font-bold text-[var(--color-accent-primary)]">
            {data.activeUsers}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-400">Recent Submissions</p>
          <p className="text-2xl font-bold text-[var(--color-accent-primary)]">
            {data.recentSubmissions}
          </p>
        </div>

        {data.upcomingEvents.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Upcoming Events</p>
            <ul className="space-y-2">
              {data.upcomingEvents.map((event, i) => (
                <li key={i} className="text-sm">
                  <span className="text-gray-300">{event.name}</span>
                  <span className="text-gray-500 ml-2">{event.date}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export function CommunitySkeleton() {
  return (
    <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800 animate-pulse">
      <div className="h-6 bg-gray-800 rounded w-2/3 mb-4" />
      <div className="space-y-4">
        <div>
          <div className="h-4 bg-gray-800 rounded w-1/3 mb-2" />
          <div className="h-8 bg-gray-800 rounded w-1/2" />
        </div>
        <div>
          <div className="h-4 bg-gray-800 rounded w-1/3 mb-2" />
          <div className="h-8 bg-gray-800 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}
```

### 2. Export it

**File**: `packages/dashboard/src/panels/index.ts`

```typescript
// Add this line
export { CommunityPanel, CommunitySkeleton } from './CommunityPanel';
```

### 3. Uncomment in config

**File**: `apps/web/app/dashboard/config.ts`

Just uncomment the community panel section!

### 4. That's it!

The community panel will automatically appear in the sidebar. No other changes needed.

## 🔄 Migration from Old Dashboard

If you want to completely migrate:

1. **Keep old code**: Rename `page.tsx` to `page.tsx.old`
2. **Implement new code**: Create new `page.tsx` and `config.ts` as shown above
3. **Test thoroughly**: Make sure everything works
4. **Migrate panels gradually**: Move one panel at a time
5. **Remove old code**: Once confident, delete old files

## 🎨 Customization Examples

### Change Layout to Stack (Vertical)

```typescript
layout: {
  variant: 'compact',
  useGrid: false,  // This makes it vertical!
  gap: 'sm',
}
```

### Make All Panels Collapsible

```typescript
createPanel(
  definePanelConfig('hero', {
    priority: 'primary',
    order: 1,
    collapsible: true,  // Add this!
  }),
  HeroPanel
)
```

### Add Admin-Only Panel

```typescript
createPanel(
  definePanelConfig('admin-stats', {
    priority: 'secondary',
    order: 1,
    requiredRole: 'admin',  // Only admins see this!
  }),
  AdminStatsPanel
)
```

## 🐛 Troubleshooting

### "Cannot find module '@eptss/dashboard'"
```bash
cd apps/web
bun add @eptss/dashboard
bun install
```

### Panels not showing
Check `config.ts`:
- Are panels exported from `@eptss/dashboard/panels`?
- Is `requiredRole` correct?
- Is panel in `panels` array?

### Layout looks broken
Check:
- Is CSS imported? `@import '@eptss/dashboard/styles/dashboard.css'`
- Is `layout.useGrid` set to `true`?
- Are Tailwind classes working?

### TypeScript errors
```bash
cd packages/dashboard
bun run check-types
```

## 📞 Need Help?

1. Check `QUICKSTART.md` for basics
2. Check `README.md` for detailed docs
3. Check `src/example-config.ts` for more examples
4. Check `MIGRATION.md` for migration help

---

**You're all set!** The dashboard is now modular and ready for new features. Adding the Community panel will be as easy as uncommenting a few lines! 🚀
