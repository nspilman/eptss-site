# site.eptss.* Lexicons

AT Protocol record schemas for **async-sync community projects** — communities
that run recurring rounds, where members independently respond to a shared
subject and converge to share what they made.

EPTSS (Everyone Plays The Same Song) is the originating use case, but the
schemas are designed to fit the broader pattern: book clubs, recipe
challenges, art prompts, writing circles, code katas, photography projects,
film clubs.

## Namespace & ownership

`site.eptss.*` — based on the `eptss.site` domain. EPTSS owns the schema
authority, but the schemas describe a pattern, not the EPTSS instance of it.
Other communities are welcome to publish records under their own DIDs against
these lexicons.

The non-user-attributed records (project, round, subject, prompts, vote
results) are published under the EPTSS service-account DID
(`@everyoneplaysthesamesong.com`). User-attributed records (submissions,
reflections, comments, profile fields) live on each participant's own PDS —
two hats.

## Records

### Reference / catalog

- **`site.eptss.project`** — a long-running community. Has a name, slug,
  description, and `subjectKind` (declares what kind of subject this
  community works with: 'song', 'book', 'recipe', etc.). Stable rkey from the
  slug.

- **`site.eptss.subject`** — the unit of "what we're collectively responding
  to." Carries a title, optional `kind` (defaults from project), optional
  `attribution` (artist/author/chef/source), and an optional `externalRef`
  (MusicBrainz/ISBN/IMDB URL) for cross-community discovery. Has identity
  beyond any single round and may be reused across rounds.

### Round lifecycle

- **`site.eptss.round`** — one iteration of a project. References the project
  and (once chosen) a subject. Carries an inline `phases` array — an ordered
  list of `{name, at, description?}` events that describe the round's
  schedule. Each community defines its own phase vocabulary.

  EPTSS uses its own native vocabulary: `signupOpens`, `votingOpens`,
  `coveringBegins`, `coversDue`, `listeningParty`. A book club might use
  `nominationsOpen`, `votingOpens`, `readingBegins`, `discussionAt`. A code
  kata might just have `creationBegins` and `submissionsDue`. The lexicon
  doesn't constrain names — each community emits whatever its codebase
  already calls these events.

  Phases are inline (not a separate record) because they have no identity
  outside their round, and because ATProto has no joins — separate records
  would force every consumer into N+1 fetches.

  Also has optional `links: [{label, uri}]` for external artifacts (listening
  party playlist, discussion thread, gallery).

- **`site.eptss.roundPrompt`** — a creative prompt attached to a round. A
  round may have many. Separate from the round so prompts can be added or
  edited without rewriting the round record.

### Results

- **`site.eptss.voteResult`** — aggregate (anonymous) vote stats for one
  subject in one round: average, count, distribution histogram, plus
  `scaleMin`/`scaleMax` so each record self-describes its voting scale.
  **Individual ballots are never published**; the aggregate is the only
  public form. Communities that don't use voting simply don't emit these.

## What's not here

User-attributed records (`submission`, `reflection`, `comment`, profile
fields) are out of scope for this first cut. They require consent plumbing
(EPTSS uses `user_share_permissions.can_share_bsky` in Postgres) and are
gated behind the cutover at end of the current round.

## Design notes

**Phases as inline arrays, not separate records or hardcoded date fields.**
The "five named date fields" (signupOpens, votingOpens, etc.) was the
EPTSS-shape leaking into the schema. The "phases as separate record" version
would have made every round-render a two-fetch operation in a protocol that
has no joins. Inline arrays are the right balance.

**Subject as a separate record.** Unlike phases, subjects have identity
beyond rounds — a book gets re-read; a song gets re-covered. Inlining
subjects would force clients to dedupe by title-string. The N+1 cost is paid
once per round (not per render — CIDs cache forever).

**Vote scale self-described per record.** The schema doesn't assume 1-10 or
1-5; each `voteResult` carries `scaleMin`/`scaleMax` and a
correspondingly-sized `distribution`. Future-proofs against scale changes
between communities or even between rounds.

**No `phase` enum on rounds.** Current phase is derivable from current time
vs. the phases array. Storing it would create staleness.

**No `isActive` on projects.** Project liveness is observable from whether
new rounds are being added; storing it as a mutable boolean would just
create another thing to keep in sync.
