# Claiming Backfilled Submissions — The Form

**This is the North Star.** It describes the *finished building* — what the system
is when claiming is complete and every prop is gone. It is the definition of
"done," not a set of build instructions.

It is deliberately **not** the construction plan. Building the Form directly
charges two prices we refuse to pay up front (see *The price of the Form*, below).
The safe road that actually reaches this state, step by step, is the
**[Build Plan](./claiming-backfilled-submissions.md)** — a scaffold we raise and
then take down. When the scaffold comes down, what remains is exactly this
document.

---

## The Form

Three sentences hold the entire steady state:

1. Every submission is a record in **its author's repo**, strong-reffing its round.
2. A round's submissions are discovered by **backlink query** — *"what
   `at.atjam.submission` records reference this round?"* — across the whole
   network. The network is the index.
3. Attribution is **intrinsic**: the repo's DID *is* the author; the DID resolves
   to a handle directly.

From those three, everything contingent falls away. No admin-owned copy of a
user's artifact. No Postgres source-of-truth, no location column, no dual-write.
No `eptss-sub<id> → username` crosswalk — that existed only *because* every record
sat in the admin repo. No "claimed" flag, because in the Form there is nothing to
flag: a submission lives where its maker lives, like every other record on the
network.

The machinery of claiming appears **nowhere** in the finished architecture. That
absence is the test of the ideal:

> **When claiming is done, nothing in the system remembers it happened.**

---

## Where reality withholds the Form

One fact resists. A 2020 participant who never links a Bluesky account has no repo
to hold their cover. The Form cannot place a record in a repo that does not exist.

The resolution keeps the Form whole instead of bolting a second system beside it:
the admin repo holds the unclaimed records **as custodian**, and the reader **does
not distinguish custody from ownership** — because it reads by backlink, and a
backlink does not care which repo it points into. The admin repo is just another
repo in the index. One read mechanism serves owned and custodied alike.

Custody is therefore *a region of the Form not yet filled in*, not an exception to
it. (To fill it completely we could provision identities for legacy users — but
that is a heavier ideal; custody-under-backlinks is the lightest form that stays
whole.)

---

## The act that reaches the Form

In the finished system, claiming a single submission is one clean move:

1. Restore the user's OAuth session — `client.restore(did)`.
2. `putRecord` the record into the **user's** repo: same identity (rkey
   `eptss-sub<id>`), same round strong-ref. It is the same record; it changes
   homes.
3. **Read it back** from the user's repo. History stays unbroken — the new home is
   proven before the old one is vacated.
4. `deleteRecord` the custodian copy on the admin repo.

After step 4 there is exactly one copy, in the right repo, found by the same
backlink query as always. No `claimed_at_uri`. No dedup. No tombstone. The act
left no trace — which is the whole point.

Self-verifying, so no curation gate: EPTSS already knows from its own 2020 database
that this submission is user Y's, and OAuth has proven user Y controls DID Z. The
match is internal to two facts EPTSS already trusts. (Curation gates remain correct
for *new, forward* submissions on the open network — this is the narrow, earned
exception.)

---

## The price of the Form — why we don't build it directly

The Form pays for its purity. These are not flaws to patch; they are what choosing
the ideal *means*. They are also exactly why the [Build Plan](./claiming-backfilled-submissions.md)
exists — to reach this state without paying these prices on day one.

- **The network becomes a hard dependency.** Reads require a live backlink index
  (Constellation or equivalent). If it degrades or lags federation, a round's
  submissions render slowly or incompletely. A database index has no such failure
  mode. This is the true cost of decentralization.
- **Deletion is committed.** Removing the custodian copy (step 4) is irreversible.
  These are people's only recordings from 2020. The Form keeps no backup once a
  record is "home."
- **The unclaimed remnant persists in custody** for as long as people don't link.
  The Form has an unfilled region, indefinitely.

The Build Plan accepts these as the *destination's* properties while refusing them
as the *journey's*: it keeps a backup and a reliable index until the new structure
is proven, then removes them — arriving here only once it's safe.

---

## What is not custody — and stays exactly where it is

The `at.atjam.round`, its `site.eptss.song` subject (vote results, signups), and
the `at.atjam.jam` container are authored by the admin **as organizer**. That is
true ownership, not custody — the organizer really is their author. They already
sit in their right repo, and the Form leaves them untouched. Only the
participant's own artifact — the cover — was ever in the wrong place.

---

## Reading the Form (steady-state code shape)

- **No `claimed_at_uri` / `claimed_at` columns.** They are scaffolding; they don't
  exist here.
- **Reader** (`packages/atproto/src/read.ts`): `getEptssData` resolves each round's
  submissions by **backlink query**, not by `listRecords` on the admin repo.
  Custodied and owned records arrive through the same call.
- **No `resolveSubmitterNames` crosswalk.** The submission's repo DID resolves to a
  handle directly.
- **No claim code.** It was transitional and deleted itself once reconciliation
  finished.

The whole of this section is "what is *absent*." That is how you know it is the
Form.
