# Dashboard Architecture Fix

## Problem

The original dashboard package had a React Server/Client component boundary issue:

```
Error: Functions cannot be passed directly to Client Components 
unless you explicitly expose it by marking it with "use server"
```

This occurred because:
1. `Dashboard` (server component) was passing `PanelDefinition` objects to `PanelWrapper` (client component)
2. `PanelDefinition` contains React component functions (`component`, `skeleton`)
3. You cannot pass functions from server components to client components

## Solution

Refactored the component hierarchy:

### Before (Broken)
```tsx
// Dashboard.tsx (server component)
<PanelWrapper 
  panel={panelDefinition}  // ❌ Passing component functions
  user={user}
  data={data}
/>

// PanelWrapper.tsx (client component)
const { component: Component, skeleton: Skeleton } = panel;
<Component {...props} />  // ❌ Rendering in client component
```

### After (Fixed)
```tsx
// Dashboard.tsx (server component)
const { component: Component, skeleton: Skeleton } = panel;
<PanelWrapper config={config}>  // ✅ Only passing config object
  <Suspense fallback={<Skeleton />}>
    <Component {...props} />  // ✅ Rendering in server component
  </Suspense>
</PanelWrapper>

// PanelWrapper.tsx (client component)
export function PanelWrapper({ config, children }) {
  // Only handles collapsible UI behavior
  return <div>{children}</div>
}
```

## Key Changes

### 1. PanelWrapper Simplified
**File**: `packages/dashboard/src/core/PanelWrapper.tsx`

- Changed from accepting `panel: PanelDefinition` to `children: ReactNode`
- Now only handles collapsible behavior (client-side interactivity)
- No longer responsible for rendering panel components

### 2. Dashboard Renders Components
**File**: `packages/dashboard/src/core/Dashboard.tsx`

- Extracts component and skeleton from panel definition
- Renders components in the server component
- Passes rendered components as children to PanelWrapper
- Handles Suspense boundaries

## Benefits

1. **Correct Server/Client Boundary**: Components are rendered server-side, only UI state is client-side
2. **Better Performance**: Panel components can be server components (data fetching, etc.)
3. **Cleaner Separation**: PanelWrapper only handles UI interactivity
4. **No Serialization Issues**: No need to serialize component functions

## React Server Components Pattern

This follows the recommended pattern:

```tsx
// Server Component (can fetch data, render components)
function ServerComponent() {
  return (
    <ClientComponent>
      <ServerChild />  // ✅ Server component as child
    </ClientComponent>
  );
}

// Client Component (handles interactivity)
'use client';
function ClientComponent({ children }) {
  const [state, setState] = useState();
  return <div>{children}</div>;
}
```

## Testing

The dashboard should now work without the serialization error. Test:

1. Visit `/dashboard` - should load without errors
2. Click collapse buttons - should work (client-side interactivity)
3. Check that all panels render correctly
4. Verify Suspense boundaries show skeletons during loading

## Related Files

- `packages/dashboard/src/core/Dashboard.tsx` - Server component, renders panels
- `packages/dashboard/src/core/PanelWrapper.tsx` - Client component, handles collapse
- `apps/web/app/dashboard/page.tsx` - Uses Dashboard component
- `apps/web/app/dashboard/dashboard-config.ts` - Panel configuration
