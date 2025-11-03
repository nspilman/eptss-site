# Package Extraction Plan
## Web App Refactoring to Monorepo Packages

**Goal:** Extract cohesive functionality from `apps/web` into dedicated packages to maintain the principle that "the web app should essentially be only responsible for page rendering."

**Current State:**
- Web app contains ~1,835 TypeScript/TSX files
- 556 lines removed in initial rounds package extraction
- Many more opportunities for extraction identified

---

## Consolidation Audit Results (2025-11-02)

**Objective:** Audit existing packages to identify and eliminate duplication between `apps/web` and packages.

### ✅ Email Package - CONSOLIDATED

**Status:** Duplicates removed from web app
**Action Taken:**
- Deleted `apps/web/emails/` directory (13 templates + 2 components)
- Deleted `apps/web/services/emailService.ts` (stub implementation)

**Findings:**
- Package at `packages/email/` contained complete, production-ready implementations
- Web app files were exact duplicates of package files
- Web app was not importing from `@eptss/email`, instead had local copies
- ✅ Build verified successful after deletion (1m 8s, exit code 0)

**Remaining Work:** None - consolidation complete

---

### ❌ Auth Package - NOT DUPLICATES (Different Implementations)

**Status:** No consolidation needed
**Web App Usage:** Uses `@eptss/auth` for utilities (AuthStateListener, getCurrentUsername, ensureUserExists)
**Components:** Web app has its own auth component implementations

**Findings:**
- **Package components** (`packages/auth/src/components/`):
  - LoginForm.tsx - Uses Card component, own state management with useState
  - PasswordAuthForm.tsx - Uses Card component, manual form handling
  - Self-contained, production-ready implementations

- **Web app components** (`apps/web/components/client/`):
  - LoginForm.tsx - Uses FormWrapper + useFormSubmission hook (web-specific pattern)
  - PasswordAuthForm.tsx - Uses FormWrapper + useFormSubmission hook
  - EmailAuthModal.tsx - Next.js-specific Dialog wrapper around LoginForm
  - PasswordAuthModal.tsx - Next.js-specific Dialog wrapper around PasswordAuthForm

**Why They're Different:**
- Package versions: Simple, self-contained Card-based forms
- Web versions: Use web-specific utilities (FormWrapper, useFormSubmission) for consistent form handling with toast notifications
- These represent **different implementation patterns for different use cases**, not duplication

**Decision:** Keep both implementations
- Package serves as simple, reusable auth components for any consumer
- Web app uses enhanced pattern with custom form handling utilities
- FormWrapper and useFormSubmission are candidates for future `@eptss/forms` package

---

### ❌ Profile Package - NOT DUPLICATES (Different Use Cases)

**Status:** No consolidation needed
**Web App Usage:** Does not import from `@eptss/profile` at all

**Findings:**
- **Package components** (`packages/profile/src/components/`):
  - ProfileHeader, ProfileTabs
  - Tab components: OverviewTab, SignupsTab, SubmissionsTab, VotesTab
  - PersonalInfoTab, PrivacySettingsTab
  - Purpose: **Dashboard/settings** for authenticated users

- **Web app components** (`apps/web/app/profile/[username]/`):
  - PublicProfile.tsx
  - Purpose: **Public-facing profile view** for any user
  - Shows submissions and reflections, simplified view

**Why They're Different:**
- Package: Private dashboard with tabs for personal management
- Web: Public profile page for viewing other users
- These serve **completely different use cases**, not duplication

**Decision:** Keep both implementations
- Profile package is for authenticated user dashboards (not currently used by web)
- Web PublicProfile is for public user pages
- No overlap in functionality

---

### Summary of Consolidation Audit

**Completed:**
- ✅ Email package consolidated (deleted duplicates from web)

**No Action Needed:**
- ❌ Auth components are different implementations (Card vs FormWrapper patterns)
- ❌ Profile components serve different use cases (dashboard vs public view)

**Key Insight:**
Existing packages are well-architected and serve their purpose. The web app is NOT duplicating package functionality - it either:
1. Uses package utilities (AuthStateListener, getCurrentUsername)
2. Has different implementations for web-specific patterns (FormWrapper-based auth forms)
3. Serves different use cases (public profiles vs dashboard profiles)

**Next Steps:**
Focus on **new extractions** rather than consolidation:
1. Forms package (FormWrapper, useFormSubmission, form utilities)
2. Type consolidation (asyncResult.ts to shared)
3. Utility consolidation (formatDate, sanitize, etc.)

---

## Extraction Priority & Roadmap

### Phase 1: Infrastructure Layer (L1)

#### 1.1 Email Package - `@eptss/email` ✅ EXISTS
**Status:** Package already exists but may need consolidation
**Location:** `packages/email/`
**Files to migrate:** None (web app already uses this package)
**Action:** Verify all email functionality uses this package

**Current Web App Email Assets:**
- `apps/web/services/emailService.ts` (17KB)
- `apps/web/emails/` directory (13 templates + 2 components)
- `apps/web/utils/reminderEmailScheduler.ts`

**Decision Required:**
- Are these already using `@eptss/email`?
- If not, consolidate `emailService.ts` and templates into existing package
- Move `reminderEmailScheduler.ts` to email package or data-access

---

#### 1.2 Forms Package - `@eptss/forms` 🆕 NEW
**Priority:** HIGH
**Rationale:** Forms are used throughout the app (signup, login, feedback, submission, voting)

**Files to Extract:**
```
apps/web/hooks/useFormSubmission.ts          (2.8KB - Generic form hook)
apps/web/schemas/signupSchemas.ts            (Zod validation)
apps/web/components/client/Forms/
  ├── FormWrapper.tsx                        (Shared form container)
  └── SubmitButton.tsx                       (Generic submit button)
apps/web/utils/formDataHelpers.ts            (FormData extraction utilities)
```

**Package Structure:**
```
packages/forms/
├── src/
│   ├── hooks/
│   │   └── useFormSubmission.ts
│   ├── components/
│   │   ├── FormWrapper.tsx
│   │   └── SubmitButton.tsx
│   ├── schemas/
│   │   └── index.ts                         (Export common schemas)
│   └── utils/
│       └── formDataHelpers.ts
├── package.json
└── tsconfig.json
```

**Dependencies:**
- `react-hook-form`
- `@hookform/resolvers`
- `zod`
- `@eptss/ui` (for UI components)
- `sonner` (for toast notifications)

**Web App Changes:**
- Update imports from local paths to `@eptss/forms`
- Move schemas to forms package (consider domain-specific schemas)

---

#### 1.3 Shared Types Package - `@eptss/shared` ✅ EXISTS
**Status:** Package exists
**Action:** Audit if web app types should migrate here

**Current Web App Types:**
```
apps/web/types/
├── database.ts                              (22KB - Auto-generated)
├── user.ts
├── signup.ts
├── vote.ts
├── asyncResult.ts
├── BlogPost.ts
└── index.ts
```

**Decision Required:**
- `database.ts` → Should live in `@eptss/data-access`
- `asyncResult.ts` → Should move to `@eptss/shared`
- Domain types (`user.ts`, `signup.ts`, `vote.ts`) → Evaluate per package
- `BlogPost.ts` → Consider `@eptss/blog` or `@eptss/user-content`

---

### Phase 2: Feature Layer (L2)

#### 2.1 Authentication UI Package - `@eptss/auth` ✅ EXISTS
**Status:** Package exists at `packages/auth/`
**Action:** Verify web app components should migrate

**Current Web App Auth Components:**
```
apps/web/components/client/
├── LoginForm/
│   ├── LoginForm.tsx                        (Email/OTP login)
│   └── GoogleSignInButton.tsx               (Google OAuth)
├── PasswordAuthForm/                        (Password auth)
├── EmailAuthModal/                          (Email auth modal)
└── PasswordAuthModal/                       (Password modal)
```

**Decision Required:**
- Are these duplicates of existing `@eptss/auth` components?
- If yes → Remove and use package
- If no → Extract to auth package

---

#### 2.2 Profile Package - `@eptss/profile` ✅ EXISTS
**Status:** Package exists at `packages/profile/`
**Action:** Verify consolidation

**Current Web App Profile Assets:**
```
apps/web/components/profile-page/
├── components/
│   ├── profile-header.tsx                   (Avatar, location, join date)
│   └── profile-content.tsx                  (Main profile content)
└── page.tsx

apps/web/app/profile/[username]/page.tsx
```

**Decision Required:**
- Consolidate with existing `@eptss/profile`?
- Or are these web-specific views?

---

#### 2.3 Admin Package - `@eptss/admin` 🆕 NEW
**Priority:** MEDIUM
**Rationale:** Large, distinct feature set with dedicated components

**Files to Extract:**
```
apps/web/app/admin/
├── [slug]/page.tsx
├── login/page.tsx
├── actions/                                 (Server actions)
├── components/
│   └── tabs/                                (Tab components)
└── ProjectStatsCard/
    ├── RoundStatsComponent.tsx
    ├── UserStatsCard.tsx
    └── StatItem.tsx
```

**Considerations:**
- Admin is tightly coupled to web app routing
- May benefit from staying in web app as feature pages
- Components could be extracted to `@eptss/dashboard` package instead
- Server actions should stay in web app (Next.js-specific)

**Recommendation:** Extract only the presentational components to `@eptss/dashboard` (which already exists)

---

#### 2.4 Feedback Package - `@eptss/feedback` 🆕 NEW
**Priority:** LOW
**Rationale:** Small, self-contained feature

**Files to Extract:**
```
apps/web/components/feedback/
├── FeedbackForm.tsx                         (Supports: review, bug_report, feature_request, general)
└── FeedbackFormContainer.tsx

apps/web/app/feedback/page.tsx
```

**Package Structure:**
```
packages/feedback/
├── src/
│   ├── components/
│   │   ├── FeedbackForm.tsx
│   │   └── FeedbackFormContainer.tsx
│   └── types.ts                             (Feedback type enum)
└── package.json
```

**Considerations:**
- Very small scope (2 components, 1 page)
- May not warrant separate package
- Could stay in web app or merge into `@eptss/forms`

---

#### 2.5 Reporting Package - `@eptss/reporting` 🆕 NEW
**Priority:** LOW-MEDIUM
**Rationale:** Specialized analytics/visualization

**Files to Extract:**
```
apps/web/app/reporting/
└── Reporting/
    └── SongsTable/

apps/web/app/health/page.tsx                 (Health check)
```

**Considerations:**
- Reporting might be admin-specific
- Health check is likely app-specific and should stay
- Could be absorbed into admin/dashboard

**Recommendation:** Merge into `@eptss/dashboard` if extracted

---

### Phase 3: Utility Layer (L0/Shared)

#### 3.1 Core Utils - Evaluate Per Utility
**Files:**
```
apps/web/utils/
├── asyncResults.ts                          → @eptss/shared
├── featureFlags.ts                          → @eptss/shared or data-access
├── formatDate.ts                            → @eptss/shared
├── sanitize.ts                              → @eptss/shared
├── phaseCompare.ts                          → @eptss/rounds or data-access
├── reminderEmailScheduler.ts                → @eptss/email or data-access
├── formDataHelpers.ts                       → @eptss/forms
└── index.ts                                 (Response handlers - web specific)
```

#### 3.2 Library Utils
```
apps/web/lib/
├── logger.ts                                → @eptss/shared or data-access
├── ratelimit.ts                             → @eptss/shared or data-access
└── utils.ts                                 → @eptss/shared
```

---

## Implementation Strategy

### Step 1: Clean Up Existing Packages
Before creating new packages, audit what already exists:

1. **`@eptss/email`** - Verify web app is using this
2. **`@eptss/auth`** - Check for component duplication
3. **`@eptss/profile`** - Consolidate profile components
4. **`@eptss/dashboard`** - Check if admin components fit here

### Step 2: Extract in Priority Order
Following the rounds package pattern:

1. **Forms Package** (High impact, widely used)
   - Extract `useFormSubmission` hook
   - Move form components
   - Update all imports
   - Test across signup, login, feedback, submission flows

2. **Type Consolidation** (Foundation for other packages)
   - Move `asyncResult.ts` to shared
   - Move `database.ts` to data-access
   - Organize domain types

3. **Utility Consolidation** (Clean up shared code)
   - Move each utility to appropriate package
   - Update imports

4. **Feedback (Optional)** (Small, low risk)
   - Extract if desired as standalone feature

### Step 3: Document and Validate
- Update `.claude/project.md` with package decisions
- Run full build after each extraction
- Test critical user flows
- Commit package-by-package

---

## Package Dependency Guidelines

### Allowed Dependencies (Following Layered Architecture)

**L0 - Foundation:**
- `@eptss/shared` - Can depend on nothing (base types/utils)

**L1 - Infrastructure:**
- `@eptss/data-access` - Can depend on: shared
- `@eptss/email` - Can depend on: shared, data-access
- `@eptss/forms` - Can depend on: shared, ui
- `@eptss/ui` - Can depend on: shared

**L2 - Features:**
- `@eptss/rounds` - Can depend on: shared, data-access, ui
- `@eptss/auth` - Can depend on: shared, data-access, ui
- `@eptss/profile` - Can depend on: shared, data-access, ui, user-content
- `@eptss/dashboard` - Can depend on: shared, data-access, ui, rounds, profile
- `@eptss/feedback` - Can depend on: shared, forms, ui

**L3 - Applications:**
- `@eptss/web` - Can depend on: ALL packages

---

## Anti-Patterns to Avoid

1. **Don't extract too early** - Wait until patterns emerge across multiple uses
2. **Don't create circular dependencies** - L2 packages should not depend on each other
3. **Don't duplicate code** - If it exists in a package, use it (like the rounds lesson)
4. **Don't extract route logic** - Server actions, API routes, page components stay in web
5. **Don't create "micro-packages"** - Feedback might be too small to warrant extraction

---

## Success Criteria

After extraction, the web app should:
- ✅ Contain primarily page components and routing logic
- ✅ Import business logic from packages
- ✅ Have no duplicate code with packages
- ✅ Build successfully in <2 minutes
- ✅ Pass all type checks
- ✅ Maintain clear dependency boundaries

---

## Next Steps

1. **Review this plan** - Validate approach and priorities
2. **Start with Forms** - Highest impact, clear boundaries
3. **Extract package-by-package** - Test and commit each one
4. **Update project.md** - Document architectural decisions
5. **Measure progress** - Track lines removed from web app

---

## Questions to Answer

- [ ] Are existing packages (`@eptss/email`, `@eptss/auth`, `@eptss/profile`) being used or duplicated?
- [ ] Should admin components go to `@eptss/dashboard` or new `@eptss/admin`?
- [ ] Is feedback worth extracting or should it stay/merge?
- [ ] Where should `reminderEmailScheduler` live - email or data-access?
- [ ] Should health/reporting stay in web or extract to dashboard?

---

**Estimated Impact:**
- Current web app: ~1,835 files
- After full extraction: ~500-800 files (mostly pages and routing)
- Lines of code reduction: 50-60% (based on rounds extraction removing 556 lines)
