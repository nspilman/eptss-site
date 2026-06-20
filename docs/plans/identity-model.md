# Identity model: the account as membrane, named by the DID

**Status:** 🟢 Agreed direction · not yet built
**Date:** 2026-06-19
**Resolves:** atproto-migration decision **#10** (auth cutover model) and the cross-cutting **"Identity bridging"** concern (`../atproto-migration/README.md`).

---

## The question

We're moving toward **bsky-native login**: going forward, no one without a bsky account
can write records. When a user is logged in as their Atmosphere (bsky) account, where do
their **private** writes attach?

The sharp case is **voting**. Today every private row — votes, submissions, signups —
is keyed by `users.userid`, a `uuid` that today *equals* the Supabase auth uid. Votes
must stay **private, in our Postgres** (they never become atproto records — see migration
decision #6). So: when Supabase auth goes away, what is a vote keyed to?

The instinct was: "key votes to the bsky DID, and maybe we need a new table that isn't
coupled to the Supabase account." This doc explains why that instinct is *almost* right,
where it scars the structure, and the shape we chose instead.

---

## What's actually true today (the ground truth)

Two findings reframe the whole problem:

1. **Nothing structurally binds our data to Supabase auth.** `song_selection_votes.userId`
   → `users.userid`, and `users.userid` is a plain app-controlled `uuid` primary key.
   There is **no foreign key to `auth.users`, no `handle_new_user` trigger** in the schema
   or migrations. `createUser(userId, email)` *receives* the id and inserts it — today the
   app passes the Supabase uid, but nothing forces that.
   - ⚠️ *Open verification:* a Supabase **auth trigger configured in the dashboard** (outside
     the repo) could still exist. Confirm before building.

2. **`getAuthUser()` is the single seam.** It lives in `@eptss/auth/server` (re-exported via
   `@eptss/core`). Every private write resolves "who" through it. Today: Supabase session →
   `{ userId, email }`.

**Therefore the coupling to Supabase auth is *procedural, not structural*.** `users.userid`
*looks* welded to Supabase only because signup sets it that way and `getAuthUser` reads it
from the Supabase session. Dropping Supabase auth = changing those two points. It does **not**
require re-keying any private data.

---

## The forces

A good structure resolves the real forces, not an idea about elegance.

| | Force | Strength |
|---|---|---|
| **A** | Drop the dependency on **Supabase auth** for future rounds | strong, stated |
| **B** | Votes stay **private**, in our DB, never an atproto record | hard constraint |
| **C** | Identity is **stable and singular** per person | strong |
| **D** | We carry a **legacy** of uuid-keyed data and never-linked users | immovable |
| **E** | **Atproto-native honesty** — the DID "should" own its data | real, but softer (aesthetic pull) |

Key realization: **Force A is satisfied the moment `getAuthUser` stops calling Supabase.**
It never required keying votes to the DID. Keying votes to the raw DID serves Force E — and
collides with Force D.

---

## Options weighed

### Option 1 — Keep the `uuid` PK; DID as a satellite in the crosswalk

Votes stay keyed to `users.userid`; the bsky DID lives only in `user_atproto_identities`
(`userId ↔ did`), used as a permanent DID→uuid login lookup.

- ✅ Zero data migration; uniform keyspace.
- ❌ The `uuid` is a **meaningless surrogate** — an arbitrary token, a weak/dead center. The
  person's real identity (the DID) is demoted to a lookup-table satellite. It *feels*
  Supabase-shaped even after Supabase auth is gone.

### Option 2 — Key votes to the raw DID ("DID-native")

Add a `did` column to the private tables, backfill from the crosswalk, write DID-native
going forward.

- ✅ Conceptually pure: "the DID owns everything."
- ❌ **A permanent fault line.** Never-linked legacy users have no DID, so their rows stay
  `uuid`-only *forever* — the private tables end up with two keyspaces, a wing walled off and
  dark. Every future identity query must remember the building has two keys.
- ❌ **Collapses a boundary.** The DID is an *external/public* center (it belongs to the
  network, the user's PDS). The vote is an *internal/private* center (ours, never leaves).
  Welding the private row straight onto the public identifier erases the membrane that should
  sit between our world and the network — and drags an external id into the key of every
  private record.
- ❌ **Idea-driven, not force-driven.** It's reaching for purity (E) at the cost of the
  legacy reality (D), to satisfy a force (A) that was already met.

### Option 3 — The account as membrane, named by the DID ✅ (chosen)

Neither a meaningless surrogate (Option 1) nor a collapsed boundary (Option 2). The third
thing:

> **The account is a first-class center — the living membrane between our private world and
> the network — and its *name* is the DID.**

- Private data (votes, submissions, signups) keys to **the account**, one keyspace, no scar.
- The account's identity **is** the DID — promoted to its true name, required and unique for
  every future participant, not buried as a satellite.
- `getAuthUser`: bsky session → DID → account. **Supabase auth never called.** Force A, fully met.
- The legacy `uuid` is **not smeared across the vote rows** — it sits on the account row as
  that person's old name. The membrane absorbs the messiness in *one place* instead of
  fracturing the private tables.

This honors the instinct — the DID *is* the identity going forward, the same identity that
owns the plyr track and the `at.atjam.submission` record, so a person's whole participation
(public track + public record + private vote) hangs on one recognizable thread — while
keeping the private/public boundary intact and leaving no frozen wing.

---

## Why this is the more *alive* structure (the Alexander reading)

- **Strong centers.** A bare `uuid` is a weak center (arbitrary). The DID is a strong center
  (the real identity). Option 3 makes the strong center the account's *name*, so the account
  itself becomes strong — and a strong account makes the vote, the seam, and the public
  records around it more themselves.
- **Boundaries.** The healthy shape between two worlds is a membrane that *connects while
  separating*. The account is that membrane. Option 2 erases it; Option 1 makes it
  meaningless; Option 3 makes it a living thing.
- **Not-separateness.** The same DID that owns the public track/record is the account's name,
  so the private vote doesn't feel bolted onto a different identity system — it belongs to the
  same person-thread.
- **Structure-preserving / piecemeal.** The path is pure addition until the very end (below):
  no step leaves the building uninhabitable.

---

## The shape (concrete; schema details to confirm against the live DB)

**Seam.** `getAuthUser()` gains a bsky path and loses Supabase:
```
bsky OAuth session ──► DID ──► account ──► { accountId, did, ... }
```
During the transition it can fall through to the Supabase path; at cutover the Supabase path
is removed. **The vote/submission write code does not change** — it still receives an account
id and writes the same private row. That is the payoff of the single seam.

**Account row.** The account (today `users`) is identified by the DID:
- `did` becomes a **unique** column, **required for every new account**.
- `email` becomes **nullable** (a bsky-first user may have none) — the one real column change.
- The legacy `uuid` PK stays on the row as the old name (keeps existing FKs valid).
- `user_atproto_identities` is kept (not folded in) because it records **unlink/relink
  history** via `unlinkedAt` — multi-identity and identity-change support live there.

**Private tables.** Unchanged in shape — they keep pointing at the account. No `did` column is
smeared across `song_selection_votes` / `submissions`. Uniqueness like "one vote per round"
stays keyed to the account.

**New, bsky-first users.** At first login: mint an account row (fresh `uuid`, the `did` as its
name) + a crosswalk row. `users` becomes "the account," not "the Supabase user."

---

## Migration path (each step structure-preserving)

1. **Verify** there is no dashboard-side Supabase auth trigger creating `users` rows.
2. `email` → nullable; `did` → unique on the account (additive; no rewrite of existing rows).
3. Teach `getAuthUser` the bsky path **alongside** Supabase (dual-resolve window). Nothing
   breaks; bsky-linked users start resolving via DID.
4. Provision bsky-first signups (mint account + crosswalk).
5. Gate writes on a live bsky session for future rounds (no-bsky-no-write).
6. **Cutover:** remove the Supabase path from `getAuthUser`. Supabase auth is gone; Supabase
   *Postgres* remains our DB.

The legacy `uuid` never fully dies — never-linked historical users keep `uuid`-only rows,
read-only. But nothing *active* touches it or Supabase auth. That residue lives on the account
row, not in the private tables.

---

## The invariant

**Votes never leave our DB.** They stay private, keyed to the account. The bsky DID only
becomes the *name* we resolve the account by — it does not turn a vote into a public record.

---

## Open questions / to verify before building

- [ ] **Supabase dashboard auth trigger** — confirm none creates `users` rows out of band (the one place a hidden coupling could still live).
- [ ] **`email` nullable** — audit every read of `users.email` (notifications, mailing list) for null-safety.
- [ ] **Auth provider strategy** — run the existing `NodeOAuthClient` as the sole auth source vs. routing bsky OAuth *through* Supabase as a provider. (Option 3's data model holds either way; this is a separate decision.)
- [ ] **Account ↔ identity cardinality** — confirm one-account-one-DID is the v1 assumption; `user_atproto_identities` already supports relink history if not.
- [ ] **"One X per round" uniqueness** — confirm the existing per-account uniqueness constraints carry over unchanged once resolution moves to DID.
