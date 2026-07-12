# Archive

Completed plans, finished migrations, and point-in-time audits — kept for
history, **not current truth**. Nothing here describes the system as it is
today; when a document contradicts the code, the code wins. Live standards
stay in [docs/](../README.md), active intent in [docs/plans/](../plans/README.md).

| Document | What it was | How it ended |
|---|---|---|
| [MULTI_PROJECT_MIGRATION_PLAN.md](MULTI_PROJECT_MIGRATION_PLAN.md) | The plan for multi-project support | Shipped — `projects` table, `projectId` columns, `/projects/[projectSlug]/*` routes are live |
| [MULTI_PROJECT_UX_PLAN.md](MULTI_PROJECT_UX_PLAN.md) | UX plan for multi-project navigation | Drafted, cuts off mid-section; largely unbuilt |
| [ZERO_DOWNTIME_DB_MIGRATION.md](ZERO_DOWNTIME_DB_MIGRATION.md) | The zero-downtime playbook for the multi-project schema change | Executed |
| [ARCHITECTURE_MIGRATION_PLAN.md](ARCHITECTURE_MIGRATION_PLAN.md) | data-access → core rename + layering plan | Phase 1 shipped (`@eptss/core`) |
| [ARCHITECTURE_AUDIT.md](ARCHITECTURE_AUDIT.md) | Point-in-time architecture audit (Jan 2026) | Snapshot; findings partially addressed since |
| [UI_AUDIT.md](UI_AUDIT.md) | UI component abstraction audit + buildout (Nov 2025) | Completed — all 13 components shipped (supersedes the earlier UI_PACKAGE_AUDIT, deleted) |
| [LOGGING_IMPLEMENTATION.md](LOGGING_IMPLEMENTATION.md) | Adopting `@eptss/logger` across services | Completed; live reference is [packages/logger/README.md](../../packages/logger/README.md) |
| [CPU_OPTIMIZATION_PLAN.md](CPU_OPTIMIZATION_PLAN.md) | CPU/compute optimization plan | Partially executed; its ✅ marks overstate — some named helpers were never built. Treat as ideas, not record |
| [DATABASE_OPTIMIZATION_GUIDE.md](DATABASE_OPTIMIZATION_GUIDE.md) | N+1 / query optimization pass (Oct 2025) | Completed snapshot |
| [PERFORMANCE_OPTIMIZATION_SUMMARY.md](PERFORMANCE_OPTIMIZATION_SUMMARY.md) | Summary of the Oct 2025 performance pass | Completed record ("all phases complete") |
| [SUPABASE-SERVER-CONSOLIDATION.md](SUPABASE-SERVER-CONSOLIDATION.md) | Consolidating Supabase server utils into `@eptss/auth` | Completed |
| [FORMS_PACKAGE_MIGRATION.md](FORMS_PACKAGE_MIGRATION.md) | Extracting form components into `@eptss/forms` | Completed |
| [DASHBOARD_MIGRATION.md](DASHBOARD_MIGRATION.md) | Cutover onto `@eptss/dashboard` | Completed |
| [COMMENTS_FUTURE_ENHANCEMENTS.md](COMMENTS_FUTURE_ENHANCEMENTS.md) | Comments feature wish-list | Speculative; performance claims unsubstantiated |
