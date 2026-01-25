# Turborepo Architecture Audit

**Date**: January 2025
**Overall Rating**: 5.5/10

The architecture has a solid foundation (proper monorepo structure, layered dependencies) but suffers from encapsulation issues that increase complexity and coupling.

---

## Table of Contents

1. [Package Overview](#package-overview)
2. [Dependency Analysis](#dependency-analysis)
3. [Critical Issues](#critical-issues)
4. [Moderate Issues](#moderate-issues)
5. [What's Working Well](#whats-working-well)
6. [Encapsulation Scoring](#encapsulation-scoring)
7. [Recommended Reorganization](#recommended-reorganization)
8. [Priority Actions](#priority-actions)
9. [Migration Checklist](#migration-checklist)

---

## Package Overview

The monorepo contains **24 packages** in `packages/` and **1 app** in `apps/web/`:

### Core Infrastructure
| Package | Purpose |
|---------|---------|
| `@eptss/data-access` | Database layer with services, providers, schemas, and config |
| `@eptss/routing` | Centralized routing with type-safe route builders |
| `@eptss/logger` | Logging infrastructure with Sentry/PostHog (server/client split) |
| `@eptss/shared` | Constants and enums shared across the application |

### Feature Packages
| Package | Purpose |
|---------|---------|
| `@eptss/auth` | Authentication with Supabase, components, guards, hooks |
| `@eptss/admin` | Admin dashboard UI and logic |
| `@eptss/actions` | Server actions across domains (auth, signup, profiles, etc.) |
| `@eptss/profile` | User profile components and utilities |
| `@eptss/dashboard` | Dashboard panels (hero, rounds, reflections) |
| `@eptss/forms` | Form components and hooks with react-hook-form |

### Content/Media Packages
| Package | Purpose |
|---------|---------|
| `@eptss/media-upload` | File/image/audio upload with cropping |
| `@eptss/media-display` | Audio/file preview and playlist components |
| `@eptss/comments` | Comment system with context and markdown |
| `@eptss/user-content` | Reflection/content management components |

### Business Logic Packages
| Package | Purpose |
|---------|---------|
| `@eptss/rounds` | Round information and timeline components |
| `@eptss/referrals` | Referral program components and actions |
| `@eptss/project-config` | Project configuration services and schemas |

### Utility Packages
| Package | Purpose |
|---------|---------|
| `@eptss/ui` | Shared UI components (Radix UI + Tailwind) |
| `@eptss/bucket-storage` | Supabase bucket storage setup and actions |
| `@eptss/email` | Email templates using React Email |
| `@eptss/captcha` | Google reCAPTCHA integration |
| `@eptss/rich-text-editor` | Markdown editor wrapper |
| `@eptss/feature-flags` | Feature flags infrastructure (minimal/empty) |
| `@eptss/scripts` | CLI scripts for background tasks and seeding |

---

## Dependency Analysis

### Healthy Layered Architecture

```
@eptss/ui (no internal deps) - Foundation
    ↓
@eptss/shared, @eptss/logger, @eptss/routing (no internal deps)
    ↓
@eptss/data-access (depends on shared, logger, routing)
    ↓
Feature Packages (auth, profile, forms, comments, etc.)
    ↓
@eptss/admin (depends on auth, data-access, email, forms, logger, routing, shared, ui)
    ↓
apps/web (consumes everything)
```

### Most Critical Packages (highest coupling)

1. `@eptss/data-access` - 30+ dependent packages
2. `@eptss/ui` - 15+ dependent packages
3. `@eptss/shared` - 10+ dependent packages
4. `@eptss/logger` - 8+ dependent packages
5. `@eptss/routing` - 7+ dependent packages

### Deep Import Problem

**59 deep path imports** bypass intended API boundaries:

```typescript
// ❌ Current pattern (leaky abstraction)
import { getUserDetails } from '@eptss/data-access/services/userService'
import { getAuthUser } from '@eptss/data-access/utils/supabase/server'
import { db } from '@eptss/db'

// ✅ Intended pattern
import { getUser } from '@eptss/data-access'
```

**Packages with most deep imports:**
- `@eptss/actions` (7 files)
- `@eptss/admin` (5 files)
- `@eptss/auth` (4 files)
- Web app (59 deep imports)

---

## Critical Issues

### 1. `@eptss/data-access` is a Monolith

**Problem**: This package exports 168 lines of public API and contains:
- Database layer (connection, schema)
- 29 service files
- Schemas, utils, providers, types

**Impact**:
- 59+ direct service imports across the codebase
- Difficult to refactor services without breaking multiple packages
- Database layer exposed directly to consumers

**Recommendation**: Split into:
- `@eptss/db` - schema, migrations, connection only
- Move services to their respective feature packages

### 2. `@eptss/actions` is a Kitchen Sink

**Problem**: Contains unrelated domains grouped together:
- Auth actions
- Admin actions
- Signup actions
- Profile actions
- Referral actions
- Participation actions
- Feedback actions
- Mailing list actions

**Impact**:
- No cohesion - package does too many unrelated things
- Difficult to reason about dependencies
- Changes in one domain risk affecting others

**Recommendation**:
- Colocate actions with their feature packages, OR
- Split into domain-specific action packages

### 3. Services Belong in Feature Packages

**Problem**: Services in `data-access` should live with their features:

| Current Location | Should Be |
|------------------|-----------|
| `data-access/services/roundService` | `@eptss/rounds` |
| `data-access/services/commentService` | `@eptss/comments` |
| `data-access/services/votesService` | `@eptss/voting` (new) |
| `data-access/services/referralService` | `@eptss/referrals` |
| `data-access/services/reflectionService` | `@eptss/user-content` |
| `data-access/services/signupService` | `@eptss/signup` (new) |

**Impact**:
- Feature packages are incomplete without their business logic
- Data-access becomes a god package
- Harder to understand feature boundaries

---

## Moderate Issues

### 4. Admin Logic is Scattered

**Locations**:
- `apps/web/app/admin/*` - Admin pages in web app
- `@eptss/admin` - Admin components and guards
- `@eptss/auth` - Some admin-related auth logic

**Recommendation**: Consolidate all admin logic into `@eptss/admin`

### 5. Missing `@eptss/voting` Package

**Problem**: Voting logic (`votesService`) lives in data-access with no dedicated package.

**Recommendation**: Create `@eptss/voting` with:
- Vote service
- Vote components
- Vote actions
- Vote types

### 6. Signup Flows in Web App

**Location**: `apps/web/app/projects/[projectSlug]/sign-up/`

**Problem**: Complex signup flows are hardcoded in web app instead of being reusable.

**Recommendation**: Extract to `@eptss/signup` or expand `@eptss/auth`

### 7. Validation Schema Duplication

**Locations**:
- `@eptss/data-access/schemas/` - Zod schemas
- `@eptss/forms` - Form validation
- Web app routes - API validation

**Recommendation**: Single source of truth for all validation schemas

### 8. Notification Logic in Web App

**Location**: `apps/web/lib/notification-navigation.ts` (8KB)

**Recommendation**: Create `@eptss/notifications` package

---

## What's Working Well

| Package | Score | Why |
|---------|-------|-----|
| `@eptss/routing` | 9/10 | Type-safe, single responsibility, no leaky abstractions |
| `@eptss/ui` | 8/10 | Clean component library, minimal dependencies |
| `@eptss/forms` | 8/10 | Clear responsibility, good encapsulation |
| `@eptss/logger` | 8/10 | Smart server/client split |
| `@eptss/comments` | 7/10 | Well-isolated feature |
| `@eptss/profile` | 7/10 | Focused component package |
| `@eptss/rounds` | 7/10 | Good feature isolation |
| `@eptss/referrals` | 7/10 | Cohesive feature package |

---

## Encapsulation Scoring

| Package | Encapsulation | Cohesion | Risk | Notes |
|---------|---------------|----------|------|-------|
| `@eptss/data-access` | 3/10 | 4/10 | HIGH | Too many exports, mixed concerns |
| `@eptss/actions` | 4/10 | 3/10 | HIGH | Multiple unrelated action types |
| `@eptss/admin` | 5/10 | 5/10 | MEDIUM | UI + business logic mixed |
| `@eptss/auth` | 6/10 | 6/10 | MEDIUM | Mixes auth + admin concerns |
| `@eptss/profile` | 7/10 | 7/10 | LOW | Good component package |
| `@eptss/comments` | 7/10 | 7/10 | LOW | Well-isolated feature |
| `@eptss/forms` | 8/10 | 8/10 | LOW | Clear responsibility |
| `@eptss/ui` | 8/10 | 8/10 | LOW | Well-defined component library |
| `@eptss/logger` | 8/10 | 8/10 | LOW | Server/client split works |
| `@eptss/routing` | 9/10 | 9/10 | LOW | Type-safe, well-defined |

---

## Recommended Reorganization

```
Current                              →  Ideal
────────────────────────────────────────────────────────────────

@eptss/data-access (monolith)        →  @eptss/db (schema only)
                                         + services move to feature packages

@eptss/actions (mixed domains)       →  Actions colocated with features
                                         OR domain-specific action packages

@eptss/admin (partial)               →  Consolidate all admin from web app

[missing]                            →  @eptss/voting
[missing]                            →  @eptss/signup
[missing]                            →  @eptss/notifications
```

---

## Priority Actions

### High Priority

- [ ] **1. Limit `data-access` exports** — Reduce to provider interfaces, stop exposing `db` directly
- [ ] **2. Extract voting package** — Clear feature boundary for votes/voting logic
- [ ] **3. Colocate services with features** — Move services to their feature packages

### Medium Priority

- [ ] **4. Consolidate admin** — Move web app admin pages into `@eptss/admin`
- [ ] **5. Create signup package** — Extract signup flows from web app
- [ ] **6. Centralize validation schemas** — Single source of truth

### Low Priority

- [ ] **7. Create notifications package** — Extract from web app
- [ ] **8. Enforce import boundaries** — ESLint rules to prevent deep imports
- [ ] **9. Document package contracts** — README for each package explaining public API

---

## Migration Checklist

### Phase 1: Extract Database Layer ✅ IN PROGRESS

- [x] Create `@eptss/db` package with schema and connection
- [x] Move `schema.ts` to `@eptss/db`
- [x] Move database connection to `@eptss/db`
- [x] Move migrations to `@eptss/db`
- [x] Update `data-access` to re-export from `@eptss/db` (backward compatible)
- [ ] Update deep imports of `@eptss/data-access/db/*` to use `@eptss/db`

### Phase 2: Extract Voting Package

- [ ] Create `packages/voting` with proper structure
- [ ] Move `votesService` from data-access
- [ ] Move vote-related types and schemas
- [ ] Create vote components if any exist in web app
- [ ] Update all imports

### Phase 3: Colocate Services

- [ ] Move `roundService` → `@eptss/rounds`
- [ ] Move `commentService` → `@eptss/comments`
- [ ] Move `referralService` → `@eptss/referrals`
- [ ] Move `reflectionService` → `@eptss/user-content`
- [ ] Update all imports

### Phase 4: Consolidate Admin

- [ ] Identify all admin pages in web app
- [ ] Move pages to `@eptss/admin`
- [ ] Export page components for web app to consume
- [ ] Update web app to import from package

### Phase 5: Create New Packages

- [ ] Create `@eptss/signup` package
- [ ] Create `@eptss/notifications` package
- [ ] Move relevant code from web app
- [ ] Update imports

---

## Notes

- No circular dependencies detected (good!)
- Architecture is fragile - refactoring could easily create circular deps
- Total deep path imports: 59 (target: 0)
- Files importing from data-access: 222+
