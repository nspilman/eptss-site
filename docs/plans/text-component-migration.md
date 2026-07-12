# Text Component Migration Checklist

**Goal**: Ensure all packages use the `Text` component from `@eptss/ui` instead of raw HTML elements.

**Text Component Location**: `packages/ui/src/components/ui/primitives/typography.tsx`

---

## CRITICAL PRIORITY

### Legal/Policy Pages
- [ ] `apps/web/app/privacy-policy/page.tsx` (9 instances)
- [ ] `apps/web/app/terms-of-service/page.tsx` (8 instances)

---

## HIGH PRIORITY - Apps/Web

### Core Components
- [ ] `apps/web/components/Footer/Footer.tsx` (6 instances)
- [ ] `apps/web/components/comment.tsx` (5 instances)

### Blog
- [ ] `apps/web/app/blog/Blog/BlogHome.tsx` (13 instances)

### Admin
- [ ] `apps/web/app/admin/projects/components/editors/BusinessRulesEditor.tsx` (13 instances)
- [ ] `apps/web/app/admin/notifications/page.tsx` (12 instances)
- [ ] `apps/web/app/admin/projects/ProjectConfigEditor.tsx` (8 instances)
- [ ] `apps/web/app/admin/page.tsx` (8 instances)
- [ ] `apps/web/app/admin/projects/components/editors/AutomationConfigEditor.tsx` (5 instances)

### Profile & Projects
- [ ] `apps/web/app/profile/[username]/PublicProfile.tsx` (10 instances)
- [ ] `apps/web/app/projects/[projectSlug]/reflections/page.tsx` (9 instances)
- [ ] `apps/web/app/projects/[projectSlug]/reflections/[slug]/page.tsx` (6 instances)
- [ ] `apps/web/app/projects/[projectSlug]/discussions/page.tsx` (6 instances)
- [ ] `apps/web/app/projects/[projectSlug]/voting/VotingPage.tsx` (4 instances)
- [ ] `apps/web/app/projects/[projectSlug]/submit/SubmitPage/SubmitPage.tsx` (2 instances)

### Dashboard & Health
- [ ] `apps/web/app/health/HealthBars.tsx` (8 instances)

---

## HIGH PRIORITY - Packages

### User Content
- [ ] `packages/user-content/src/components/ReflectionCard/ReflectionDisplay.tsx` (17 instances)

### Profile
- [ ] `packages/profile/src/components/ReferralsTab.tsx` (12 instances)
- [ ] `packages/profile/src/components/ProfileHeader.tsx` (8 instances)
- [ ] `packages/profile/src/components/PrivacySettingsTab.tsx` (7 instances)

### Admin
- [ ] `packages/admin/src/components/AdminTabs/NotificationsTab.tsx` (10 instances)

### Rounds & Dashboard
- [ ] `packages/rounds/src/components/RoundTimeline.tsx` (8 instances)
- [ ] `packages/dashboard/src/panels/PhaseStatusPanel.tsx` (7 instances)
- [ ] `packages/dashboard/src/panels/ActionPanel.tsx` (7 instances)

### Referrals
- [ ] `packages/referrals/src/components/InviteFriendsCard.tsx` (6 instances)

---

## MEDIUM PRIORITY - Apps/Web

### Dashboard Components
- [ ] `apps/web/app/dashboard/ReflectionsSection.tsx` (5 instances)
- [ ] `apps/web/app/dashboard/ActionPanelWrapper.tsx` (5 instances)
- [ ] `apps/web/app/dashboard/CountdownBarWrapper.tsx` (6 instances)

### Other Components
- [ ] `apps/web/app/index/Homepage/RoundsDisplay/ClientRoundsDisplay.tsx` (6 instances)

---

## LOW PRIORITY - Storybook/Documentation

### UI Stories
- [ ] `packages/ui/stories/4-display/GridLayout.stories.tsx` (23 instances)
- [ ] `packages/ui/stories/4-display/Card.stories.tsx` (18 instances)
- [ ] `packages/ui/stories/components/TypographySection.tsx` (15 instances)
- [ ] `packages/ui/stories/5-navigation/Tabs.stories.tsx` (15 instances)
- [ ] `packages/ui/stories/4-display/GradientDivider.stories.tsx` (13 instances)
- [ ] `packages/ui/stories/components/ContainerQueriesSection.tsx` (12 instances)
- [ ] `packages/ui/stories/2-primitives/Button.stories.tsx` (10 instances)

---

## Statistics

- **Total files**: 47+
- **Total instances**: 350+
- **Critical**: 2 files
- **High priority**: 26 files
- **Medium priority**: 4 files
- **Low priority**: 7 files

---

## Migration Pattern

Replace:
```tsx
<p className="...">Text content</p>
<span className="...">Text content</span>
```

With:
```tsx
<Text size="base" color="tertiary" weight="normal">Text content</Text>
```

Import:
```tsx
import { Text } from "@eptss/ui";
```
