# EPTSS → ATProto Migration

Living spec for migrating EPTSS onto the AT Protocol, using **atjam** lexicons (`at.atjam.*`) for the generic jam coordination primitive and EPTSS-owned lexicons (`site.eptss.*`) for music-specific extensions.

## TL;DR

- **atjam** ([github.com/.../atjam](../../../../atjam)) owns the generic jam/round/signup/submission lexicons. EPTSS rides on them.
- EPTSS keeps its full Next.js UI — it does **not** become a thin renderer. Users still sign up, submit, vote, and listen on `everyoneplays...`.
- EPTSS **also writes** `at.atjam.*` records (interoperable with atjam.at and any other future reader).
- Every user-side claim has a matching **admin-side confirmation** — drive-by prevention via a curation gate.
- **No AppView in v1.** Reads go through Constellation backlinks + direct PDS reads, wrapped in queries. Postgres becomes a cache, not the source of truth (eventually).

## Architecture at a glance

```
User PDS                              EPTSS admin PDS
─────────                              ───────────────────
at.atjam.signup        ────────►    site.eptss.signupConfirmation
at.atjam.submission    ────────►    site.eptss.submissionConfirmation
  payload → artifact
                                       at.atjam.jam       (one per project)
                                       at.atjam.round     (one per round)
                                       site.eptss.song      (round subject)
                                       site.eptss.voteResult (after voting closes)
```

**Rule**: anyone can write the user-side record; EPTSS admin DID writes the matching confirmation. Reads are the intersection.

## Decision log

| # | Decision | Status |
|---|---|---|
| 1 | Migrate EPTSS onto ATProto | ✅ |
| 2 | New code lives in EPTSS monorepo (no separate repo) | ✅ |
| 3 | EPTSS keeps its own UI; writes `at.atjam.*` records | ✅ |
| 4 | User submission + admin confirmation mirror pattern | ✅ |
| 5 | Confirmation pattern is symmetric — signups too | ✅ |
| 6 | Voting is private (off-protocol); `site.eptss.voteResult` is public | ✅ |
| 7 | Audio payload type (`fm.plyr.track` vs `site.eptss.cover` vs external) | 🟡 open — plyr.fm coupling |
| 8a | **Lexicon publication to network** (JSON on PDS) | ✅ via `com.atproto.lexicon.schema` records — see `natespilmandotcom/src/lib/publish-lexicon.ts` as the template |
| 8b | TS type sharing across atjam ↔ EPTSS (vendor vs npm vs lex-cli locally) | 🟡 open |
| 9 | Voting lexicon shape (`site.eptss.voteResult`) | 🟡 open |
| 10 | Auth cutover model (dual-auth window vs hard cut) | 🟡 open |
| 11 | Confirmation flow: auto vs manual review | 🟡 open |

## Phase docs

| # | Phase | Doc |
|---|---|---|
| 1 | Round creation | [01-round-creation.md](./01-round-creation.md) |
| 2 | Signup + song nomination | _TBD_ |
| 3 | Voting (private) + result publication | _TBD_ |
| 4 | Recording window | _TBD_ |
| 5 | Submission | _TBD_ |
| 6 | Listening party / round close | _TBD_ |

## Reconciliation docs

These repair the gap between backfilled data (admin-owned, written before users had ATProto identities) and the intended ownership model.

Claiming backfilled submissions — re-homing legacy covers from the admin PDS to each participant's own repo — is documented as a vision + a plan:

| Doc | Role |
|---|---|
| [claiming-the-form.md](./claiming-the-form.md) | **North Star** — the finished system (user-owned records, network-as-index, no leftover machinery). The definition of "done." |
| [claiming-backfilled-submissions.md](./claiming-backfilled-submissions.md) | **Build Plan** — the safe, staged scaffold that reaches the Form without losing irreplaceable data or making reads fragile. The scaffold comes down in the final phase. |

A re-hosted cover is *also* an `fm.plyr.track`. Moving that track to its maker's own plyr identity turned out to be a clean in-app record re-home — verified working:

| Doc | Role |
|---|---|
| [claiming-plyr-tracks.md](./claiming-plyr-tracks.md) | **Resolved** — the in-app OAuth re-home (record duplication) is enough; plyr's firehose indexer re-attributes the track to the user's DID (`audio_storage: r2`) after a short lag — no plyr token, no re-upload. Includes the "what we feared vs. what was true" correction. The only residual case is brand-new uploads (audio never on plyr), which still need a plyr upload token. |

## Cross-cutting concerns

These touch multiple phases and get their own docs once the per-phase docs settle:

- **EPTSS admin DID infrastructure** — PDS hosting, handle, key management, session storage
- **Lexicon distribution** — how `at.atjam.*` types get into the EPTSS monorepo and stay in sync
- **Identity bridging** — mapping Supabase user_id ↔ ATProto DID; dual-auth coexistence
- **Postgres role evolution** — from source-of-truth → write-through cache → eventual read cache only
- **Constellation read patterns** — backlinks query shape, caching, fallback if Constellation degrades
- **Failure modes** — partial writes (Postgres succeeded, PDS write failed) and how to reconcile
