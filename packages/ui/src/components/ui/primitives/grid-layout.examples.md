# GridLayout Examples

## Basic Usage

### Simple 3-Column Grid

```tsx
import { GridLayout, GridItem } from '@eptss/ui'

export function SimpleGrid() {
  return (
    <GridLayout cols={3} gap="md">
      <GridItem>Column 1</GridItem>
      <GridItem>Column 2</GridItem>
      <GridItem>Column 3</GridItem>
    </GridLayout>
  )
}
```

### Custom Fractional Layout (Dashboard Use Case)

```tsx
import { GridLayout, GridItem } from '@eptss/ui'

export function DashboardGrid() {
  return (
    <GridLayout template="2fr 1fr" gap="md">
      {/* Main content area - 2/3 width */}
      <GridItem>
        <div className="space-y-6">
          <HeroPanel />
          <ActionPanel />
        </div>
      </GridItem>

      {/* Sidebar - 1/3 width */}
      <GridItem>
        <div className="space-y-6">
          <ParticipantsPanel />
          <StatsPanel />
        </div>
      </GridItem>
    </GridLayout>
  )
}
```

### Full-Width Header + Two-Column Layout

```tsx
import { GridLayout, GridItem } from '@eptss/ui'

export function DashboardWithHeader() {
  return (
    <GridLayout template="2fr 1fr" gap="lg">
      {/* Header spans all columns */}
      <GridItem colSpan="full">
        <ProfileSetupPanel />
      </GridItem>

      {/* Main content - 2/3 width */}
      <GridItem>
        <HeroPanel />
      </GridItem>

      {/* Sidebar - 1/3 width */}
      <GridItem>
        <ParticipantsPanel />
      </GridItem>

      {/* Footer spans all columns */}
      <GridItem colSpan="full">
        <ReflectionsPanel />
      </GridItem>
    </GridLayout>
  )
}
```

### Responsive Behavior

```tsx
import { GridLayout, GridItem } from '@eptss/ui'

export function ResponsiveGrid() {
  return (
    <GridLayout
      cols={4}           // 4 columns on desktop
      mobileCols={2}     // 2 columns on mobile
      breakpoint="md"    // Switch at 768px
      gap="md"
    >
      {/* Full width on mobile, 2 cols on desktop */}
      <GridItem colSpan={2} mobileColSpan="full">
        Wide item (2 cols desktop, full width mobile)
      </GridItem>

      {/* 1 col on mobile (default), 1 col on desktop */}
      <GridItem colSpan={1}>Item 2</GridItem>
      <GridItem colSpan={1}>Item 3</GridItem>

      {/* 2 cols on mobile, 2 cols on desktop */}
      <GridItem colSpan={2} mobileColSpan={2}>
        Another wide item
      </GridItem>
    </GridLayout>
  )
}
```

### Complex Layout with Spans

```tsx
import { GridLayout, GridItem } from '@eptss/ui'

export function ComplexGrid() {
  return (
    <GridLayout cols={4} gap="md">
      <GridItem colSpan={4}>Full width header</GridItem>

      <GridItem colSpan={3} rowSpan={2}>
        Large main content area
      </GridItem>

      <GridItem colSpan={1}>Sidebar item 1</GridItem>
      <GridItem colSpan={1}>Sidebar item 2</GridItem>

      <GridItem colSpan={2}>Footer left</GridItem>
      <GridItem colSpan={2}>Footer right</GridItem>
    </GridLayout>
  )
}
```

## Props Reference

### GridLayout Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cols` | `1-12` | `12` | Number of columns for desktop layout |
| `template` | `string` | - | Custom grid-template-columns (e.g., "2fr 1fr") |
| `mobileCols` | `1-4` | `1` | Number of columns for mobile |
| `breakpoint` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Breakpoint for mobile→desktop |
| `gap` | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl"` | `"md"` | Gap between grid items |
| `align` | `"start" \| "center" \| "end" \| "stretch"` | `"start"` | Vertical alignment of items |

### GridItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colSpan` | `1-12 \| "full"` | `1` | Columns to span (desktop) |
| `mobileColSpan` | `1-4 \| "full"` | `1` | Columns to span (mobile). Use `"full"` for full-width mobile items |
| `rowSpan` | `1-6` | `1` | Rows to span |
| `colStart` | `1-12` | - | Starting column position |
| `align` | `"start" \| "center" \| "end" \| "stretch"` | - | Self-alignment override |
| `breakpoint` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | When to apply desktop span |

## Migration from Current DashboardLayout

Your current dashboard uses a hardcoded 2fr 1fr layout. Here's how to migrate:

**Before:**
```tsx
<DashboardLayout config={config} panelsByPriority={panelsByPriority}>
  {/* Complex zone-based routing logic */}
</DashboardLayout>
```

**After:**
```tsx
<GridLayout template="2fr 1fr" gap="md">
  {/* Header panels */}
  <GridItem colSpan="full">
    <ProfileSetupPanel />
  </GridItem>

  {/* Main content */}
  <GridItem>
    <div className="flex flex-col gap-6">
      <HeroPanel />
    </div>
  </GridItem>

  {/* Sidebar */}
  <GridItem>
    <div className="flex flex-col gap-6">
      <ParticipantsPanel />
    </div>
  </GridItem>

  {/* Footer panels */}
  <GridItem colSpan="full">
    <div className="flex flex-col gap-6">
      <ReflectionsPanel />
      <InviteFriendsPanel />
    </div>
  </GridItem>
</GridLayout>
```

## Benefits

1. **Flexible**: Support for any grid layout (3-column, 4-column, asymmetric, etc.)
2. **Responsive**: Built-in mobile stacking with configurable breakpoints
3. **Reusable**: Can be used anywhere in your app, not just dashboards
4. **Type-safe**: Full TypeScript support with prop validation
5. **Composable**: Mix and match with other UI components
6. **Simple**: No complex zone-based routing logic needed
