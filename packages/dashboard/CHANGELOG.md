# Dashboard Package Changelog

## [0.2.0] - 2025-01-28

### ✨ Added

#### ActionPanel Component
- **New dedicated panel for primary CTAs** (`src/panels/ActionPanel.tsx`)
- Separates "what to do next" from "current status"
- Features:
  - Urgency-based styling (`normal`, `warning`, `urgent`)
  - Time remaining display
  - Context messaging
  - High visibility placement (order: 2, right after hero)
  - Mobile-responsive design
  - Urgency indicators with icons

#### Enhanced CurrentRoundPanel
- **Refactored to focus on status only** (no CTAs)
- Shows:
  - Phase progress with checkmarks
  - "You are here" indicator for current phase
  - Phase-specific information cards
  - User's song suggestion (signup phase)
  - User's votes (voting phase)
  - Participation status
- Cleaner, more focused design
- Better visual hierarchy with pulsing current phase indicator

### 📚 Documentation
- Added `ACTION-PANEL-GUIDE.md` - Complete guide for using ActionPanel
- Updated `example-config.ts` with ActionPanel examples
- Updated panel exports in `src/panels/index.ts`

### 🔄 Breaking Changes
None - This is a new panel, existing setups work unchanged

## [0.1.0] - 2025-01-28

### ✨ Initial Release

- Core dashboard system with modular panel architecture
- Priority-based layout (primary/secondary/tertiary)
- Panel components: Hero, CurrentRound, Reflection
- Collapsible panels
- Loading states with Suspense boundaries
- Role-based access control
- Type-safe configuration
- Comprehensive documentation

---

## Migration Guide: Adding ActionPanel

If you're using the dashboard package and want to add the ActionPanel:

### Step 1: Update imports

```tsx
// apps/web/app/dashboard/config.ts
import {
  ActionPanel,
  ActionPanelSkeleton,
  type ActionPanelData,
} from '@eptss/dashboard/panels';
```

### Step 2: Add ActionPanel to config

```tsx
export const dashboardConfig: DashboardConfig = {
  panels: [
    createPanel(/*hero panel*/),

    // Add ActionPanel here (order: 2)
    createPanel(
      definePanelConfig('action', {
        name: 'Your Next Action',
        priority: 'primary',
        order: 2,
      }),
      ActionPanel,
      { skeleton: ActionPanelSkeleton }
    ),

    createPanel(/*progress panel - now order: 3*/),
    // ... rest of panels
  ],
};
```

### Step 3: Provide action data

```tsx
// apps/web/app/dashboard/page.tsx
const actionData: ActionPanelData = {
  actionText: 'Submit Your Cover',
  actionHref: '/submit',
  urgencyLevel: 'warning',
  timeRemaining: '3 days',
  contextMessage: 'The covering phase is now open!',
};

<Dashboard
  config={dashboardConfig}
  panelData={{
    action: actionData,
    // ... other panel data
  }}
/>
```

See `ACTION-PANEL-GUIDE.md` for complete examples!

---

## Comparison: Before vs After

### Before (0.1.0)
```
┌─────────────────────────────────────┐
│  Hero                               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Current Round Progress             │
│  ✓ Phase checkmarks                 │
│                                     │
│  [CTA Button buried at bottom]  ❌  │
└─────────────────────────────────────┘
```

### After (0.2.0)
```
┌─────────────────────────────────────┐
│  Hero                               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  🎯 YOUR NEXT ACTION           NEW! │
│  [Big Prominent CTA]            ✅  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Your Progress                      │
│  ✓ Clean status display         ✅  │
│  ○ ← You are here                   │
└─────────────────────────────────────┘
```

**Result:** CTAs are now impossible to miss! 🎯
