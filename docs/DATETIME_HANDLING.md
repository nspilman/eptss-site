# DateTime Handling Guide

This document explains how to properly handle dates and times in this codebase to avoid timezone-related bugs.

## The Problem

When servers run in different timezones, date parsing can produce inconsistent results:

```typescript
// BAD: Ambiguous date string
const dateStr = "Jan 31, 2025";
const date = new Date(dateStr);
// On Vercel (UTC): midnight UTC
// On local dev (EST): midnight EST = 5am UTC
// Result: Different countdown values!
```

## The Solution: Raw Until Display

**Store dates as ISO strings, format only at display time.**

```
Database → ISO String → Data Layer → ISO String → Client → Format for Display
```

### ISO Strings Are Unambiguous

```typescript
// GOOD: ISO string specifies exact UTC moment
const isoStr = "2025-01-31T23:59:59.000Z";
new Date(isoStr).getTime(); // Same milliseconds everywhere
```

## Guidelines

### 1. Data Layer: Always Use ISO Strings

When passing dates through the data layer (providers, fetchers, props), use ISO strings:

```typescript
// In roundProvider.ts
const dateLabels = {
  signups: {
    opens: dates.signupOpens.toISOString(),
    closes: dates.votingOpens.toISOString(),
  },
  // ...
};
```

### 2. Calculations: Use Timestamps

For countdown calculations, date comparisons, etc., use `.getTime()` which returns timezone-agnostic milliseconds:

```typescript
// GOOD: Timezone-agnostic math
const now = new Date();
const closes = new Date(isoString);
const diff = closes.getTime() - now.getTime();
const daysRemaining = Math.floor(diff / (1000 * 60 * 60 * 24));
```

### 3. Display: Format on the Client

Format dates in client components (`"use client"`) where they'll use the user's timezone:

```typescript
// In a client component
const formattedDate = new Date(isoString).toLocaleDateString('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});
```

### 4. Use the formatDate Utilities

The codebase has timezone-aware formatting utilities in `@eptss/rounds/services`:

```typescript
import { formatDate } from '@eptss/rounds/services';

// These handle UTC → local timezone conversion
formatDate.compact(isoString);  // "Jan 31, 2025"
formatDate.full(isoString);     // "Jan 31, 2025 at 11:59 PM"
formatDate.time(isoString);     // "11:59 PM"
```

## Common Patterns

### Server Component → Client Component

```typescript
// Server component: pass ISO string
async function Page() {
  const data = await fetchData();
  return <ClientComponent deadline={data.deadline} />; // ISO string
}

// Client component: format for display
"use client";
function ClientComponent({ deadline }: { deadline: string }) {
  return <span>{new Date(deadline).toLocaleDateString()}</span>;
}
```

### Countdown Timers

```typescript
// Calculate on server (works consistently with ISO strings)
function formatTimeRemaining(isoString: string): string {
  const now = new Date();
  const target = new Date(isoString);
  const diff = target.getTime() - now.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return `${days} days, ${hours} hours`;
}
```

### Database Storage

Dates in the database should be stored as UTC timestamps. When reading:

```typescript
// Database returns Date objects or ISO strings
const round = await db.query.rounds.findFirst();
const signupOpens = round.signupOpens; // Date object

// Convert to ISO for the data layer
const isoString = signupOpens.toISOString();
```

## What NOT To Do

### Don't Format Then Re-parse

```typescript
// BAD: Loses timezone information
const formatted = date.toLocaleDateString(); // "Jan 31, 2025"
const reparsed = new Date(formatted); // Ambiguous!
```

### Don't Use Locale-Specific Formats in Data Layer

```typescript
// BAD: Different servers may parse differently
const dateLabel = date.toLocaleDateString('en-US', { ... });

// GOOD: ISO is universal
const dateLabel = date.toISOString();
```

### Don't Assume Server Timezone

```typescript
// BAD: Assumes server is in a specific timezone
const midnight = new Date("2025-01-31"); // Midnight WHERE?

// GOOD: Explicit UTC
const midnight = new Date("2025-01-31T00:00:00.000Z");
```

## Testing

When writing tests or mocks, use ISO strings:

```typescript
// In playwright mocks
const dateLabels = {
  signups: {
    opens: signupOpens.toISOString(),
    closes: votingOpens.toISOString(),
  },
};
```

## Summary

| Layer | Format | Example |
|-------|--------|---------|
| Database | UTC timestamp | `2025-01-31 23:59:59+00` |
| Data/Props | ISO string | `"2025-01-31T23:59:59.000Z"` |
| Calculations | Milliseconds | `date.getTime()` |
| Display | Localized string | `"Fri, Jan 31, 2025"` |

**Remember: ISO strings are your friend. Format late, not early.**
