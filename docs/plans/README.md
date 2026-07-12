# Plans

Design plans and decisions for work that is **agreed but not yet built**.

Each doc states:
- **the why** — the forces in the situation, not just the chosen shape;
- **the options weighed** — including the ones we rejected, and *why* they were less alive;
- **the chosen structure** — concretely enough to build against;
- **the migration path** — the piecemeal, structure-preserving steps to get there;
- **open verifications** — what we still need to confirm before code leans on it.

When a plan ships, link it from the relevant code or from
[`../atproto-migration/`](../atproto-migration/), and mark its status here.

| Plan | Status |
|------|--------|
| [identity-model.md](./identity-model.md) — the account as membrane, named by the DID | 🟢 Agreed direction · not yet built |
| [text-component-migration.md](./text-component-migration.md) — raw `<p>`/`<span>` → the `Text` primitive | 🟡 Stalled — component shipped, ~3 of 47 files migrated |
| [integration-test-plan.md](./integration-test-plan.md) — Playwright integration suite | 🔴 Drafted, never executed — playwright config exists, no tests written |
