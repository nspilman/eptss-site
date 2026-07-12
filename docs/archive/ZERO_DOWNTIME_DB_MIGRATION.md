# Zero-Downtime Database Migration Plan

**Strategy:** Create new tables alongside existing ones, dual-write to both, migrate data, switch reads, then clean up.

**Key Principle:** At no point will the application be down or users experience errors.

---

## Overview

### Current State
You have existing tables for rounds, signups, submissions, and votes. All assume a single "Cover Project."

### End State
You'll have new tables that include a `project_id` column, allowing multiple projects (Cover + Original Songs) to coexist.

### Strategy Summary
1. Create new tables (app ignores them)
2. Write to BOTH old and new tables simultaneously (dual-write)
3. Copy historical data from old to new tables
4. Switch app to read from new tables (still writing to both)
5. Stop writing to old tables
6. Archive old tables for safety

---

## Phase 1: Create New Tables (1 Day)

**What You're Doing:**
Creating brand new database tables that mirror your existing structure but include project scoping.

### New Tables to Create

**1. `projects` table**
- Stores project definitions (Cover Project, Original Songs Project)
- Contains project configuration as JSON (which phases are enabled, terminology, etc.)
- Seed with the Cover Project using a fixed UUID so you can reference it everywhere

**2. `project_rounds` table**
- Same structure as current `round_metadata` table
- Adds `project_id` foreign key to projects table
- Changes unique constraint: slug is unique per project (not globally)
- This means both Cover and Originals can have a round called "2025-01"

**3. `project_sign_ups` table**
- Same structure as current `sign_ups` table
- Adds `project_id` foreign key
- Unique constraint: one signup per user per round per project

**4. `project_submissions` table**
- Same structure as current `submissions` table
- Adds `project_id` foreign key
- Unique constraint: one submission per user per round per project

**5. `project_votes` table**
- Same structure as current `song_selection_votes` table
- Adds `project_id` foreign key

**6. `project_email_reminders` table**
- Same structure as current `email_reminders_sent` table
- Adds `project_id` foreign key

### Important Notes
- Create indexes on `project_id` for all new tables
- Create composite indexes on common query patterns like `(project_id, round_id)`
- Set up Row Level Security policies for Supabase
- Keep unique constraint on `(project_id, slug)` for rounds (not just slug)

### Database Changes
- Run Drizzle migration to create these tables
- Seed the Cover Project record
- Verify tables exist in database

### What Happens After Deploy
- Nothing! The app doesn't know about these tables yet
- Zero risk to production
- Users experience no changes

**Verification:**
- Connect to database and confirm all new tables exist
- Confirm Cover Project record exists in `projects` table
- Check that indexes were created properly

---

## Phase 2: Implement Dual-Write (3-5 Days)

**What You're Doing:**
Update your code so that every time you write data (create round, signup, submit, vote), you write to BOTH the old table AND the new table in a single transaction.

### Code Changes Needed

**1. Create Project Service**
- Function to get project by slug
- Function to get Cover Project (hardcoded ID)
- Export the Cover Project UUID as a constant

**2. Update Round Service**
- When creating a round: insert into BOTH `round_metadata` AND `project_rounds`
- Use database transaction so both succeed or both fail
- Default to Cover Project ID for now
- Still return data from old table (app still reads from old tables)

**3. Update Signup Service**
- When user signs up: insert into BOTH `sign_ups` AND `project_sign_ups`
- Use transaction for atomicity
- Include Cover Project ID in new table insert

**4. Update Submission Service**
- When user submits: insert into BOTH `submissions` AND `project_submissions`
- Use transaction
- Include Cover Project ID

**5. Update Votes Service**
- When user votes: insert into BOTH `song_selection_votes` AND `project_votes`
- Use transaction
- Include Cover Project ID

**6. Update Email Reminder Service**
- When sending reminders: record in BOTH `email_reminders_sent` AND `project_email_reminders`
- Use transaction
- Include Cover Project ID

### Transaction Pattern
Every write operation wraps both inserts in a database transaction:
- Start transaction
- Insert into old table
- Insert into new table
- Commit transaction
- If either fails, both rollback

### What Happens After Deploy
- New signups, submissions, votes go to both old and new tables
- App still reads from old tables (no user-facing changes)
- Both tables stay in perfect sync going forward
- If something breaks, rollback the code deploy - old tables still have all data

### Testing Before Deploy
- Test locally with a test round
- Create signup, verify it appears in both tables
- Create submission, verify it appears in both tables
- Create vote, verify it appears in both tables

**Verification:**
- Create a test signup in production
- Query both `sign_ups` and `project_sign_ups` - should have matching record
- Same for submissions and votes
- Monitor error rates - should not increase

---

## Phase 3: Backfill Historical Data (1 Day)

**What You're Doing:**
Copy all existing data from old tables into new tables, adding the Cover Project ID to everything.

### Backfill Steps

**1. Create temporary ID mapping table**
- Maps old round IDs to new round IDs (needed because auto-increment IDs will differ)

**2. Copy `round_metadata` to `project_rounds`**
- Insert all existing rounds
- Add Cover Project ID to each
- Use ON CONFLICT DO NOTHING in case some already exist from dual-write

**3. Copy `sign_ups` to `project_sign_ups`**
- Use ID mapping to match correct round
- Add Cover Project ID to each
- Handle conflicts gracefully

**4. Copy `submissions` to `project_submissions`**
- Use ID mapping
- Add Cover Project ID
- Handle conflicts

**5. Copy `song_selection_votes` to `project_votes`**
- Use ID mapping
- Add Cover Project ID

**6. Copy `email_reminders_sent` to `project_email_reminders`**
- Use ID mapping
- Add Cover Project ID
- Handle conflicts

### When to Run
- During low-traffic period (late night/early morning)
- Can run while app is live (dual-write ensures no data loss)
- If backfill fails, no impact on users (app still using old tables)

### Verification Queries
After backfill, run these checks:
- Count rounds in old table vs new table (should match)
- Count signups in old table vs new table (should match)
- Count submissions in old table vs new table (should match)
- Count votes in old table vs new table (should match)
- Pick random round, compare all related data between old and new tables

### What Happens After
- New tables now have complete historical data
- Dual-write continues for new data
- App still reads from old tables
- Both tables are now identical

**If Backfill Fails:**
- Fix the issue
- Truncate new tables
- Run backfill again
- No user impact because app still uses old tables

---

## Phase 4: Switch Reads to New Tables (2-3 Days)

**What You're Doing:**
Change your code to read data from the new tables instead of old tables. Writing still happens to both tables.

### Code Changes

**1. Update Round Service Queries**
- Change `getCurrentRound()` to query `project_rounds` instead of `round_metadata`
- Add `project_id` parameter (default to Cover Project)
- Change `getRoundBySlug()` to query new table
- Update all round queries

**2. Update Signup Service Queries**
- Change `getSignupsByRound()` to query `project_sign_ups`
- Add `project_id` parameter
- Update all signup queries

**3. Update Submission Service Queries**
- Change `getSubmissions()` to query `project_submissions`
- Add `project_id` parameter
- Update all submission queries

**4. Update Votes Service Queries**
- Change `getVoteResults()` to query `project_votes`
- Add `project_id` parameter
- Update aggregation queries

**5. Update Email Reminder Queries**
- Query from `project_email_reminders`
- Add `project_id` parameter

### Important
- Writes still go to BOTH tables (dual-write continues)
- Only reads change
- Data in both tables is identical (from backfill + dual-write)

### Deployment Strategy
- Deploy during low-traffic period
- Monitor error rates for 1 hour after deploy
- Monitor page load times
- Check that dashboards load correctly
- Verify round pages display properly

### Rollback Plan
If anything goes wrong:
- Revert code to previous version
- Reads go back to old tables
- Dual-write still active, so no data loss
- Takes 2-3 minutes to rollback

### What Happens After Deploy
- App now reads from new project-scoped tables
- Users see same data (tables are identical)
- Dual-write ensures both tables stay in sync
- No user-facing changes yet

**Verification:**
- Test all major user flows (signup, submit, vote, view dashboard)
- Check admin panel works correctly
- Verify round navigation works
- Monitor for any error spikes
- Check database query performance

---

## Phase 5: Stop Dual-Write (1 Day)

**What You're Doing:**
Remove the code that writes to old tables. Now you only write to new tables.

### Code Changes

**1. Remove Old Table Inserts**
- Update round creation to only insert into `project_rounds`
- Update signup creation to only insert into `project_sign_ups`
- Update submission creation to only insert into `project_submissions`
- Update vote creation to only insert into `project_votes`
- Update email tracking to only insert into `project_email_reminders`

**2. Clean Up**
- Remove import statements for old table schemas
- Remove transaction code for dual-write
- Simplify service functions

### What Happens After Deploy
- New data only goes to new tables
- Old tables stop growing
- Old tables become static (historical record)
- App fully migrated to new structure

**Verification:**
- Create test signup - only appears in `project_sign_ups`
- Old `sign_ups` table has no new records
- App functions normally

---

## Phase 6: Archive Old Tables (After 30+ Days)

**What You're Doing:**
Rename old tables to indicate they're archives, not active tables.

### Archival Steps

**1. Rename Tables**
- `round_metadata` → `round_metadata_archive`
- `sign_ups` → `sign_ups_archive`
- `submissions` → `submissions_archive`
- `song_selection_votes` → `song_selection_votes_archive`
- `email_reminders_sent` → `email_reminders_sent_archive`

**2. Optional: Create Views**
- Create read-only views with old table names
- Views query from new tables, filtering to Cover Project
- Provides backwards compatibility if needed

### When to Do This
- Wait at least 30 days after Phase 5
- Ensures new system is stable
- Gives time to catch any issues

### What Happens After
- Old tables preserved but clearly marked as archives
- Can still query for historical reference
- After 90 days, optionally drop archive tables entirely

---

## Complete Rollback Procedures

### Rollback from Phase 4 (After Switching Reads)

**Scenario:** Errors spike after switching to read from new tables

**Steps:**
1. Revert code to previous version (re-deploy)
2. App goes back to reading from old tables
3. Dual-write still active, so both tables stay in sync
4. Investigate issue in new tables
5. Fix and try again

**Time:** 2-3 minutes

**Data Loss:** None (dual-write kept everything in sync)

### Rollback from Phase 5 (After Stopping Dual-Write)

**Scenario:** Discover issue days later, need to go back to old tables

**Steps:**
1. Re-enable dual-write code
2. Backfill any data created since Phase 5 from new tables to old tables
3. Switch reads back to old tables
4. Both tables now in sync again

**Time:** 30 minutes to 2 hours depending on data volume

**Data Loss:** None (can backfill the gap)

---

## Verification Checklist

### After Phase 1 (Tables Created)
- [ ] All 6 new tables exist in database
- [ ] Cover Project record exists in `projects` table
- [ ] Indexes created on all tables
- [ ] Row Level Security policies in place

### After Phase 2 (Dual-Write Enabled)
- [ ] Create test signup - appears in both `sign_ups` and `project_sign_ups`
- [ ] Create test submission - appears in both tables
- [ ] Create test vote - appears in both tables
- [ ] Monitor error rates - should not increase
- [ ] Check transaction performance

### After Phase 3 (Backfill Complete)
- [ ] Count of rounds matches between old and new tables
- [ ] Count of signups matches
- [ ] Count of submissions matches
- [ ] Count of votes matches
- [ ] Randomly sample 10 rounds and verify all data copied correctly
- [ ] Check for any orphaned records

### After Phase 4 (Reads Switched)
- [ ] Dashboard loads correctly
- [ ] Round pages display properly
- [ ] Voting results are accurate
- [ ] Signup counts match expectations
- [ ] Submission counts match expectations
- [ ] Monitor error rates for 24 hours
- [ ] Check database query performance metrics
- [ ] User reports no issues

### After Phase 5 (Dual-Write Stopped)
- [ ] Create new round - only appears in `project_rounds`
- [ ] Old table counts stop increasing
- [ ] Verify no code still references old tables
- [ ] Monitor for 7 days

### After Phase 6 (Tables Archived)
- [ ] Old tables renamed with `_archive` suffix
- [ ] Optional views created and working
- [ ] No errors in application logs

---

## Risk Assessment

### Phase 1: **Low Risk**
- Just creating tables, not using them
- Can delete and recreate if needed
- Zero impact on users

### Phase 2: **Medium Risk**
- Changes write path
- Transaction overhead could slow down writes slightly
- Mitigated by: testing in staging, gradual rollout, easy rollback

### Phase 3: **Low Risk**
- Read-only operation copying data
- Runs during low traffic
- If fails, just try again
- Zero user impact

### Phase 4: **Medium-High Risk**
- Changes read path (all user-facing queries)
- Could affect performance
- Could surface bugs in new queries
- Mitigated by: thorough testing, deploy during low traffic, fast rollback plan

### Phase 5: **Low Risk**
- Just removes redundant writes
- Makes code simpler
- Easy to re-enable if needed

### Phase 6: **Very Low Risk**
- Just renaming tables that aren't used anymore
- Can rename back if needed

---

## Timeline

**Total Duration:** 2-3 weeks with proper testing and monitoring

| Phase | Duration | Can Run During Live Traffic? |
|-------|----------|------------------------------|
| Phase 1: Create Tables | 1 day | Yes |
| Phase 2: Dual-Write | 3-5 days | Yes |
| Phase 3: Backfill | 1 day | Yes (prefer low-traffic) |
| Phase 4: Switch Reads | 2-3 days | Yes (deploy during low-traffic) |
| Phase 5: Stop Dual-Write | 1 day | Yes |
| Phase 6: Archive | 1 day | Yes (wait 30+ days) |

**Monitoring Periods:**
- After Phase 2: Monitor for 2-3 days
- After Phase 4: Monitor for 7 days
- After Phase 5: Monitor for 7 days

---

## Success Criteria

You'll know the migration succeeded when:

1. **Zero downtime** throughout entire migration
2. **Zero data loss** - all historical and new data preserved
3. **No user-reported issues** during or after migration
4. **Error rates unchanged** from pre-migration baseline
5. **Query performance** similar or better than before
6. **New tables have complete data** matching old tables
7. **Code simplified** after removing dual-write logic
8. **Ready to add second project** - just create new project record and rounds

---

## What Comes After

Once this migration is complete, adding the Original Songs project is straightforward:

1. Insert new project record into `projects` table
2. Create first round in `project_rounds` with the new project ID
3. Update UI to show both projects
4. Users can participate in both simultaneously

No additional database migrations needed!