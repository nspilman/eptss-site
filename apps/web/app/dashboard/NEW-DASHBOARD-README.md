# New Dashboard System - Integration Guide

## 🎉 What's New

The dashboard now uses the **modular @eptss/dashboard package** with the ActionPanel separated from CurrentRoundPanel for better UX!

## 📁 Files Created

### 1. Dashboard Configuration
**File**: `apps/web/app/dashboard/dashboard-config.ts`

This is your dashboard configuration. It defines which panels to show and in what order:

```tsx
import { eptssDeboardConfig } from './dashboard-config';

// Panels are ordered:
// 1. Hero (order: 1)
// 2. ActionPanel (order: 2) ← NEW! Primary CTA
// 3. CurrentRoundPanel (order: 3) ← Status only now
// 4. ReflectionPanel (order: 1, tertiary)
```

### 2. Test Page
**File**: `apps/web/app/dashboard/test-new-dashboard/page.tsx`

A test page with mock data to see the new dashboard in action.

**Visit**: http://localhost:3000/dashboard/test-new-dashboard

## 🚀 Quick Start

### Step 1: Run the dev server

```bash
bun run dev
```

### Step 2: Visit the test page

Navigate to: http://localhost:3000/dashboard/test-new-dashboard

You'll see:
```
┌─────────────────────────────────────┐
│  Hero: Round 12 - "Wonderwall"      │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  🎯 YOUR NEXT ACTION                │  ← NEW!
│  ⏰ 3 days, 5 hours remaining       │
│  [Submit Your Cover →]              │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Your Progress                      │  ← Cleaner!
│  ✓ Signed Up                        │
│  ○ Submit Cover  ← You are here     │
└─────────────────────────────────────┘
```

## 🔄 Integrating with Your Real Dashboard

### Current Dashboard (Old)
**File**: `apps/web/app/dashboard/page.tsx`

This still uses the old components. **Don't delete it yet!**

### New Dashboard Approach

When you're ready to migrate, here's how:

#### Step 1: Fetch your data

```tsx
// apps/web/app/dashboard/page.tsx
import { Dashboard } from '@eptss/dashboard';
import { eptssDeboardConfig } from './dashboard-config';
import {
  getCurrentRound,
  getUserRoundDetails,
  getReflections
} from '@eptss/data-access';
import type { ActionPanelData, CurrentRoundData } from '@eptss/dashboard/panels';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const round = await getCurrentRound();
  const userDetails = await getUserRoundDetails(user.id, round.id);
  const reflections = await getReflections(user.id, round.id);

  // ... build data objects (see Step 2)
}
```

#### Step 2: Build panel data

```tsx
// Determine action based on phase
const actionData: ActionPanelData | null = (() => {
  const timeRemaining = formatTimeRemaining(round.phaseCloses);
  const daysRemaining = getDaysRemaining(round.phaseCloses);

  switch (round.phase) {
    case 'signups':
      return {
        actionText: userDetails.hasSignedUp ? 'Update Song Suggestion' : 'Sign Up',
        actionHref: userDetails.hasSignedUp ? '/sign-up?update=true' : '/sign-up',
        urgencyLevel: daysRemaining < 2 ? 'warning' : 'normal',
        timeRemaining,
        contextMessage: 'Suggest a song for everyone to cover!',
      };

    case 'covering':
      if (!userDetails.hasSignedUp) return null;

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
})();

// Progress panel data
const progressData: CurrentRoundData = {
  roundId: round.id,
  phase: round.phase,
  hasSignedUp: userDetails.hasSignedUp,
  hasSubmitted: userDetails.hasSubmitted,
  hasVoted: userDetails.hasVoted,
  currentSignups: round.signups?.length,
  userSongSuggestion: userDetails.hasSignedUp ? {
    title: userDetails.songTitle,
    artist: userDetails.songArtist,
  } : undefined,
  userVotes: userDetails.hasVoted ? userDetails.votes : undefined,
};

// Hero data
const heroData = {
  roundId: round.id,
  songTitle: round.song?.title,
  songArtist: round.song?.artist,
};

// Reflection data
const reflectionData = {
  roundSlug: round.slug,
  reflections: reflections,
};
```

#### Step 3: Render the dashboard

```tsx
return (
  <Dashboard
    config={eptssDeboardConfig}
    user={user ? { id: user.id, role: user.role } : undefined}
    panelData={{
      hero: heroData,
      action: actionData,
      'current-round': progressData,
      reflections: reflectionData,
    }}
  />
);
```

## 🎨 Urgency Levels

The ActionPanel supports 3 urgency levels:

### `normal` (green/blue)
- Plenty of time (> 7 days)
- Gray border
- Blue time display

### `warning` (yellow)
- Deadline approaching (< 7 days)
- Yellow border
- "Deadline approaching" indicator

### `urgent` (red)
- Urgent action needed (< 24 hours)
- Red border
- "Action needed urgently!" indicator

## 📝 Helper Functions You'll Need

```tsx
// Format time remaining
function formatTimeRemaining(closesAt: string): string {
  const now = new Date();
  const closes = new Date(closesAt);
  const diff = closes.getTime() - now.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'}, ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
}

// Get days remaining (for urgency calculation)
function getDaysRemaining(closesAt: string): number {
  const now = new Date();
  const closes = new Date(closesAt);
  const diff = closes.getTime() - now.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
```

## 🔍 Testing Different States

Edit `test-new-dashboard/page.tsx` to test different scenarios:

### Test Signup Phase
```tsx
const mockActionData: ActionPanelData = {
  actionText: 'Sign Up for Round 12',
  actionHref: '/sign-up',
  urgencyLevel: 'normal',
  timeRemaining: '10 days',
  contextMessage: 'Join the current round!',
};

const mockProgressData: CurrentRoundData = {
  phase: 'signups',
  hasSignedUp: false,
  hasSubmitted: false,
  hasVoted: false,
};
```

### Test Urgent State
```tsx
const mockActionData: ActionPanelData = {
  actionText: 'Submit Your Cover',
  actionHref: '/submit',
  urgencyLevel: 'urgent', // RED styling!
  timeRemaining: '8 hours',
  contextMessage: 'Last chance to submit!',
};
```

### Test Warning State
```tsx
const mockActionData: ActionPanelData = {
  actionText: 'Cast Your Votes',
  actionHref: '/voting',
  urgencyLevel: 'warning', // YELLOW styling!
  timeRemaining: '2 days, 3 hours',
  contextMessage: 'Voting deadline approaching!',
};
```

## 📚 Documentation

For complete documentation, see:
- `packages/dashboard/README.md` - Full package docs
- `packages/dashboard/ACTION-PANEL-GUIDE.md` - ActionPanel guide
- `packages/dashboard/QUICKSTART.md` - Quick start
- `packages/dashboard/IMPLEMENTATION-EXAMPLE.md` - Implementation examples

## ✅ Benefits

### Before
```tsx
<CurrentRoundCard>
  {/* Status info */}
  {/* More info */}
  {/* Even more info */}

  {/* CTA buried at bottom ❌ */}
  <Button>Submit Cover</Button>
</CurrentRoundCard>
```

### After
```tsx
<ActionPanel>  ← Prominent CTA ✅
  <Button>Submit Cover</Button>
</ActionPanel>

<CurrentRoundPanel>  ← Clean status ✅
  {/* Just shows progress */}
</CurrentRoundPanel>
```

## 🎯 Next Steps

1. **Test the new dashboard**: Visit `/dashboard/test-new-dashboard`
2. **Adjust mock data**: Play with different urgency levels
3. **When ready**: Integrate with your real data
4. **Gradually migrate**: Replace old dashboard when confident

---

**The ActionPanel makes CTAs impossible to miss!** 🎉
