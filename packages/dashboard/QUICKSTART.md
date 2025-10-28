# Dashboard Package - Quick Start

## 🎯 Philosophy

This dashboard is built like a **plugin system**. Want to add a new panel? Just create the component, add one line to your config, done.

## 📦 What You Get

- **Modular panels** that plug in/out easily
- **Automatic layout** (grid with sidebar)
- **Collapsible sections**
- **Loading states** built-in
- **Role-based visibility**

## 🚀 3-Step Setup

### 1. Create Panel Component

```tsx
// packages/dashboard/src/panels/MyNewPanel.tsx
import { PanelProps } from '../types';

export function MyNewPanel({ data }: PanelProps) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
      <h2 className="text-xl font-bold">My New Feature</h2>
      {/* Your content */}
    </div>
  );
}

export function MyNewPanelSkeleton() {
  return (
    <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800 animate-pulse">
      <div className="h-6 bg-gray-800 rounded w-1/3" />
    </div>
  );
}
```

### 2. Export It

```tsx
// packages/dashboard/src/panels/index.ts
export { MyNewPanel, MyNewPanelSkeleton } from './MyNewPanel';
```

### 3. Add to Config

```tsx
// apps/web/app/dashboard/config.ts
import { MyNewPanel, MyNewPanelSkeleton } from '@eptss/dashboard/panels';

export const dashboardConfig: DashboardConfig = {
  panels: [
    // ... existing panels ...

    createPanel(
      definePanelConfig('my-new-panel', {
        name: 'My New Feature',
        priority: 'secondary',  // 'primary' | 'secondary' | 'tertiary'
        order: 1,
      }),
      MyNewPanel,
      { skeleton: MyNewPanelSkeleton }
    ),
  ],
};
```

## 🎨 Layout Rules

### Panel Priority

```
priority: 'primary'    → Main column (left, 2/3 width)
priority: 'secondary'  → Sidebar (right, 1/3 width)
priority: 'tertiary'   → Below fold (full width)
```

### Panel Order

Lower number = higher up:
```tsx
order: 1   // Shows first
order: 2   // Shows second
order: 100 // Shows last
```

## 🔧 Common Configurations

### Collapsible Panel

```tsx
definePanelConfig('my-panel', {
  priority: 'tertiary',
  collapsible: true,
  defaultCollapsed: false,  // or true to start collapsed
})
```

### Admin-Only Panel

```tsx
definePanelConfig('admin-panel', {
  priority: 'secondary',
  requiredRole: 'admin',
})
```

### Panel without Loading State

```tsx
definePanelConfig('simple-panel', {
  priority: 'secondary',
  showSkeleton: false,
})
```

### Custom Styling

```tsx
definePanelConfig('styled-panel', {
  priority: 'primary',
  className: 'custom-class-name',
})
```

## 📋 Full Config Example

```tsx
import { DashboardConfig, createPanel, definePanelConfig } from '@eptss/dashboard';
import { HeroPanel, CurrentRoundPanel, ReflectionPanel } from '@eptss/dashboard/panels';

export const dashboardConfig: DashboardConfig = {
  panels: [
    // Top hero
    createPanel(
      definePanelConfig('hero', {
        name: 'Round Header',
        priority: 'primary',
        order: 1,
      }),
      HeroPanel
    ),

    // Main content
    createPanel(
      definePanelConfig('current-round', {
        name: 'Current Round',
        priority: 'primary',
        order: 2,
      }),
      CurrentRoundPanel
    ),

    // Sidebar (optional - remove this section if you don't have sidebar panels yet)
    // createPanel(
    //   definePanelConfig('community', {
    //     name: 'Community',
    //     priority: 'secondary',
    //     order: 1,
    //   }),
    //   CommunityPanel
    // ),

    // Below fold
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
    useGrid: true,     // false for vertical stack
    gap: 'md',         // 'sm' | 'md' | 'lg'
  },
};
```

## 🎯 Pro Tips

### Planning Future Features

Comment out panels you'll add later:

```tsx
panels: [
  createPanel(config1, Panel1),
  createPanel(config2, Panel2),

  // FUTURE: Add when ready
  // createPanel(
  //   definePanelConfig('future-feature', { ... }),
  //   FuturePanel
  // ),
]
```

### Reordering Panels

Just change the `order` number:

```tsx
// Before: Reflections shows first
definePanelConfig('reflections', { priority: 'tertiary', order: 1 })
definePanelConfig('next-round', { priority: 'tertiary', order: 2 })

// After: Next round shows first
definePanelConfig('reflections', { priority: 'tertiary', order: 2 })
definePanelConfig('next-round', { priority: 'tertiary', order: 1 })
```

### Removing Panels

Just remove or comment out the `createPanel(...)` call.

### Testing Layouts

Try different priorities to see where panels look best:

```tsx
// Try in main column
priority: 'primary'

// Doesn't look good? Try sidebar
priority: 'secondary'

// Still not right? Try below fold
priority: 'tertiary'
```

## 🐛 Debugging

### Panel not showing?
- Check `requiredRole` matches user role
- Check panel is in `panels` array
- Check panel is exported from `@eptss/dashboard/panels`

### Layout looks wrong?
- Import CSS: `import '@eptss/dashboard/styles/dashboard.css'`
- Check `layout.useGrid` is `true`
- Check Tailwind config includes dashboard package

### TypeScript errors?
```bash
cd packages/dashboard
bun run check-types
```

## 📚 More Info

- Full docs: `README.md`
- Migration guide: `MIGRATION.md`
- Examples: `src/example-config.ts`

## 🎬 That's It!

You now have a modular dashboard where features plug in and out easily. Add the Community panel when you're ready - it's just 3 steps! 🚀
