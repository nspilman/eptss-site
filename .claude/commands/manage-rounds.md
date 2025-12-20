# Manage Rounds

This skill provides guidance on querying and updating round information for EPTSS projects.

## API Endpoints

### List Rounds for a Project

**GET** `/api/admin/rounds?projectSlug=PROJECT_SLUG`

Lists all rounds for a specific project with their dates.

**Example:**
```bash
curl -s "http://localhost:3000/api/admin/rounds?projectSlug=monthly-original" | jq '.'
```

**Response:**
```json
{
  "success": true,
  "projectSlug": "monthly-original",
  "projectId": "uuid-here",
  "count": 1,
  "rounds": [
    {
      "id": 32,
      "slug": "2026-01-01",
      "signupOpens": "2025-12-01T00:00:00.000Z",
      "votingOpens": "2026-01-01T23:59:59.000Z",
      "coveringBegins": "2026-01-02T00:00:00.000Z",
      "coversDue": "2026-01-31T23:59:59.000Z",
      "listeningParty": "2026-02-01T00:00:00.000Z"
    }
  ]
}
```

### Update Round Dates

**PATCH** `/api/admin/rounds/[roundId]`

Updates specific date fields for a round.

**Example:**
```bash
curl -X PATCH "http://localhost:3000/api/admin/rounds/32" \
  -H "Content-Type: application/json" \
  -d '{
    "votingOpens": "2026-01-01T23:59:59.000Z",
    "coversDue": "2026-01-31T23:59:59.000Z"
  }'
```

**Available Fields:**
- `signupOpens` - When signups open for the round
- `votingOpens` - When voting/prompt drop happens
- `coveringBegins` - When participants can start working
- `coversDue` - Deadline for submissions
- `listeningParty` - When the listening party occurs

## Critical Timezone Information

### Important Date Calculation

The signup close date is calculated as:
```typescript
signups.closes = subDays(votingOpens, 1)
```

This means the signup phase ends **1 day before** `votingOpens`.

### Timezone Best Practices

**ALWAYS use end-of-day times (23:59:59) for phase boundaries** to avoid timezone conversion issues.

**Why?**
- Dates are stored in UTC but displayed in user's local timezone
- If you set `votingOpens` to `2026-01-01T06:00:00.000Z`:
  - In PST (UTC-8), this becomes `2025-12-31T22:00:00 PST`
  - Subtracting 1 day gives `2025-12-30T22:00:00 PST`
  - User sees "Dec 30" instead of expected "Dec 31"

**Correct approach:**
```json
{
  "votingOpens": "2026-01-01T23:59:59.000Z"
}
```

This ensures that even after timezone conversion and date math, users see the expected calendar date.

## Common Tasks

### Find a Round by Slug

1. List all rounds for the project:
```bash
curl -s "http://localhost:3000/api/admin/rounds?projectSlug=monthly-original" | jq '.rounds[] | select(.slug == "2026-01-01")'
```

2. Note the `id` field from the response
3. Use that ID to update the round

### Fix "Signups close Dec 31, 1969" Error

This occurs when `votingOpens` is NULL. Fix by setting a valid date:

```bash
curl -X PATCH "http://localhost:3000/api/admin/rounds/ROUND_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "votingOpens": "2026-01-01T23:59:59.000Z"
  }'
```

### Set Up a New Round

```bash
curl -X PATCH "http://localhost:3000/api/admin/rounds/ROUND_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "signupOpens": "2025-12-01T00:00:00.000Z",
    "votingOpens": "2026-01-01T23:59:59.000Z",
    "coveringBegins": "2026-01-02T00:00:00.000Z",
    "coversDue": "2026-01-31T23:59:59.000Z",
    "listeningParty": "2026-02-01T00:00:00.000Z"
  }'
```

## Project Scoping

**CRITICAL:** Always include `projectSlug` when querying rounds. Round slugs can overlap between projects (e.g., both "covers" and "monthly-original" could have a "2026-01-01" round).

## Related Files

- `/apps/web/app/api/admin/rounds/route.ts` - List rounds endpoint
- `/apps/web/app/api/admin/rounds/[roundId]/route.ts` - Update round endpoint
- `/packages/data-access/src/services/dateService.ts` - Date calculation logic
- `/packages/data-access/src/db/schema.ts` - `roundMetadata` table schema

## Related Skills

- `update-landing-page.md` - For updating project configuration and content
