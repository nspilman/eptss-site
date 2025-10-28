# PhaseStatusPanel - Deadline Banner

## What Was Added

A new **PhaseStatusPanel** that displays the current phase and deadline in a prominent banner, separate from the action CTA.

## Why?

**Problem**: The deadline was embedded in the ActionPanel (CTA), coupling critical time information with a specific action.

**Solution**: Extract deadline into its own panel so it's:
- ✅ Always visible at the top
- ✅ Not tied to any specific action
- ✅ Shows urgency with color coding
- ✅ Provides phase context

## Layout

```
┌─────────────────────────────────────┐
│  Round 12: Wonderwall               │ ← Hero (order: 1)
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  ⏰ Covering Phase                  │ ← NEW: PhaseStatusPanel (order: 2)
│  3 days, 5 hours remaining          │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  My Reflections                     │ ← Reflections (order: 3)
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Your Progress                      │ ← Progress (order: 4)
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  🎯 Your Next Action                │ ← ActionPanel (order: 5)
│  [Submit Your Cover →]              │
└─────────────────────────────────────┘
```

## Features

### Urgency Color Coding

- **Normal** (gray): > 3 days remaining
- **Warning** (yellow): < 3 days remaining
- **Urgent** (red): < 24 hours remaining

### Phase-Specific Messages

- **Signups**: "Suggest a song and sign up to participate"
- **Covering**: "Record and submit your cover"
- **Voting**: "Listen and vote on your favorite covers"
- **Celebration**: "Round complete! Check out the results"

### Visual Elements

- Emoji icon changes based on urgency (⏰ → ⚠️ → 🚨)
- Time remaining in large, bold text
- Border color matches urgency level
- Background tint for urgent/warning states

## Files Created/Modified

### New Files
- `packages/dashboard/src/panels/PhaseStatusPanel.tsx` - New panel component
- `apps/web/app/dashboard/PHASE-STATUS-PANEL.md` - This documentation

### Modified Files
- `packages/dashboard/src/panels/index.ts` - Export PhaseStatusPanel
- `apps/web/app/dashboard/dashboard-config.ts` - Add PhaseStatusPanel to config
- `apps/web/app/dashboard/data-fetchers.ts` - Add fetchPhaseStatusData()
- `apps/web/app/dashboard/page.tsx` - Fetch and pass phase status data
- `packages/dashboard/src/panels/ActionPanel.tsx` - Remove time remaining (now in PhaseStatusPanel)

## Data Structure

```typescript
interface PhaseStatusData {
  phase: 'signups' | 'covering' | 'voting' | 'celebration';
  timeRemaining?: string;  // e.g., "3 days, 5 hours"
  urgencyLevel?: 'normal' | 'warning' | 'urgent';
  message?: string;  // Phase-specific context
}
```

## Benefits

1. **Decoupled Information**: Deadline is separate from actions
2. **Always Visible**: Positioned at top, hard to miss
3. **Clear Urgency**: Color coding makes deadlines obvious
4. **Cleaner CTAs**: ActionPanel focuses purely on the action
5. **Better UX**: Users see deadline immediately when landing on page

## Example States

### Normal (Signups, 10 days left)
```
⏰ Song Selection & Signups
   Suggest a song and sign up to participate
   
   Time Remaining: 10 days, 3 hours
```

### Warning (Covering, 2 days left)
```
⚠️ Covering Phase
   Record and submit your cover
   
   Time Remaining: 2 days, 8 hours
   Less than 3 days left
```

### Urgent (Voting, 8 hours left)
```
🚨 Voting Phase
   Listen and vote on your favorite covers
   
   Time Remaining: 8 hours
   Deadline approaching!
```

## Future Enhancements

Potential additions:
- Progress bar showing time elapsed
- Countdown timer that updates
- Phase transition notifications
- Mobile-optimized sticky header
