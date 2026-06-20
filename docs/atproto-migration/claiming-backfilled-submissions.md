# Claiming Backfilled Submissions — Build Plan

How we move every legacy cover out of the admin PDS and into its maker's own repo,
**safely** — without losing a single irreplaceable recording, and without making
eptss.at's reads fragile.

> **North Star:** the finished system is **[The Form](./claiming-the-form.md)** —
> every cover lives in its author's repo, found by the network, with no index and
> no leftover machinery. This document is *not* that. This is the **scaffold** that
> lets us reach the Form without anyone getting hurt on the way up. The scaffold
> comes down in the final phase; what's left standing is the Form.

---

## Why a scaffold at all

The Form is the destination, but raising it directly charges two prices we refuse
to pay up front (see *The price of the Form* in the [vision doc](./claiming-the-form.md)):

- **Irreversible deletion of irreplaceable data.** These are people's only
  recordings from 2020. We will not shred the backup mid-move to feel pure.
- **A fragile, single-dependency read path.** The Form makes every eptss.at read
  depend on one external backlink index being up and fast. For a small community
  project, adopting that on day one is too fragile.

So we keep a scaffold — a database index and backup copies — and take it down
**deliberately**, only once the new structure has proven it stands on its own. The
scaffold is not the opposite of the Form; it is the safe way to build it.

---

## The forces this build resolves

A claim flow sits in a field of competing forces. Naming them is most of the work.

| Force | Pull | How the build honors it |
|---|---|---|
| **Ownership wants to be true** | Each cover should live with its maker. | We genuinely move records into participants' repos — the Form's actual goal, not a fake. |
| **History wants to be unbroken** | A 2020 cover is present on eptss.at *today*; it must never flicker. | The move is additive + read-verified before anything is retired. |
| **Repair must stay reversible (while risky)** | A botched, irreversible migration of unrepeatable data is real harm. | Keep backups (tombstone, don't delete) until the new homes are proven. |
| **Reads must stay reliable (while migrating)** | eptss.at shouldn't go dark if one network service lags. | Keep the database index as the dependable default; add backlinks alongside, cut over only when proven. |

The Form resolves the first by *removing* everything else. The build resolves all
four *at once* by keeping the scaffold until the first is safely achieved — then
removing it.

---

## What exists today (don't rebuild this)

The identity bridge is already built and load-bearing:

- **`/api/atproto/link` + `/api/atproto/callback`** — OAuth dance linking an EPTSS
  `user_id` to a Bluesky DID. UI: `AtprotoLinkSection` on `/dashboard/profile`.
- **`user_atproto_identities`** — the `(user_id, did, handle)` crosswalk
  (`loadIdentity` / `loadIdentityByDid`).
- **`atproto_oauth_sessions`** (keyed by DID) — the session blob. `client.restore(did)`
  yields an agent **that can write to the user's own repo**. This is the capability
  claiming spends.
- **Attribution today** is pure crosswalk: rkey `eptss-sub<id>` → `submissions.id`
  → `users.username` (`resolveSubmitterNames` in the round page). The data needed
  to know whose cover is whose already sits in Postgres. That is the seed.

---

## The staged build

Each phase leaves the system whole and alive. We do not generalize until one real
instance works end to end.

### Phase A — *See yourself in the round* (no writes, no risk)

Make the crosswalk **visible**: a linked user sees *"these are your covers"* on
their dashboard, drawn from the existing `submissions → user` join filtered to
their linked identity. Nothing is copied; nothing is at risk. The system is already
more whole, and we've proven the data is there before trusting it with a write.

### Phase B — *Claim one* (the whole move, in miniature)

For a **single** submission:

1. Restore the user's OAuth session (`client.restore(did)`).
2. Read the admin's `eptss-sub<id>` record.
3. `putRecord` an identical-identity copy into the **user's** repo — same rkey
   scheme, same round strong-ref, same `getDeliverable` content.
4. **Read it back** from the user's repo to confirm it resolves. *(history-unbroken
   guarantee: prove the new home before touching the old one.)*
5. Set Postgres `submissions.claimed_at_uri` to the new URI.
6. **Tombstone — do not delete** — the admin copy (mark it claimed; the dedup rule
   suppresses it). The backup stays.

Then verify the round renders **identically** on eptss.at, now sourced from the
user's repo via the location index. One cover, fully re-homed, backup intact.

### Phase C — *Claim all mine*

Batch Phase B over the user's whole history. Three properties keep it safe:

- **Idempotent** — stable rkeys mean `putRecord` upserts; re-running claims nothing
  twice.
- **Resumable** — each submission's `claimed_at_uri` is independent; a mid-batch
  failure leaves a partially-claimed-but-whole state, and the next run continues.
- **Reversible** — `unclaimSubmission` clears `claimed_at_uri`, restoring the admin
  copy as canonical. Nothing was destroyed.

### Phase D — *Take the scaffold down → reveal the Form*

Only after claimed copies are proven stable across real reads, and **only as
deliberate, separate operations**:

- **D1 — Add backlinks alongside.** Stand up the backlink reader (Constellation or
  equivalent) and run it *in parallel* with the Postgres index; compare results.
  The database index remains the dependable default until backlinks proves fast and
  complete.
- **D2 — Cut over reads** to backlinks once D1 shows it trustworthy. The reader's
  single location function changes implementation inside; callers don't notice.
- **D3 — Sweep the backups.** Delete the tombstoned admin copies in one auditable
  pass, after a conservative stability window.
- **D4 — Remove the scaffold's machinery.** Drop `claimed_at_uri` / `claimed_at`,
  delete `resolveSubmitterNames` (attribution is now intrinsic via repo DID), and
  delete the claim code itself.

When D4 lands, the code matches the [Form](./claiming-the-form.md) exactly —
nothing remembers claiming happened. That is the build complete.

---

## Records & schema (the scaffold's machinery — all temporary)

```
Before claim                         After Phase B/C (scaffold up)
────────────                         ─────────────────────────────
admin repo:                          admin repo:
  at.atjam.submission/eptss-sub42      at.atjam.submission/eptss-sub42  (tombstoned/suppressed — BACKUP)
    round → at://admin/.../round/r1
                                     user repo (did:plc:USER):
                                       at.atjam.submission/eptss-sub42  ← canonical
                                         round → at://admin/.../round/r1   (same strong-ref)

Postgres submissions row:            Postgres submissions row:
  id = 42                              id = 42
                                       claimed_at_uri = at://did:plc:USER/at.atjam.submission/eptss-sub42
                                       claimed_at      = <ts>
```

```sql
-- Scaffolding columns. Dropped in Phase D4.
ALTER TABLE submissions ADD COLUMN claimed_at_uri text;       -- canonical URI once claimed; null = still on scaffold
ALTER TABLE submissions ADD COLUMN claimed_at     timestamptz;
```

### The claim-aware read boundary (resolved + built)

The seam is **one pure function** — `applyClaims(submissions, claimMap)` in
`packages/atproto/src/claim-view.ts` — answering *"where does each submission
live?"*:

- **today** → the app sources the claim map from Postgres
  (`getClaimedSubmissionUris` in `apps/web/lib/atproto/claims.ts`) and passes it
  in; `applyClaims` swaps each claimed submission's `uri` to its user-repo home.
- **Phase D** → feed `applyClaims` a backlinks-derived map instead — no caller
  change.

The decision that made this clean: **the read package stays DB-free.** The map is
a plain `Map<submissionId, uri>` argument, so the database boundary never crosses
into the package. And because a claimed record keeps the same rkey and the same
content, only its *home* changes — so there is no re-fetch from the user's PDS for
display, and no duplicate to dedupe (the package only ever read the admin copy).
The round still groups by the round strong-ref exactly as today; the strong-ref is
preserved across the move.

**Status: built and claim-ready.** With nothing claimed yet, the map is empty and
`applyClaims` is a pass-through, so `/atproto/round/<rkey>` renders identically off
the admin scaffold. This read side ships *before* any write, so the first claim can
never produce a record the reader cannot place. Covered by `claim-view.test.ts`.

---

## Trust: the claim is self-verifying (no curation gate)

The migration README's *"every user-side claim has a matching admin-side
confirmation"* rule exists to stop **drive-by claims on the open network**. That
force does not push on backfilled data: EPTSS already knows from its own 2020
database that submission X is user Y's, and OAuth has proven user Y controls DID Z.
The match is internal to two facts EPTSS already trusts — **no admin confirmation
step for backfilled claims**. (Forward submissions keep their gate; this is the
narrow, earned exception.)

---

## What stays with the organizer (not custody — true ownership)

The `at.atjam.round`, its `site.eptss.song` subject (vote results, signups), and
the `at.atjam.jam` container are authored by the admin **as organizer** — they
already sit in their right repo. Claiming re-homes only the participant's own
artifact, the cover. The boundary isn't a limitation; it's the same grain that
motivates the whole effort.

---

## What ships

- [ ] **Phase A** — "your covers" view, read-only, from the existing crosswalk.
- [ ] Postgres migration: `claimed_at_uri` + `claimed_at` on `submissions`.
- [ ] Reader location function in `packages/atproto/src/read.ts` (admin-unclaimed +
      `claimed_at_uri`, prefer-user dedup).
- [ ] **Phase B** — `claimSubmission(submissionId)` (6-step move), guarded by
      `getAuthUser` + `loadIdentity`; read-back before Postgres update; tombstone
      (no delete).
- [ ] **Phase C** — `claimAllMine()` batch (idempotent, resumable) +
      `unclaimSubmission` (proves reversibility).
- [ ] Smoke test: claim a real backfilled submission on a dev identity; confirm the
      round renders identically from the user copy, backup intact.
- [ ] **Phase D** (later, gated on proof) — backlink reader in parallel → cutover →
      sweep backups → drop scaffold columns + claim code. *Reveals the Form.*

## What this does *not* do (until Phase D)

- **No hard deletes.** Admin copies are tombstoned/suppressed backups until the
  deliberate D3 sweep.
- **No network dependency for reads.** Postgres index is the dependable default;
  backlinks are added in parallel (D1) before any cutover (D2).
- **No curation gate on backfilled claims** — self-verifying.
- **No signup claiming yet** — same shape, deferred; submissions first.
- **No admin-record re-homing** — rounds, songs, jam, vote results stay with the
  organizer by design.

## Open questions

1. **Backlink index** — Constellation, or self-hosted? Its availability and
   federation latency become load-bearing for every read *after D2*. The parallel
   window (D1) is where we earn the right to depend on it.
2. **Never-linkers** — custody indefinitely (default), or provision identities for
   legacy users (completes the Form, much heavier)?
3. **Stability window before D3 sweep** — how long, and what signal, confirms a
   user copy is durably readable before its backup is deleted?
4. **Handle/DID drift, PDS migration** — DID-based references survive both; confirm
   against did:plc behavior.
