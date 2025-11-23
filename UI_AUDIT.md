# UI Package Abstraction Audit

**Last Updated:** 2025-11-22
**Status:** In Progress

## Overview

This document tracks the ongoing effort to ensure consistent usage of the `@eptss/ui` package across the EPTSS codebase. The goal is to identify repeated UI patterns and abstract them into reusable components in the centralized UI package.

---

## ✅ Completed Abstractions

### 1. FormCheckboxField Component
**Status:** ✅ Complete
**Priority:** High
**Files Created:**
- `/packages/ui/src/components/ui/primitives/checkbox.tsx`
- `/packages/ui/src/components/ui/form-fields/FormCheckboxField.tsx`

**Files Updated:**
- `/apps/web/components/feedback/FeedbackForm.tsx` (lines 183-188)

**Impact:**
- Replaced 21 lines of custom HTML with 5 lines using FormCheckboxField
- Added Radix UI checkbox primitive with design system styling
- Integrated with React Hook Form pattern

**Dependencies Added:**
- `@radix-ui/react-checkbox`

---

### 2. Card Component Variants
**Status:** ✅ Complete
**Priority:** High
**Pattern:** Admin card divs with repeated glass/border styling

**Variants Created:**
- `default` - Standard card with border and shadow
- `glass` - Semi-transparent with backdrop blur
- `plain` - Simple background with subtle shadow
- `gradient-border` - Gradient border with glow effect

**Files Updated:**
- `/packages/ui/src/components/ui/primitives/card.tsx`
- `/packages/ui/stories/components/Card.stories.tsx`
- `/apps/web/app/admin/page.tsx` (2 cards)
- `/apps/web/app/admin/rounds/page.tsx` (4 cards)
- `/apps/web/app/admin/users/page.tsx` (2 cards)
- `/apps/web/app/admin/feedback/page.tsx` (1 card)
- `/apps/web/app/admin/tools/page.tsx` (5 cards)
- `/apps/web/app/waitlist/WaitlistPageClient.tsx` (1 card)

**Impact:**
- Replaced 15+ custom card divs across 6 files
- Eliminated ~200+ lines of duplicate styling
- Added type-safe variants using CVA
- Fixed gradient rendering issues (CSS variables in inline styles)
- Added glow effect to gradient-border variant

**Technical Notes:**
- Gradient backgrounds must use inline `style` prop, not Tailwind classes
- Glass variant uses `backdrop-blur-sm` for true frosted effect
- Gradient-border uses `--color-background-primary` for solid background

---

### 3. Button Component Cleanup
**Status:** ✅ Complete
**Priority:** High
**Pattern:** Custom button implementations not using UI package

**Files Updated:**
- `/apps/web/components/comment.tsx` (lines 52-73)
  - Like button: `Button variant="action" size="action"`
  - Reply button: `Button variant="action" size="action"`
- `/apps/web/app/not-found-client.tsx` (line 38)
  - Return home button: `Button variant="secondary" size="lg" asChild`
- `/apps/web/app/dashboard/ActionPanelWrapper.tsx` (lines 131-143)
  - Action button: `Button variant="secondary" size="lg" asChild`
- `/apps/web/app/layouts/DashboardLayout.tsx` (lines 34-46, 125-141)
  - Mobile toggle: `Button variant="ghost" size="icon"`
  - Sidebar collapse: `Button variant="ghost" size="icon"` with minimal className
- `/apps/web/components/Header/Header.tsx` (lines 77-89)
  - Mobile menu toggle: `Button variant="ghost" size="icon"`

**Variants Used:**
- `action` - Small text-only action buttons (like/reply)
- `secondary` - Accent-colored primary actions
- `ghost` - Icon-only transparent buttons

**Impact:**
- Cleaned up 7 custom button implementations
- Removed ~50+ lines of inline button styling
- All buttons now use centralized design system
- Improved consistency across mobile menus and actions

**No New Variants Needed:**
- All patterns fit existing Button variants

---

## 🚧 Priority 1 - Quick Wins (High frequency, simple components)

### 4. SectionHeader Component
**Status:** 📋 To Do
**Priority:** High
**Occurrences:** 5+

**Pattern:**
```tsx
<div className="mb-6 border-l-4 border-accent-secondary pl-4">
  <h3>Title</h3>
  <p>Description</p>
</div>
```

**Files:**
- `/apps/web/app/sign-up/SignupPage/SignupForm.tsx` (lines 216-220, 231-235)
- `/apps/web/app/profile/[username]/PublicProfile.tsx` (lines 103-104, 128-129, 154-155, 204-205)
- `/apps/web/app/index/Homepage/HowItWorks/HowItWorks.tsx` (lines 51-56, 86-88)

**Proposed API:**
```tsx
<SectionHeader
  title="Section Title"
  subtitle="Optional description"
  variant="accent-border" // or "default", "divider"
/>
```

**Impact:**
- Standardize section header styling across 3+ pages
- Reduce ~30+ lines of duplicate markup

---

### 5. InfoBox / AlertBox Component
**Status:** 📋 To Do
**Priority:** High
**Occurrences:** 5+

**Pattern:**
```tsx
// Info variant (blue)
<div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
  <p className="text-xs text-blue-200">
    <strong>Note:</strong> Message here
  </p>
</div>

// Warning variant (yellow)
<div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-yellow-500" />
  <div>
    <p className="text-sm text-primary font-medium">Title</p>
    <p className="text-sm text-secondary">Message</p>
  </div>
</div>
```

**Files:**
- `/apps/web/app/dashboard/ActionPanelWrapper.tsx` (lines 65-70)
- `/apps/web/app/admin/feedback/page.tsx` (lines 25-30)
- `/apps/web/app/admin/tools/page.tsx` (lines 39-48)

**Proposed API:**
```tsx
<AlertBox
  variant="info" // or "warning", "success", "error"
  title="Optional Title"
  icon={<Info />} // optional
>
  Message content here
</AlertBox>
```

**Impact:**
- Standardize alert/info box styling
- Reduce ~40+ lines of duplicate markup
- Provide consistent color-coded messaging

---

### 6. EmptyState Component
**Status:** 📋 To Do
**Priority:** High
**Occurrences:** 3+

**Pattern:**
```tsx
<div className="text-center py-8 space-y-4">
  <div className="text-4xl">📭</div>
  <h3 className="text-lg font-semibold">No items yet</h3>
  <p className="text-sm text-secondary">Description here</p>
  <Button>Optional CTA</Button>
</div>
```

**Files:**
- `/apps/web/app/profile/[username]/PublicProfile.tsx` (lines 268-273)
- `/apps/web/components/notifications/NotificationDropdown.tsx` (lines 71-78)
- `/apps/web/app/voting/VotingPage.tsx` (lines 134-149)

**Proposed API:**
```tsx
<EmptyState
  icon="📭" // or React component
  title="No items yet"
  description="Optional description"
  action={<Button>Create First Item</Button>}
/>
```

**Impact:**
- Standardize empty state UI across app
- Reduce ~30+ lines of duplicate markup
- Improve UX consistency

---

## 🔄 Priority 2 - High Impact

### 7. GradientDivider Component
**Status:** 📋 To Do
**Priority:** Medium
**Occurrences:** 3+

**Pattern:**
```tsx
<div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
```

**Files:**
- `/apps/web/app/dashboard/ActionPanelWrapper.tsx` (lines 147, 232, 210)

**Proposed API:**
```tsx
<GradientDivider direction="horizontal" /> // or "vertical"
```

**Impact:**
- Simple utility component
- Reduces repetition of long className

---

### 8. GlassContainer / GlassPanel Component
**Status:** 📋 To Do
**Priority:** Medium
**Occurrences:** 4+

**Pattern:**
```tsx
<div className="rounded-lg bg-background-tertiary p-6 backdrop-blur-sm" />
<div className="relative overflow-hidden rounded-xl p-5 lg:p-6 backdrop-blur-xs border border-gray-800 bg-gray-900/50" />
```

**Files:**
- `/apps/web/app/sign-up/SignupPage/SignupForm.tsx` (lines 216, 231)
- `/apps/web/app/sign-up/SignupPage/EmailConfirmationScreen.tsx` (line 21)
- `/apps/web/app/dashboard/ActionPanelWrapper.tsx` (lines 42-43, 112)

**Proposed API:**
```tsx
<GlassPanel variant="subtle" size="md">
  Content here
</GlassPanel>
```

**Note:** May be redundant with Card `variant="glass"` - evaluate if Card is sufficient

---

### 9. Tooltip Wrapper Component
**Status:** 📋 To Do
**Priority:** Medium
**Occurrences:** Inconsistent usage

**Pattern:**
```tsx
// Current: Raw Radix Tooltip with custom styling
<Tooltip.Root>
  <Tooltip.Trigger>...</Tooltip.Trigger>
  <Tooltip.Content className="bg-[var(--color-gray-900)] text-[var(--color-white)] text-sm rounded-xl py-3 px-4 shadow-2xl z-50">
    ...
  </Tooltip.Content>
</Tooltip.Root>
```

**Files:**
- `/apps/web/app/health/HealthBars.tsx` (lines 48-102)

**Proposed API:**
```tsx
<Tooltip content="Tooltip text">
  <button>Hover me</button>
</Tooltip>
```

**Impact:**
- Standardize tooltip styling
- Simplify API for developers
- Ensure consistent z-index and positioning

---

## 📝 Priority 3 - Polish & Enhancement

### 10. IconLink Component
**Status:** 📋 To Do
**Priority:** Low
**Occurrences:** 4+

**Pattern:** Link/button with icon + text, consistent spacing
- Used in ActionPanelWrapper, PublicProfile, LateSignupButton

**Proposed Solution:** Enhance existing navigation-button or create IconLink

---

### 11. GradientBorder Helper
**Status:** 📋 To Do
**Priority:** Low
**Occurrences:** 3+

**Pattern:**
```tsx
<div className="absolute -inset-1 bg-[var(--color-gradient-primary)] rounded-2xl blur-sm opacity-15 group-hover:opacity-35 group-hover:blur-lg transition duration-500" />
```

**Files:**
- `/apps/web/app/profile/[username]/PublicProfile.tsx` (lines 163-164, 215-216)

**Proposed Solution:** Add to Card component or create standalone helper

---

### 12. SkeletonPanel / SkeletonCard
**Status:** 📋 To Do
**Priority:** Low
**Occurrences:** 3+

**Pattern:** Animated pulse skeletons with gray-800 background

**Files:**
- `/apps/web/app/dashboard/RoundParticipantsPanelWrapper.tsx` (lines 73-93)

**Note:** `@eptss/ui` already has Skeleton component - create composite variants

---

### 13. Status Badge / Count Badge
**Status:** 📋 To Do
**Priority:** Low
**Occurrences:** 3+

**Pattern:** Colored background badge with count/text

**Files:**
- `/apps/web/app/dashboard/ActionPanelWrapper.tsx` (lines 159-161)
- `/apps/web/components/notifications/NotificationBell.tsx` (lines 144-151)

**Note:** May already exist - audit existing Badge component first

---

## Implementation Strategy

### Phase 1: Quick Wins (Current Focus)
1. ✅ FormCheckboxField
2. ✅ Card variants
3. ✅ Button cleanup
4. 📋 SectionHeader (NEXT)
5. 📋 InfoBox/AlertBox
6. 📋 EmptyState

### Phase 2: High Impact
7. 📋 GradientDivider
8. 📋 GlassContainer evaluation (vs Card glass variant)
9. 📋 Tooltip wrapper

### Phase 3: Polish
10. 📋 IconLink/navigation enhancement
11. 📋 GradientBorder helper
12. 📋 SkeletonPanel composites
13. 📋 Status Badge enhancement

---

## Metrics

**Total Components Identified:** 13
**Completed:** 3 (23%)
**In Progress:** 0
**To Do:** 10 (77%)

**Code Impact:**
- Lines of duplicate code removed: ~280+
- Files refactored: 17
- New reusable components created: 3

**Dependencies Added:**
- `@radix-ui/react-checkbox`

---

## Notes & Decisions

### Card vs GlassContainer
- Decision pending: Evaluate if Card `variant="glass"` is sufficient for all glass container needs
- May not need separate GlassContainer component

### Button Variants - No New Variants Needed
- All custom button patterns fit existing variants (action, secondary, ghost)
- Sidebar collapse button uses minimal className override (acceptable for unique UI control)

### Gradient Rendering
- Important: Gradient backgrounds must use inline `style={{ background: 'var(--color-gradient-primary)' }}`
- Tailwind `bg-[var(...)]` only generates `background-color`, not `background`

### Design System Consistency
- All new components should use CVA for variants
- All components should use CSS variables from design system
- Storybook stories required for all new components

---

## Contributing

When abstracting a new pattern:
1. Create the component in `/packages/ui/src/components/ui/`
2. Add Storybook story in `/packages/ui/stories/components/`
3. Export from `/packages/ui/src/components/index.ts`
4. Update consuming files in `/apps/web/`
5. Update this audit document with status and metrics
6. Build and test changes before marking complete
