# Dashboard Architecture

## Visual Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Your App                             │
│  apps/web/app/dashboard/                                │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ config.ts                                       │    │
│  │                                                 │    │
│  │  export const dashboardConfig = {              │    │
│  │    panels: [                                    │    │
│  │      createPanel(config1, Component1),         │    │
│  │      createPanel(config2, Component2),         │    │
│  │    ],                                           │    │
│  │    layout: { useGrid: true, gap: 'md' }        │    │
│  │  }                                              │    │
│  └────────────────────────────────────────────────┘    │
│                          │                              │
│                          │ imports                      │
│                          ▼                              │
│  ┌────────────────────────────────────────────────┐    │
│  │ page.tsx                                        │    │
│  │                                                 │    │
│  │  <Dashboard                                     │    │
│  │    config={dashboardConfig}                     │    │
│  │    user={user}                                  │    │
│  │  />                                             │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          │
                          │ uses
                          ▼
┌─────────────────────────────────────────────────────────┐
│              @eptss/dashboard Package                    │
│  packages/dashboard/                                     │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ Core Components                                 │    │
│  │                                                 │    │
│  │  Dashboard                                      │    │
│  │    ├─ Filters panels by role                   │    │
│  │    ├─ Sorts by priority & order                │    │
│  │    └─ Renders DashboardLayout                  │    │
│  │                                                 │    │
│  │  PanelWrapper                                   │    │
│  │    ├─ Handles collapsible state                │    │
│  │    ├─ Manages Suspense boundaries              │    │
│  │    └─ Wraps panel component                    │    │
│  │                                                 │    │
│  │  DashboardLayout                                │    │
│  │    ├─ Creates grid/stack layout                │    │
│  │    └─ Organizes by priority                    │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ Panel Components                                │    │
│  │                                                 │    │
│  │  HeroPanel                                      │    │
│  │  CurrentRoundPanel                              │    │
│  │  ReflectionPanel                                │    │
│  │  [Future: CommunityPanel]                       │    │
│  │  [Future: StreakPanel]                          │    │
│  │  [Your custom panels...]                        │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ Utilities                                       │    │
│  │                                                 │    │
│  │  createPanel()                                  │    │
│  │  definePanelConfig()                            │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

```
User visits /dashboard
        │
        ▼
Dashboard Page (page.tsx)
  ├─ Gets current user
  ├─ Passes config + user to Dashboard component
  │
  ▼
Dashboard Component
  ├─ Filters panels by user role
  ├─ Sorts panels by priority & order
  ├─ Groups panels by priority
  │
  ▼
DashboardLayout
  ├─ Creates grid structure:
  │   ┌──────────────┬─────────┐
  │   │ Primary (L)  │ Second. │
  │   │              │ (R)     │
  │   └──────────────┴─────────┘
  │   ┌─────────────────────────┐
  │   │ Tertiary (Full Width)   │
  │   └─────────────────────────┘
  │
  ▼
PanelWrapper (for each panel)
  ├─ If collapsible: render collapse button
  ├─ Wrap in Suspense boundary
  ├─ Show skeleton while loading
  │
  ▼
Panel Component (HeroPanel, CurrentRoundPanel, etc.)
  ├─ Receives data via props
  └─ Renders content
```

## Panel Lifecycle

```
1. REGISTRATION
   config.ts
   └─ createPanel(config, Component, { skeleton })
      └─ Returns PanelDefinition

2. FILTERING
   Dashboard component
   └─ Checks user role vs requiredRole
      └─ Includes or excludes panel

3. SORTING
   Dashboard component
   └─ Sorts by priority (primary → secondary → tertiary)
      └─ Then sorts by order (1 → 2 → 3 → ...)

4. GROUPING
   Dashboard component
   └─ Groups panels by priority
      └─ primary: []
      └─ secondary: []
      └─ tertiary: []

5. LAYOUT
   DashboardLayout
   └─ Places primary in left column
   └─ Places secondary in right column
   └─ Places tertiary in full width below

6. WRAPPING
   PanelWrapper
   └─ Adds collapse button if collapsible
   └─ Wraps in Suspense boundary
   └─ Shows skeleton while loading

7. RENDERING
   Panel Component
   └─ Receives PanelProps
   └─ Renders content
```

## Component Hierarchy

```
Dashboard
 │
 ├── DashboardLayout
 │    │
 │    ├── Primary Column
 │    │    │
 │    │    ├── PanelWrapper (priority='primary', order=1)
 │    │    │    └── HeroPanel
 │    │    │
 │    │    └── PanelWrapper (priority='primary', order=2)
 │    │         └── CurrentRoundPanel
 │    │
 │    ├── Secondary Column
 │    │    │
 │    │    └── PanelWrapper (priority='secondary', order=1)
 │    │         └── [Future: CommunityPanel]
 │    │
 │    └── Tertiary Section
 │         │
 │         ├── PanelWrapper (priority='tertiary', order=1)
 │         │    └── ReflectionPanel
 │         │
 │         └── PanelWrapper (priority='tertiary', order=2)
 │              └── [Future: NextRoundPanel]
```

## Type System

```typescript
// Configuration types
PanelConfig {
  id: string
  name: string
  priority: 'primary' | 'secondary' | 'tertiary'
  order: number
  collapsible?: boolean
  requiredRole?: 'user' | 'admin'
  ...
}

// Panel definition (config + component)
PanelDefinition {
  config: PanelConfig
  component: ComponentType<PanelProps>
  skeleton?: ComponentType
  fetchData?: () => Promise<any>
}

// Props passed to each panel
PanelProps {
  config: PanelConfig
  data?: any
  user?: { id: string, role: string }
}

// Complete dashboard configuration
DashboardConfig {
  panels: PanelDefinition[]
  layout?: DashboardLayoutConfig
  header?: ComponentType
  footer?: ComponentType
}
```

## Rendering Pipeline

```
config.ts → Dashboard → Layout → Wrapper → Panel
    ↓          ↓          ↓         ↓        ↓
 panels[]   Filter    Grid      Collapse  Content
           & Sort   Structure   Button
```

## State Management

```
Dashboard (Server Component)
  ↓
  Reads config (static)
  Filters/sorts panels (static)
  ↓
PanelWrapper (Client Component)
  ↓
  useState for collapse state
  ↓
Panel Component (Server Component)
  ↓
  Receives pre-fetched data
  Renders content
```

## Extensibility Points

### 1. Add New Panel
```
packages/dashboard/src/panels/NewPanel.tsx
  ↓
packages/dashboard/src/panels/index.ts (export)
  ↓
apps/web/app/dashboard/config.ts (register)
```

### 2. Custom Layout
```
DashboardLayoutConfig {
  variant: 'default' | 'compact' | 'wide'
  useGrid: boolean
  gridTemplate?: string  // Custom CSS grid
  gap: 'sm' | 'md' | 'lg'
}
```

### 3. Custom Styling
```
definePanelConfig('my-panel', {
  className: 'custom-panel-class'
})
```

### 4. Role-Based Access
```
definePanelConfig('admin-panel', {
  requiredRole: 'admin'
})
```

## Comparison with Other Patterns

### Traditional Approach
```
Page
 ├── Component1
 ├── Component2
 ├── Component3
 └── Component4

❌ Hard to reorder
❌ No automatic layout
❌ Manual suspense
```

### Dashboard Package Approach
```
Page
 └── Dashboard(config)
      └── Auto-renders all panels

✅ Easy to reorder (change order number)
✅ Automatic grid layout
✅ Automatic suspense
✅ Plugin architecture
```

## Performance Characteristics

- **Initial Load**: Each panel streams independently via Suspense
- **Layout Shift**: Skeleton loaders prevent CLS
- **Bundle Size**: Tree-shakeable (unused panels excluded)
- **Server Components**: Dashboard + Panels can be server components
- **Client Interactivity**: Only PanelWrapper is client component

## Security Model

```
User Request
    ↓
Dashboard filters panels by user.role
    ↓
Only panels matching requiredRole are rendered
    ↓
Server-side filtering (secure)
```

## Future Architecture Enhancements

1. **Panel State Persistence**
   - Save collapse states to localStorage
   - Remember user panel preferences

2. **Dynamic Panel Loading**
   - Load panels on-demand
   - Code splitting per panel

3. **Panel Communication**
   - Event bus for inter-panel messaging
   - Shared state via Context

4. **Panel Analytics**
   - Track panel views
   - Measure engagement per panel

5. **Panel Permissions**
   - Fine-grained permissions (not just admin/user)
   - Feature flags per panel

---

This architecture provides:
- ✅ Separation of concerns
- ✅ Easy extensibility
- ✅ Type safety
- ✅ Performance optimization
- ✅ Developer experience
