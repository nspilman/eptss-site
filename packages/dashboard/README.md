# @eptss/dashboard

A modular, extensible dashboard system for the EPTSS application. Built with a plugin-like architecture where panels can be easily added, removed, and configured.

## Features

- **Modular Panel System**: Add/remove dashboard panels without touching core code
- **Priority-Based Layout**: Automatic grid layout based on panel priority (primary/secondary/tertiary)
- **Collapsible Panels**: Built-in support for collapsible sections
- **Loading States**: Suspense boundaries with skeleton loaders
- **Type-Safe**: Full TypeScript support
- **Role-Based Access**: Show/hide panels based on user roles

## Quick Start

### 1. Install the package

```bash
# Already in your monorepo at packages/dashboard
```

### 2. Create a dashboard configuration

```tsx
// app/dashboard/config.ts
import { DashboardConfig, createPanel, definePanelConfig } from '@eptss/dashboard';
import { HeroPanel, CurrentRoundPanel, ReflectionPanel } from '@eptss/dashboard/panels';

export const myDashboardConfig: DashboardConfig = {
  panels: [
    createPanel(
      definePanelConfig('hero', {
        name: 'Round Header',
        priority: 'primary',
        order: 1,
      }),
      HeroPanel
    ),

    createPanel(
      definePanelConfig('current-round', {
        name: 'Current Round',
        priority: 'primary',
        order: 2,
      }),
      CurrentRoundPanel
    ),

    createPanel(
      definePanelConfig('reflections', {
        name: 'Reflections',
        priority: 'tertiary',
        order: 1,
        collapsible: true,
      }),
      ReflectionPanel
    ),
  ],

  layout: {
    variant: 'default',
    useGrid: true,
    gap: 'md',
  },
};
```

### 3. Use the Dashboard component

```tsx
// app/dashboard/page.tsx
import { Dashboard } from '@eptss/dashboard';
import { myDashboardConfig } from './config';

export default function DashboardPage() {
  return (
    <Dashboard
      config={myDashboardConfig}
      user={{ id: '123', role: 'user' }}
    />
  );
}
```

## Core Concepts

### Panels

A **panel** is a self-contained dashboard component with its own configuration, data fetching, and UI.

**Panel Priority** determines layout position:
- `primary`: Main content area (left column in grid, full width in stack)
- `secondary`: Sidebar content (right column in grid)
- `tertiary`: Below-the-fold content (full width at bottom)

**Panel Order** determines position within priority group (lower = higher up).

### Panel Configuration

```typescript
interface PanelConfig {
  id: string;              // Unique identifier
  name: string;            // Display name
  priority: 'primary' | 'secondary' | 'tertiary';
  order: number;           // Sort order within priority
  collapsible?: boolean;   // Can user collapse this panel?
  defaultCollapsed?: boolean;
  showSkeleton?: boolean;  // Show loading skeleton?
  requiredRole?: 'user' | 'admin';
  className?: string;      // Custom CSS classes
}
```

## Creating a New Panel

### Step 1: Create the panel component

```tsx
// packages/dashboard/src/panels/CommunityPanel.tsx
import { PanelProps } from '../types';

interface CommunityData {
  activeUsers: number;
  recentActivity: string[];
}

export function CommunityPanel({ data }: PanelProps<CommunityData>) {
  if (!data) return null;

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Community Activity</h2>
      <p className="text-gray-300">{data.activeUsers} active users</p>
      <ul className="mt-4 space-y-2">
        {data.recentActivity.map((activity, i) => (
          <li key={i} className="text-sm text-gray-400">{activity}</li>
        ))}
      </ul>
    </div>
  );
}

export function CommunitySkeleton() {
  return (
    <div className="bg-gray-900 rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-800 rounded w-1/3 mb-4" />
      <div className="h-4 bg-gray-800 rounded w-1/4 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-800 rounded w-full" />
      </div>
    </div>
  );
}
```

### Step 2: Export from panels/index.ts

```tsx
// packages/dashboard/src/panels/index.ts
export { CommunityPanel, CommunitySkeleton } from './CommunityPanel';
```

### Step 3: Add to your dashboard config

```tsx
import { CommunityPanel, CommunitySkeleton } from '@eptss/dashboard/panels';

export const myDashboardConfig: DashboardConfig = {
  panels: [
    // ... existing panels ...

    createPanel(
      definePanelConfig('community', {
        name: 'Community Activity',
        priority: 'secondary',  // Shows in sidebar
        order: 1,
      }),
      CommunityPanel,
      { skeleton: CommunitySkeleton }
    ),
  ],
};
```

That's it! Your new panel will automatically:
- Appear in the secondary (sidebar) column
- Show the skeleton loader while data loads
- Respect the grid layout system

## Layout System

The dashboard uses a responsive grid layout:

### Default Layout (with secondary panels)

```
┌──────────────────┬──────────┐
│                  │          │
│  Primary Column  │ Secondary│
│  (2/3 width)     │ Column   │
│                  │ (1/3)    │
│                  │          │
└──────────────────┴──────────┘
┌────────────────────────────┐
│   Tertiary Column          │
│   (Full width)             │
└────────────────────────────┘
```

### Stack Layout (useGrid: false)

```
┌────────────────────────────┐
│   Panel 1                  │
├────────────────────────────┤
│   Panel 2                  │
├────────────────────────────┤
│   Panel 3                  │
└────────────────────────────┘
```

## Advanced Usage

### Conditionally Show Panels

```tsx
const panels = [
  // Always show
  createPanel(config1, Component1),

  // Only show to admins
  createPanel(
    { ...config2, requiredRole: 'admin' },
    Component2
  ),
];
```

### Custom Layout

```tsx
const config: DashboardConfig = {
  panels: [...],
  layout: {
    variant: 'wide',
    useGrid: true,
    gap: 'lg',
  },
};
```

### Panel with Data Fetching (Server Components)

```tsx
// Panel component
export async function CurrentRoundPanel({ data }: PanelProps<RoundData>) {
  // Component uses pre-fetched data
  return <div>{data.roundId}</div>;
}

// Configuration with data fetcher
createPanel(
  config,
  CurrentRoundPanel,
  {
    skeleton: Skeleton,
    fetchData: async () => {
      return await getRoundData();
    },
  }
);
```

## Examples

See `src/example-config.ts` for complete configuration examples:
- `basicDashboardConfig`: Simple dashboard with core panels
- `extendedDashboardConfig`: Shows how to add future panels (commented out)
- `compactDashboardConfig`: Minimal dashboard with stack layout

## Adding Future Panels (Best Practice)

When planning future features, add placeholder panel imports commented out:

```tsx
// Future panels - uncomment when ready
// import { CommunityPanel, CommunitySkeleton } from '@eptss/dashboard/panels';
// import { StreakPanel, StreakSkeleton } from '@eptss/dashboard/panels';

export const config: DashboardConfig = {
  panels: [
    createPanel(config1, Component1),
    createPanel(config2, Component2),

    // FUTURE: Community panel
    // createPanel(
    //   definePanelConfig('community', { priority: 'secondary', order: 1 }),
    //   CommunityPanel,
    //   { skeleton: CommunitySkeleton }
    // ),
  ],
};
```

This way you can:
1. See what's planned in the config file
2. Uncomment when the panel is ready
3. No code changes needed elsewhere!

## Styling

The dashboard includes CSS classes for styling:

- `.dashboard-container`: Main wrapper
- `.dashboard-layout`: Layout container
- `.dashboard-panel`: Individual panel wrapper
- `.dashboard-panel--primary`: Primary priority panel
- `.dashboard-panel--secondary`: Secondary priority panel
- `.dashboard-panel--tertiary`: Tertiary priority panel
- `.panel-header`: Collapsible panel header
- `.panel-content`: Panel content area

Add custom styles in your app or use Tailwind classes via the `className` config option.

## TypeScript Support

All types are exported from the main package:

```tsx
import type {
  PanelConfig,
  PanelDefinition,
  PanelProps,
  DashboardConfig,
  DashboardLayoutConfig,
} from '@eptss/dashboard/types';
```

## Contributing

To add a new built-in panel to the package:

1. Create component in `src/panels/YourPanel.tsx`
2. Export from `src/panels/index.ts`
3. Add example to `src/example-config.ts`
4. Update this README

## License

Private package for EPTSS project.
