# EPTSS - Turborepo Monorepo (Next.js + React + Supabase)

## Core Principle: LIBRARY-FIRST (CRITICAL)

### Before any code: Discovery process
1. `ls packages/` → list all packages
2. Read `package.json` → check exports, dependencies
3. Explore structure → `components/`, `hooks/`, `utils/`, `services/`, `types/`, `schemas/`, `providers/`
4. Search for existing implementation (grep)
5. Document which packages checked

**Rules:**
- Check ≥3 packages before writing new code
- Spot duplication → suggest extraction
- Follow existing patterns, never invent
- Show your work ("checked X, Y, Z...")

---

## Architecture: Layered (Dependencies flow down only)

**Structure:** `apps/` (app code) + `packages/` (reusable libs)

### Layer 0: Foundation (no deps)
- Constants, enums, config, shared types
- Pure UI (no business logic)
- **Use for:** Shared primitives, presentational components

### Layer 1: Infrastructure (deps: L0 only)
- Database (ORM, schemas, queries)
- External services (email, APIs)
- Data patterns (services, providers)
- **Use for:** DB schemas, data services, integrations

### Layer 2: Features (deps: L0+L1)
- Complete features (auth, profiles, content)
- UI + business logic + data
- Domain-specific components/hooks/utils
- **Use for:** User-facing features needing UI+data

### Layer 3: Apps (deps: all)
- Runnable apps in `apps/`
- Pages, routes, configs
- **Use for:** App-specific, non-reusable code

### Layer determination
- Shared constant/type? → L0
- Pure UI (no logic)? → L0
- DB/data access? → L1
- User feature (UI+data)? → L2
- App-specific? → L3

### Package discovery
1. `ls packages/` + identify domain
2. Read `package.json` → exports + deps → confirm layer
3. Check structure → dirs, naming, exports, similar code
4. Match pattern → same structure/naming/exports/separation

---

## Dependency Validation (L0 → L1 → L2 → L3, never reverse)

### Before adding dep to package:
1. Read its `package.json` → current layer (check workspace deps)
2. Read target `package.json` → target layer
3. Valid only if target = same/lower layer
4. If invalid: STOP → suggest extract to lower layer or ask user

### Discover hierarchy:
```bash
ls packages/
# For each: cat package.json | grep workspace
# L0 = no workspace deps
# L1 = deps only L0
# L2 = deps L0+L1...
```

### Circular dep warnings:
- A→B→C→A chain
- Same-layer mutual deps
- Foundation depending on Feature
- Build errors
→ Suggest refactor before proceeding

---

## Tech Stack

**Core:** Bun 1.2.0, Turborepo 2.3.3, Next.js 15.5.0, React 18.3.1, TypeScript 5.1.3

**Backend/DB:** Supabase (auth+DB), Drizzle ORM 0.38.4, Zod 3.24.1

**UI:** Radix UI, Tailwind CSS 4.0.14, Lucide React, Framer Motion 12.23.12, clsx, tailwind-merge

**Forms:** react-hook-form 7.54.2, @hookform/resolvers, Zod

**Email:** Resend 6.1.2, @react-email

**Content:** react-markdown, remark-gfm, gray-matter, dompurify

**Testing:** Jest 29.7.0, @testing-library/react, Cypress 14.0.0

**Dates:** date-fns 2.30.0

**Monitoring:** Sentry, PostHog

**Dev:** Storybook 8.6.14, ESLint, Prettier

---

## Pattern Discovery

### Package structure (typical)
```
packages/[name]/src/
├── components/  hooks/  utils/  types/
├── services/    providers/    schemas/
└── index.ts
```

### Imports (granular, tree-shakable)
```bash
# 1. Find package: ls packages/ | grep -i [domain]
# 2. Read exports: cat package.json | grep -A 10 "exports"
# 3. Import from subpaths:
import { X } from '@eptss/[pkg]/components'
import { Y } from '@eptss/[pkg]/hooks'
```

### Database
1. Find data pkg: grep for ORM (Drizzle/Prisma) or names like `data-access`/`database`
2. Schema location: `src/db/`, `src/schema/` or check `package.json` exports
3. Patterns: Check `services/` (logic), `providers/` (fetching)
4. Follow: Same ORM methods, same structure, same exports

### Components
1. Find UI pkg: grep UI lib deps (Radix/MUI) or names `ui`/`components`
2. Read components: Check styling (Tailwind?), primitives (Radix?), animation (Framer?)
3. Utils: Look for `lib/utils`, `cn()`/`clsx()` helpers
4. Match: Same primitives, styling, utils

### Forms
1. Search: `grep -r "useForm"` → likely in auth/profile pkgs
2. Validation: Find schemas (Zod/Yup) in `schemas/` dir
3. Integration: How validation connects, errors display, submission
4. Replicate: Same lib + validation + flow

---

## Dev Workflows

```bash
# Core
bun install / bun dev / bun build / bun test / bun test-coverage / bun check-types

# DB (from apps/web)
bun drizzle:generate / drizzle:migrate / drizzle:push

# Testing
bun test / bun test-coverage                              # Unit (Jest)
bun cypress:local / cypress:staging / cypress:production  # E2E
bun test:e2e:local                                        # Dev server + Cypress

# Components
bun storybook / bun build-storybook  # From packages/ui
```

---

## Key Files (Discovery)

**Monorepo:** Root `package.json` (workspaces), `turbo.json`/`nx.json`

**App:** `apps/[name]/` → `next.config.js`/`vite.config.ts`

**DB:** Find data pkg → `src/db/schema` or `src/schema/` → `drizzle.config.ts`/`prisma/schema.prisma` → `migrations/`/`drizzle/`

**UI:** Find UI pkg → `src/components/` → `.storybook/`

**Tests:** `jest.config.js`/`vitest.config.ts` (unit), `cypress.config.*`/`playwright.config.*` (e2e), `__tests__/`/`*.test.ts`/`*.spec.ts`

**Env:** `.env.example`, `env.ts`/`env.mjs` (validation)

---

## Decision Checklist (Before Code)

1. **Exists?** → `ls packages/` + check ≥3 pkgs + grep + document search
2. **Domain?** → Auth/UI/DB/Email/Profile/etc → Find matching pkg
3. **Layer?** → Constant/type/pure UI→L0, DB/service→L1, Feature→L2, App→L3
4. **Circular dep?** → Read target `package.json` → same/lower layer only, else STOP
5. **New pkg or extend?** → Cohesive→extend, New domain→new pkg, Coupling→new pkg, Unsure→ask
6. **Business logic?** → Yes→feature/infra pkg, No→can be UI pkg (keep UI pure)
7. **Touches DB?** → Find data pkg → check schemas/services/providers → follow ORM pattern
8. **Testable isolated?** → Storybook demo→UI pkg, Needs DB→infra/feature, Needs auth→feature

## After Finding Package

9. **Pattern?** → Read 2-3 similar files → match structure/naming/exports exactly
10. **Export?** → Check `package.json` exports → match pattern → add to subpath
11. **Tests?** → Check pkg tests → match pattern (Jest/Vitest) → same location
12. **Docs?** → UI component→Storybook, Public API→JSDoc, Complex→README

---

## Claude Workflow (Every Feature)

### 1. Discovery (REQUIRED)
`ls packages/` → identify 3-5 relevant → read `package.json` (exports+deps) → document: "Checked X, Y, Z..."

### 2. Analysis
Determine layer → check circular deps → identify patterns → explain reasoning

### 3. Implementation
Reference: `path/to/file.ts:lineNumber` → match patterns exactly → spot cohesion issues→suggest → explain *why*

### 4. Validation
Follows hierarchy? Matches patterns? Needs tests/Storybook? Document pattern followed

### Suggesting Abstractions
- Explain cohesion benefit
- Identify coupling problem
- Propose layer
- Respect patterns (discuss before inventing)

### When Uncertain
- Ask: "Found X & Y packages, which?"
- Present: "Could go A (pros/cons) or B (pros/cons)?"
- Admit: "No pattern found, create or extend?"

### Communication
- Show work (discovery process)
- Explain why ("here because...")
- Suggest improvements (duplication/cohesion)
- Reference examples: "Like ComponentX at path/to/file.ts:42"
