# Audio Duration Storage

## Overview

Audio duration is stored in **milliseconds** as a `bigint` in the database for maximum precision. This is especially important for short audio clips where second-level rounding would lose significant precision.

## Database Schema

```sql
CREATE TABLE submissions (
  ...
  audio_duration bigint, -- Stored in milliseconds
  ...
);
```

**Storage Format:** Milliseconds (integer)
**JavaScript Input:** Seconds (decimal)
**Display Format:** Various (see utilities below)

## Why Milliseconds?

### Problem with Seconds (Previous Implementation)
```typescript
// OLD: Lost precision
audioDuration: 12.345 seconds
Math.round(12.345) = 12 seconds
// Lost 0.345 seconds (345ms of precision)!
```

### Solution with Milliseconds
```typescript
// NEW: Preserves precision
audioDuration: 12.345 seconds
Math.round(12.345 * 1000) = 12345 milliseconds
// Stored: 12345ms = 12.345 seconds exactly
```

## Usage Examples

### Storing Audio Duration

```typescript
import { secondsToMilliseconds } from '@eptss/data-access/utils';

// Input from audio file (in seconds)
const durationInSeconds = 12.345;

// Convert to milliseconds for database
const durationInMs = secondsToMilliseconds(durationInSeconds);
// Result: 12345

// Store in database
await db.insert(submissions).values({
  audioDuration: durationInMs, // 12345
  // ...
});
```

### Retrieving and Displaying Audio Duration

```typescript
import {
  millisecondsToSeconds,
  formatDuration,
  formatDurationShort
} from '@eptss/data-access/utils';

// From database (in milliseconds)
const audioDuration = 12345;

// Convert to seconds
const seconds = millisecondsToSeconds(audioDuration);
// Result: 12.345

// Format for display
const formatted = formatDuration(audioDuration);
// Result: "0:12"

const formattedWithMs = formatDuration(audioDuration, {
  includeMilliseconds: true
});
// Result: "0:12.345"

const shortFormat = formatDurationShort(audioDuration);
// Result: "12s"
```

## Utility Functions

### `secondsToMilliseconds(seconds: number): number`
Convert seconds to milliseconds (rounds to nearest integer).

```typescript
secondsToMilliseconds(12.345); // 12345
secondsToMilliseconds(0.5);    // 500
secondsToMilliseconds(60);     // 60000
```

### `millisecondsToSeconds(milliseconds: number): number`
Convert milliseconds back to seconds (decimal).

```typescript
millisecondsToSeconds(12345);  // 12.345
millisecondsToSeconds(500);    // 0.5
millisecondsToSeconds(60000);  // 60
```

### `formatDuration(milliseconds, options): string`
Format as time string (MM:SS or H:MM:SS).

```typescript
formatDuration(12345);                              // "0:12"
formatDuration(125000);                             // "2:05"
formatDuration(3725000);                            // "1:02:05"
formatDuration(12345, { includeMilliseconds: true }); // "0:12.345"
formatDuration(125000, { alwaysShowHours: true });   // "0:02:05"
```

### `formatDurationShort(milliseconds, options): string`
Format as short duration (e.g., "3m 45s").

```typescript
formatDurationShort(12345);                        // "12s"
formatDurationShort(125000);                       // "2m 5s"
formatDurationShort(3725000);                      // "1h 2m 5s"
formatDurationShort(125000, { includeSeconds: false }); // "2m"
```

### `parseDuration(timeString: string): number | null`
Parse time string to milliseconds.

```typescript
parseDuration("3:45");       // 225000 (3 minutes, 45 seconds)
parseDuration("1:23:45");    // 5025000 (1 hour, 23 minutes, 45 seconds)
parseDuration("3m 45s");     // 225000
parseDuration("1h 23m 45s"); // 5025000
parseDuration("invalid");    // null
```

### `isValidDuration(milliseconds, options): boolean`
Validate duration value.

```typescript
isValidDuration(12345);                    // true
isValidDuration(null);                     // false
isValidDuration(-100);                     // false
isValidDuration(12345, { minMs: 1000 });   // true (>= 1 second)
isValidDuration(500, { minMs: 1000 });     // false (< 1 second)
isValidDuration(12345, { maxMs: 10000 });  // false (> 10 seconds)
```

## Migration Notes

### Converting Existing Data

The migration automatically converted existing data:

```sql
-- Old: integer (seconds)
audio_duration = 12

-- Migration: Multiply by 1000
UPDATE submissions
SET audio_duration = audio_duration * 1000;

-- New: bigint (milliseconds)
audio_duration = 12000
```

### Backward Compatibility

If you have code that expects seconds:

```typescript
// Old code (expecting seconds)
const durationInSeconds = submission.audioDuration; // This was 12

// New code (convert from milliseconds)
import { millisecondsToSeconds } from '@eptss/data-access/utils';
const durationInSeconds = millisecondsToSeconds(submission.audioDuration); // 12.345
```

## Best Practices

### ✅ DO

- Store in milliseconds in the database
- Use utility functions for conversion
- Validate duration before storing
- Round to nearest millisecond when converting from seconds

### ❌ DON'T

- Store as decimal/float in database (precision issues)
- Store in seconds (loses precision)
- Hardcode conversion factors (use utilities)
- Display raw milliseconds to users (format first)

## Examples in Codebase

### Submission Service
`packages/data-access/src/services/submissionService.ts:125, 246`

```typescript
// Store audio duration in milliseconds for precision (input is in seconds)
// Uses the secondsToMilliseconds() utility from utils/audioDuration.ts
audioDuration: audioDuration ? secondsToMilliseconds(audioDuration) : null,
```

### Upload Tracking
`packages/data-access/src/services/uploadTrackingService.ts`

```typescript
metadata: {
  roundId: validData.roundId,
  audioDuration: validData.audioDuration, // Stored as-is in metadata
  audioFileSize: validData.audioFileSize,
}
```

## Testing

### Test Duration Conversion

```typescript
import {
  secondsToMilliseconds,
  millisecondsToSeconds,
  formatDuration
} from '@eptss/data-access/utils';

// Test round-trip conversion
const original = 12.345;
const ms = secondsToMilliseconds(original);
const back = millisecondsToSeconds(ms);
console.log(original === back); // true

// Test precision preservation
console.log(secondsToMilliseconds(0.001)); // 1 (1ms)
console.log(secondsToMilliseconds(0.1));   // 100 (100ms)
console.log(secondsToMilliseconds(1.5));   // 1500 (1.5s)

// Test formatting
console.log(formatDuration(1500)); // "0:01" (1.5 seconds)
console.log(formatDuration(90000)); // "1:30" (1.5 minutes)
```

## Performance Considerations

- **Storage:** bigint uses 8 bytes vs integer's 4 bytes (negligible impact)
- **Precision:** Can store up to 292 million years in milliseconds
- **Arithmetic:** Millisecond arithmetic is same performance as seconds
- **Display:** Formatting functions are O(1) - very fast

## Related Files

- Schema: `packages/data-access/src/db/schema.ts:90`
- Migration: `packages/data-access/src/db/migrations/0053_dear_doctor_spectrum.sql`
- Utilities: `packages/data-access/src/utils/audioDuration.ts`
- Submission Service: `packages/data-access/src/services/submissionService.ts:122, 236`
- Tracking Service: `packages/data-access/src/services/uploadTrackingService.ts:188-192`
