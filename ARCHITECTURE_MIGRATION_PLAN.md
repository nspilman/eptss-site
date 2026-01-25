# Architecture Migration Plan

## Vision

Transform from a **layer-based architecture** (services, providers, utils) to a **domain-based architecture** (rounds, signups, voting) for better composability and long-term leverage.

## Current State (Post Phase 0)

```
packages/
  # Infrastructure ✅
  db/                    # schema, connection, drizzle operators
  auth/                  # authentication, guards, hooks
  routing/               # route definitions
  ui/                    # shared components
  email/                 # email templates and sending
  logger/                # logging utilities
  shared/                # generic utilities

  # Feature Domains ✅
  comments/              # comment system (service + components)
  referrals/             # referral codes (service + components)
  voting/                # vote submission and results

  # Monolith (to be split)
  data-access/           # everything else
    ├── services/        # 22+ services
    ├── providers/       # data fetching
    ├── schemas/         # zod validation
    ├── utils/           # helpers
    └── types/           # TypeScript types
```

## Target State

```
packages/
  # Infrastructure (stable, rarely changes)
  db/                    # schema, connection
  auth/                  # authentication
  routing/               # routes
  ui/                    # design system
  email/                 # email infrastructure
  logger/                # logging
  shared/                # generic utilities

  # Feature Domains (vertical slices)
  comments/              # ✅ done
  referrals/             # ✅ done
  voting/                # ✅ done
  rounds/                # round lifecycle, phases, dates
  signups/               # signup flow, song selection
  submissions/           # cover submissions, audio
  profiles/              # user profiles, social links
  notifications/         # notification system

  # Core (cross-cutting concerns)
  core/                  # projects, shared business logic
```

---

## Phase 1: Rename & Stabilize

**Trigger:** Immediately after Phase 0 completion
**Effort:** ~1 hour
**Risk:** Low (mostly find/replace)

### Tasks

- [ ] Rename `packages/data-access` → `packages/core`
- [ ] Update all imports: `@eptss/data-access` → `@eptss/core`
- [ ] Update package.json name field
- [ ] Verify type check passes
- [ ] Update ARCHITECTURE_AUDIT.md

### Why Now?
Sets the mental model that `core` is intentionally cross-cutting, not a dumping ground.

---

## Phase 2: Extract `rounds/`

**Trigger:** Next time you work on round-related features
**Effort:** ~2-3 hours
**Risk:** Medium (many consumers)

### What Moves

```
core/services/roundService.ts      → rounds/services/
core/services/dateService.ts       → rounds/services/
core/providers/roundProvider/      → rounds/providers/
core/providers/roundsProvider/     → rounds/providers/
core/schemas/round*.ts             → rounds/schemas/
core/types/round.ts                → rounds/types/
```

### Package Structure

```
packages/rounds/
  ├── package.json
  ├── src/
  │   ├── index.ts
  │   ├── services/
  │   │   ├── roundService.ts
  │   │   └── dateService.ts
  │   ├── providers/
  │   │   ├── roundProvider.ts
  │   │   └── roundsProvider.ts
  │   ├── schemas/
  │   └── types/
```

### Dependencies
- `@eptss/db`
- `@eptss/routing`
- `@eptss/shared`

### Consumers to Update
- `apps/web/` (round pages, admin)
- `@eptss/dashboard`
- `@eptss/core` (other services that reference rounds)

---

## Phase 3: Extract `signups/`

**Trigger:** Next signup flow changes or new project onboarding
**Effort:** ~2 hours
**Risk:** Medium

### What Moves

```
core/services/signupService.ts     → signups/services/
core/providers/signupProvider/     → signups/providers/
core/schemas/signupSchemas.ts      → signups/schemas/
```

### Dependencies
- `@eptss/db`
- `@eptss/rounds` (needs round info)
- `@eptss/routing`

### Notes
- `signupService.ts` has inlined referral validation - keep it or import from `@eptss/referrals`
- Song selection logic could stay here or move to a `songs/` package later

---

## Phase 4: Extract `submissions/`

**Trigger:** Submission flow improvements or audio handling changes
**Effort:** ~2 hours
**Risk:** Low (well-bounded)

### What Moves

```
core/services/submissionService.ts → submissions/services/
core/schemas/submission.ts         → submissions/schemas/
core/types/submission.ts           → submissions/types/
```

### Dependencies
- `@eptss/db`
- `@eptss/rounds`
- `@eptss/bucket-storage` (audio files)

---

## Phase 5: Extract `profiles/`

**Trigger:** Profile page redesign or privacy feature work
**Effort:** ~2-3 hours
**Risk:** Low

### What Moves

```
core/services/userService.ts       → profiles/services/
core/services/profileService.ts    → profiles/services/
core/providers/profileProvider/    → profiles/providers/
```

### Notes
- Keep basic user CRUD in `core` or `auth`
- Move profile-specific features (social links, privacy, display settings) to `profiles/`

---

## Phase 6: Extract `notifications/`

**Trigger:** Notification system expansion
**Effort:** ~2 hours
**Risk:** Low (isolated feature)

### What Moves

```
core/services/notificationService.ts      → notifications/services/
core/services/notificationEmailService.ts → notifications/services/
```

### Dependencies
- `@eptss/db`
- `@eptss/email`

---

## Phase 7: Cleanup `core/`

**Trigger:** After major extractions complete
**Effort:** ~1 hour
**Risk:** Low

### What Remains in Core

```
packages/core/
  ├── services/
  │   ├── projectService.ts      # multi-project logic
  │   ├── statsService.ts        # cross-domain stats
  │   ├── monitoringService.ts   # health checks
  │   └── mailingListService.ts  # generic mailing
  ├── utils/
  │   ├── supabase/              # client creation
  │   └── helpers/               # generic utilities
  └── config/
      └── rateLimiters.ts
```

### Cleanup Tasks
- [ ] Remove empty directories
- [ ] Update index.ts exports
- [ ] Verify no orphaned code
- [ ] Update documentation

---

## Decision Framework

### When to Extract a Domain

Extract when **2+ of these are true**:
1. You're doing significant work in that area
2. The domain has clear boundaries (inputs/outputs)
3. You want to reuse it elsewhere
4. Multiple services/providers belong together
5. It has its own UI components

### When NOT to Extract

Keep in `core` when:
1. It's used by many domains (cross-cutting)
2. It's small/simple (not worth the overhead)
3. Boundaries are unclear
4. You're not actively working on it

---

## Package Dependency Rules

```
┌─────────────────────────────────────────────────┐
│                    apps/web                      │
└─────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   ┌─────────┐    ┌─────────┐    ┌─────────┐
   │ rounds  │    │ signups │    │ voting  │  Feature Domains
   └─────────┘    └─────────┘    └─────────┘
        │               │               │
        └───────────────┼───────────────┘
                        ▼
                  ┌─────────┐
                  │  core   │  Cross-cutting
                  └─────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   ┌─────────┐    ┌─────────┐    ┌─────────┐
   │   db    │    │  auth   │    │ routing │  Infrastructure
   └─────────┘    └─────────┘    └─────────┘
```

**Rules:**
1. Feature domains can depend on `core` and infrastructure
2. Feature domains should NOT depend on each other (use events/callbacks if needed)
3. `core` depends only on infrastructure
4. Infrastructure packages have no internal dependencies

---

## Tracking Progress

| Phase | Domain | Status | Notes |
|-------|--------|--------|-------|
| 0 | db, comments, referrals, voting | ✅ Done | Initial extraction |
| 1 | Rename to core | ✅ Done | `@eptss/data-access` → `@eptss/core` |
| 2 | rounds | ✅ Done | roundService, dateService, types moved to `@eptss/rounds` |
| 3 | signups | ⬜ Pending | |
| 4 | submissions | ⬜ Pending | |
| 5 | profiles | ⬜ Pending | |
| 6 | notifications | ⬜ Pending | |
| 7 | core cleanup | ⬜ Pending | |

---

## Estimated Total Effort

- **Phase 1:** 1 hour
- **Phases 2-6:** 2-3 hours each, done incrementally
- **Phase 7:** 1 hour

**Total:** ~15-20 hours, spread over weeks/months as you touch each domain

This is NOT a big-bang rewrite. Each phase is independent and can be done when convenient.
