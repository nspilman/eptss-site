# EPTSS AT Protocol Lexicons

Lexicon definitions for EPTSS records published to the Atmosphere.

## Namespace

`site.eptss.*` — based on the `eptss.site` domain.

## Ownership

These records are published under the **EPTSS service-account DID**, not any
individual organizer's personal DID. Records are bound to a DID immutably and
cannot be transferred, so the publishing identity must reflect the project, not
the person currently running it.

## Record types

### Reference / catalog

- **`site.eptss.project`** — long-running project (Cover, Originals). Stable
  rkey from the project slug (e.g. `cover`).
- **`site.eptss.song`** — catalog entry. Referenced by rounds and vote results.

### Round lifecycle

- **`site.eptss.round`** — one round's metadata: project ref, slug, key dates
  (signupOpens → listeningParty), chosen song, playlist URL. Suggested rkey:
  `{projectSlug}-{roundSlug}` (e.g. `cover-25`).
- **`site.eptss.roundPrompt`** — creative prompt attached to a round. A round
  may have many.

### Results

- **`site.eptss.voteResult`** — aggregate (anonymous) vote stats for one song
  in one round: average, count, distribution histogram. **Never** publish
  individual ballots; this aggregate is the only public form of vote data.

## What is *not* here yet

The user-attributed records (`submission`, `reflection`, `comment`, profile
fields) are explicitly out of scope for this first cut. Those need consent
plumbing (`user_share_permissions.can_share_bsky`) and are gated behind the
cutover at end of the current round.
