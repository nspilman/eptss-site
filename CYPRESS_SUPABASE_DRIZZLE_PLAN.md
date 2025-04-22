# Streamlining Cypress Tests with Local Supabase & Drizzle

[In a previous post](https://natespilman.com/blog/2025-03-03-eptss-testing-plan), I discussed setting up a staging environment to test workflows outside of the Everyone Plays the Same Song production environment. With this post, I’ll do one better.

I realized that my problems related to timing of rounds and precision and persistence of state remained – how can I ensure that there is a round open when I want to test signups? How can I ensure there are songs to vote on when I want to test voting? And so on.

I’m optimistic that my answer to testing all my workflows is to use an ephemeral database, populate all the data as needed, and run the tests.

The project uses [Supabase](https://supabase.com/) for data persistence and user management, and it turns out I can use the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) to accomplish what I need.

Building reliable end‑to‑end tests often comes down to one thing: consistent, isolated data. By combining Colima‑backed Supabase, Drizzle schema tooling, and Cypress hooks, you can spin up a fresh Postgres + Auth stack, push your latest schema, seed known test fixtures, and exercise every core workflow—without ever touching shared staging data.

## 1. Spin Up a Local Supabase Stack  
I leverage the Supabase CLI and Colima to launch Auth, Realtime, Storage, and Postgres in a self‑contained VM.  
```bash
colima start
supabase start
```  
All services run on `localhost`, giving me total control and zero interference with other environments.

## 2. Push Your Schema with Drizzle  
I point my `DATABASE_URL` at the local Postgres port (54322) and simply run:  
```bash
bunx drizzle-kit migrate
```  
Drizzle reads my migrations or schema definitions and ensures my tables and columns are up to date—every time.

## 3. Seed & Reset in Cypress Hooks  
I define Cypress `task`s that call a Node seed script (using supabase‑js or raw SQL) to:  
- Truncate/reset all tables  
- Upsert a test user  
- Create “round” records with controlled `startTime`/`endTime`  
Then in `before()` and `beforeEach()`, I invoke `cy.task('resetDb')` + `cy.task('seedRounds', { openOffset, closeOffset })` so each spec runs against a known state.

## 4. Freeze the Clock (Optional)  
If I need UI timers or countdowns, I use `cy.clock()` to lock `Date.now()`—my rounds will open, close, and expire exactly when my tests expect.

## 5. Run & Verify  
With `DATABASE_URL` pointed at my local stack, I run:  
```bash
bun cypress open --config-file cypress.config.local.ts
```  
or headless via `bun cypress run`. I inspect Supabase Studio at `http://localhost:54323` or connect with `psql` to double‑check my tables.

---

This workflow gives me lightning‑fast, fully repeatable Cypress suites—no more flaky tests, no more shared‑state surprises. I spin up, push, seed, test, and tear down, all on my machine. Happy testing!
