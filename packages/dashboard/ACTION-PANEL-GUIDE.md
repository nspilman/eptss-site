# ActionPanel Guide

The **ActionPanel** is a dedicated panel for displaying the user's primary call-to-action. It separates "what to do next" from "current status" for better visual hierarchy and user experience.

## Why ActionPanel?

### Problem with Old Approach
Previously, CTAs were buried at the bottom of the CurrentRoundCard:
- ❌ Hard to find (lots of scrolling)
- ❌ Mixed with status information
- ❌ No urgency indicators
- ❌ Felt disconnected from the action

### Solution: Dedicated ActionPanel
- ✅ High priority placement (right after hero)
- ✅ Separates action from status
- ✅ Urgency-based styling
- ✅ Prominent, impossible to miss

## Visual Layout

```
┌─────────────────────────────────────┐
│  Hero: Round 12 - "Wonderwall"      │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  🎯 YOUR NEXT ACTION                │  ← ActionPanel
│                                     │
│  ⏰ Voting closes in 3 days         │
│                                     │
│  [Submit Your Cover →]              │  ← Big CTA
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Your Progress                      │  ← CurrentRoundPanel
│  ✓ Signed Up                        │     (status only)
│  ✓ Voted                            │
│  ○ Submit Cover  ← You are here     │
└─────────────────────────────────────┘
```

## Basic Usage

### 1. Add to Dashboard Config

```tsx
// apps/web/app/dashboard/config.ts
import { ActionPanel, ActionPanelSkeleton } from '@eptss/dashboard/panels';

export const dashboardConfig: DashboardConfig = {
  panels: [
    // Hero (order: 1)
    createPanel(/*...*/),

    // ACTION PANEL (order: 2) - Right after hero!
    createPanel(
      definePanelConfig('action', {
        name: 'Your Next Action',
        priority: 'primary',
        order: 2,
      }),
      ActionPanel,
      { skeleton: ActionPanelSkeleton }
    ),

    // Progress panel (order: 3)
    createPanel(/*...*/),
  ],
};
```

### 2. Pass Data to Panel

The ActionPanel expects `ActionPanelData`:

```tsx
import type { ActionPanelData } from '@eptss/dashboard/panels';

const actionData: ActionPanelData = {
  actionText: 'Submit Your Cover',
  actionHref: '/submit',
  urgencyLevel: 'normal', // 'normal' | 'warning' | 'urgent'
  timeRemaining: '3 days, 5 hours',
  contextMessage: 'The covering phase is now open!',
};
```

## ActionPanelData Properties

```typescript
interface ActionPanelData {
  /** Button text (e.g., "Submit Your Cover") */
  actionText: string;

  /** Route/href for the action */
  actionHref: string;

  /** Urgency affects styling */
  urgencyLevel?: 'normal' | 'warning' | 'urgent';

  /** Time remaining display */
  timeRemaining?: string;

  /** Context message above button */
  contextMessage?: string;

  /** Optional icon before button text */
  icon?: React.ReactNode;

  /** High priority = background pattern */
  isHighPriority?: boolean;
}
```

## Urgency Levels

### `urgencyLevel: 'normal'` (default)
- Gray border
- Blue time remaining
- Standard styling
- Use for: Plenty of time remaining (> 7 days)

```tsx
{
  actionText: 'Sign Up for Round 12',
  actionHref: '/sign-up',
  urgencyLevel: 'normal',
  timeRemaining: '10 days',
}
```

### `urgencyLevel: 'warning'`
- Yellow border
- Yellow time remaining
- "Deadline approaching" indicator
- Use for: Less than 7 days remaining

```tsx
{
  actionText: 'Submit Your Cover',
  actionHref: '/submit',
  urgencyLevel: 'warning',
  timeRemaining: '3 days, 5 hours',
  contextMessage: 'Don\'t forget to submit before the deadline!',
}
```

### `urgencyLevel: 'urgent'`
- Red border
- Red time remaining
- "Action needed urgently!" indicator
- Use for: Less than 24 hours remaining

```tsx
{
  actionText: 'Cast Your Votes',
  actionHref: '/voting',
  urgencyLevel: 'urgent',
  timeRemaining: '8 hours',
  contextMessage: 'Voting closes soon!',
}
```

## Phase-Based Examples

### Signup Phase
```tsx
const actionData: ActionPanelData = {
  actionText: hasSignedUp ? 'Update Song Suggestion' : 'Sign Up for Round 12',
  actionHref: hasSignedUp ? '/sign-up?update=true' : '/sign-up',
  urgencyLevel: daysRemaining < 2 ? 'warning' : 'normal',
  timeRemaining: formatTimeRemaining(phaseCloses),
  contextMessage: 'Suggest a song for everyone to cover!',
};
```

### Covering Phase
```tsx
const actionData: ActionPanelData = {
  actionText: hasSubmitted ? 'Update Submission' : 'Submit Cover',
  actionHref: '/submit',
  urgencyLevel: daysRemaining < 1 ? 'urgent' : daysRemaining < 3 ? 'warning' : 'normal',
  timeRemaining: formatTimeRemaining(phaseCloses),
  contextMessage: hasSubmitted
    ? 'You can update your cover until the deadline!'
    : 'Record and submit your cover of the selected song.',
  icon: <MusicIcon />,
};
```

### Voting Phase
```tsx
const actionData: ActionPanelData = {
  actionText: hasVoted ? 'Update Votes' : 'Cast Votes',
  actionHref: '/voting',
  urgencyLevel: hoursRemaining < 24 ? 'urgent' : daysRemaining < 3 ? 'warning' : 'normal',
  timeRemaining: formatTimeRemaining(phaseCloses),
  contextMessage: 'Listen to covers and vote for your favorites!',
  icon: <VoteIcon />,
};
```

### Celebration Phase
```tsx
const actionData: ActionPanelData = {
  actionText: 'View Round Results',
  actionHref: `/round/${roundSlug}`,
  urgencyLevel: 'normal',
  contextMessage: '🎉 This round is complete! Check out the winners.',
};
```

## Complete Implementation Example

```tsx
// apps/web/app/dashboard/page.tsx
import { Dashboard } from '@eptss/dashboard';
import { dashboardConfig } from './config';
import { getCurrentRound, getUserRoundDetails } from '@eptss/data-access';
import type { ActionPanelData } from '@eptss/dashboard/panels';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const round = await getCurrentRound();
  const userDetails = await getUserRoundDetails(user.id, round.id);

  // Determine action data based on phase
  const actionData: ActionPanelData | null = getActionData(
    round.phase,
    userDetails,
    round.phaseCloses
  );

  return (
    <Dashboard
      config={dashboardConfig}
      user={user}
      // Pass action data to the ActionPanel
      panelData={{
        action: actionData,
        'current-round': {
          roundId: round.id,
          phase: round.phase,
          hasSignedUp: userDetails.hasSignedUp,
          hasSubmitted: userDetails.hasSubmitted,
          hasVoted: userDetails.hasVoted,
        },
      }}
    />
  );
}

function getActionData(
  phase: Phase,
  userDetails: UserRoundDetails,
  phaseCloses: string
): ActionPanelData | null {
  const timeRemaining = formatTimeRemaining(phaseCloses);
  const daysRemaining = getDaysRemaining(phaseCloses);

  switch (phase) {
    case 'signups':
      return {
        actionText: userDetails.hasSignedUp ? 'Update Song Suggestion' : 'Sign Up',
        actionHref: userDetails.hasSignedUp ? '/sign-up?update=true' : '/sign-up',
        urgencyLevel: daysRemaining < 2 ? 'warning' : 'normal',
        timeRemaining,
        contextMessage: 'Suggest a song for the community to cover!',
      };

    case 'covering':
      if (!userDetails.hasSignedUp) return null; // Not participating

      return {
        actionText: userDetails.hasSubmitted ? 'Update Submission' : 'Submit Cover',
        actionHref: '/submit',
        urgencyLevel: daysRemaining < 1 ? 'urgent' : daysRemaining < 3 ? 'warning' : 'normal',
        timeRemaining,
        contextMessage: 'Record and submit your cover!',
      };

    case 'voting':
      if (!userDetails.hasSignedUp) return null;

      return {
        actionText: userDetails.hasVoted ? 'Update Votes' : 'Cast Votes',
        actionHref: '/voting',
        urgencyLevel: daysRemaining < 1 ? 'urgent' : daysRemaining < 3 ? 'warning' : 'normal',
        timeRemaining,
        contextMessage: 'Vote on your favorite covers!',
      };

    case 'celebration':
      return {
        actionText: 'View Results',
        actionHref: `/round/${round.slug}`,
        contextMessage: '🎉 Round complete! Check out the winners.',
      };

    default:
      return null;
  }
}
```

## Best Practices

### ✅ Do
- Show ActionPanel only when there's an action to take
- Use appropriate urgency levels
- Keep action text concise (2-4 words)
- Show time remaining for deadlines
- Provide context about what the action does

### ❌ Don't
- Show multiple ActionPanels (only one primary action)
- Use urgent styling for everything (loses meaning)
- Hide important context
- Make action text too long
- Show ActionPanel when user can't take action

## Conditional Display

Sometimes you don't want to show the ActionPanel:

```tsx
// In your dashboard page
const actionData = shouldShowAction(phase, userDetails)
  ? getActionData(phase, userDetails, phaseCloses)
  : null;

// If actionData is null, ActionPanel won't render
```

Or conditionally include the panel in config:

```tsx
export function getDashboardConfig(showAction: boolean): DashboardConfig {
  const panels = [
    heroPanel,
    ...(showAction ? [actionPanel] : []),
    progressPanel,
  ];

  return { panels, layout: defaultLayout };
}
```

## Styling Customization

Add custom classes via panel config:

```tsx
createPanel(
  definePanelConfig('action', {
    name: 'Your Next Action',
    priority: 'primary',
    order: 2,
    className: 'my-custom-action-panel',
  }),
  ActionPanel
)
```

Then style in your CSS:

```css
.my-custom-action-panel {
  /* Custom styles */
}
```

## Mobile Considerations

The ActionPanel is mobile-responsive by default:
- Full width on mobile
- Text sizing adjusts (sm:text-lg)
- Time remaining stacks on small screens
- Button goes full width on mobile

For sticky behavior on mobile:

```css
@media (max-width: 768px) {
  .dashboard-panel[data-panel-id="action"] {
    position: sticky;
    top: 0;
    z-index: 10;
  }
}
```

## Testing Different States

```tsx
// Normal state
<ActionPanel data={{
  actionText: 'Submit Cover',
  actionHref: '/submit',
  urgencyLevel: 'normal',
  timeRemaining: '5 days',
}} />

// Warning state
<ActionPanel data={{
  actionText: 'Submit Cover',
  actionHref: '/submit',
  urgencyLevel: 'warning',
  timeRemaining: '2 days',
  contextMessage: 'Deadline approaching!',
}} />

// Urgent state
<ActionPanel data={{
  actionText: 'Submit Cover',
  actionHref: '/submit',
  urgencyLevel: 'urgent',
  timeRemaining: '6 hours',
  contextMessage: 'Last chance to submit!',
}} />
```

---

The ActionPanel creates a clear separation between "what you need to do" (ActionPanel) and "where you are" (CurrentRoundPanel), resulting in a much better user experience! 🎯
