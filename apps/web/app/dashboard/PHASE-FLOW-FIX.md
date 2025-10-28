# Phase Flow Fix

## Corrected Phase Order

The phase progression has been fixed to match the actual EPTSS flow:

### Before (Incorrect)
```
1. Signups
2. Covering  ❌
3. Voting    ❌
4. Celebration
```

### After (Correct)
```
1. Signups → Sign up and suggest songs
2. Voting → Vote on which song to cover
3. Covering → Record and submit covers
4. Celebration (Listening Party) → Event to celebrate
```

## What Changed

### 1. CurrentRoundPanel
**File**: `packages/dashboard/src/panels/CurrentRoundPanel.tsx`

- Reordered phase indicators: Signups → Voting → Covering → Celebration
- Updated labels:
  - "Vote on Song Selection" (clarifies it's voting on songs, not covers)
  - "Listening Party" (instead of "Round Celebration")
- Reordered phase info sections to match flow
- Updated voting phase text to clarify it's about song selection

### 2. PhaseStatusPanel
**File**: `packages/dashboard/src/panels/PhaseStatusPanel.tsx`

- Updated phase display names
- Changed "Round Celebration" → "Listening Party"
- Updated phase messages to match correct flow

### 3. Data Fetchers
**File**: `apps/web/app/dashboard/data-fetchers.ts`

- Reordered switch cases to match flow
- Updated phase messages:
  - Voting: "Vote on which song should be covered this round"
  - Covering: "Record and submit your cover of the selected song"
  - Celebration: "Join us for the listening party event!"
- Updated ActionPanel data:
  - Voting action: "Vote on which song suggestions should be covered"
  - Celebration action: "View Listening Party Details"

## Phase Details

### Phase 1: Signups
- Users sign up for the round
- Users suggest songs they'd like to cover
- **Completion**: User has signed up

### Phase 2: Voting
- Users vote on which song suggestions should be covered
- The winning song becomes the round's song
- **Completion**: User has voted on songs

### Phase 3: Covering
- Users record and submit their covers of the selected song
- **Completion**: User has submitted their cover

### Phase 4: Celebration (Listening Party)
- Community event to listen to all covers
- Celebrate the round together
- **Completion**: Round is complete

## UI Updates

### Progress Indicators
```
✓ Sign Up & Suggest Songs
✓ Vote on Song Selection
○ Submit Your Cover  ← You are here
○ Listening Party
```

### Phase Status Banner
Shows current phase with appropriate messaging:
- **Signups**: "Suggest a song and sign up to participate"
- **Voting**: "Vote on which song should be covered this round"
- **Covering**: "Record and submit your cover of the selected song"
- **Celebration**: "Join us for the listening party event!"

### Action Panel
CTAs match the phase:
- **Signups**: "Sign Up for Round"
- **Voting**: "Cast Your Votes" (for song selection)
- **Covering**: "Submit Your Cover"
- **Celebration**: "View Listening Party Details"

## Testing Checklist

- [ ] Signups phase shows correct order and messaging
- [ ] Voting phase clarifies it's for song selection, not covers
- [ ] Covering phase comes after voting
- [ ] Celebration phase is labeled "Listening Party"
- [ ] Progress indicators show correct completion status
- [ ] Phase status banner shows correct phase name
- [ ] Action panel shows correct CTA for each phase

## Related Files

All files that reference phase order or names:
- `packages/dashboard/src/panels/CurrentRoundPanel.tsx`
- `packages/dashboard/src/panels/PhaseStatusPanel.tsx`
- `apps/web/app/dashboard/data-fetchers.ts`
