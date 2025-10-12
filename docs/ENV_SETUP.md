# Environment Variables Setup for Cron Jobs

## Required Environment Variables

### CRON_SECRET
A secret token used to authenticate cron job requests to your API endpoints.

**Generate a secure token:**
```bash
openssl rand -hex 32
```

**Where to add:**
1. **GitHub Secrets** (for GitHub Actions):
   - Go to your repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `CRON_SECRET`
   - Value: [your generated token]

2. **Deployment Environment** (Vercel/etc.):
   - Add `CRON_SECRET` to your environment variables
   - Use the same value as in GitHub Secrets

### APP_URL
Your production application URL.

**Where to add:**
1. **GitHub Secrets**:
   - Name: `APP_URL`
   - Value: `https://your-domain.com` (no trailing slash)

## Testing Locally

### Method 1: Test Script (Recommended)

1. Add `CRON_SECRET` to your `.env.local`:
   ```
   CRON_SECRET=your-test-secret-here
   ```

2. Start your dev server:
   ```bash
   bun dev
   ```

3. Run the test script:
   ```bash
   bun run scripts/test-assign-round-song.ts
   ```

### Method 2: Admin Panel Button

1. Ensure `NEXT_PUBLIC_CRON_SECRET` is set in your `.env.local`
2. Navigate to `/admin` in your browser
3. Go to the "Actions" tab
4. Click "Test Assign Round Song" in the "Automation Testing" section

### Method 3: Manual curl

```bash
curl -X POST http://localhost:3000/api/cron/assign-round-song \
  -H "Authorization: Bearer your-test-secret-here" \
  -H "Content-Type: application/json"
```

### Expected Responses

**No current round:**
```json
{
  "success": true,
  "message": "No current round found",
  "action": "none"
}
```

**Not in covering phase yet:**
```json
{
  "success": true,
  "message": "Round {slug} has not reached covering phase yet",
  "action": "none",
  "roundPhase": {
    "coveringBegins": "2025-10-15T00:00:00.000Z",
    "now": "2025-10-10T00:00:00.000Z"
  }
}
```

**Song already assigned:**
```json
{
  "success": true,
  "message": "Round {slug} already has song assigned",
  "action": "none",
  "assignedSong": {
    "title": "Song Title",
    "artist": "Artist Name"
  }
}
```

**Song successfully assigned:**
```json
{
  "success": true,
  "message": "Successfully assigned song to round {slug}",
  "action": "assigned",
  "assignedSong": {
    "title": "Song Title",
    "artist": "Artist Name",
    "average": 4.5,
    "votesCount": 10,
    "oneStarCount": 1
  }
}
```

## Cron Jobs

### assign-round-song
- **Schedule**: Every 2 hours
- **Purpose**: Automatically assigns the winning song to a round when voting closes
- **Workflow**: `.github/workflows/assign-round-song.yml`

### create-future-rounds
- **Schedule**: Daily at 9:00 AM UTC (1:00 AM PST)
- **Purpose**: Ensures there are always 2 future quarterly rounds created
- **Workflow**: `.github/workflows/create-future-rounds.yml`
- **Details**: 
  - Rounds are quarterly (Jan 1, Apr 1, Jul 1, Oct 1)
  - Named with format: YYYY-MM-DD (e.g., 2025-10-01)
  - Created without songs assigned
  - Voting opens 2 weeks after quarter starts
  - Voting lasts 1 week
  - Covers due & listening party 2 weeks after quarter ends

### send-reminder-emails
- **Schedule**: Daily at 10:00 AM UTC (2:00 AM PST)
- **Purpose**: Sends reminder emails to participants throughout the round
- **Workflow**: `.github/workflows/send-reminder-emails.yml`
- **Email Types**:
  1. **Voting closes tomorrow** - Sent 24-48 hours before voting closes (to signed-up users)
  2. **Covering halfway** - Sent at midpoint of covering period (to all participants)
  3. **One month left** - Sent ~30 days before covers due (to all participants)
  4. **Last week** - Sent ~7 days before covers due (to all participants)
  5. **Covers due tomorrow** - Sent 24-48 hours before deadline (to all participants)
- **Deduplication**: Tracks sent emails in database to prevent duplicates
- **Database**: Requires migration `0018_create_email_reminders_sent.sql`
