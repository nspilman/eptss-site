# Phase 1 — Round Creation

The first admin action in the ATProto-migrated EPTSS. Every other phase depends on a round existing. Round creation is also the moment when **all foundational infrastructure must already be in place** — so this doc doubles as the Phase 0 infrastructure checklist.

## Goal

Allow an EPTSS admin to create a new round by filling out a form. On submit:

1. A `site.eptss.song` record is written to the **EPTSS admin DID's PDS** (the canonical record of what song this round is covering).
2. A `at.atjam.round` record is written to the **same admin PDS**, with:
   - `jam` → strong-ref to the long-lived `at.atjam.jam` record for "EPTSS"
   - `subject` → strong-ref to the `site.eptss.song` record from step 1
   - `milestones` → the 5 EPTSS lifecycle dates
3. A row is inserted into Postgres `round_metadata` for the existing app to keep functioning (dual-write).

After this, the round exists everywhere: on-protocol (visible to atjam.site and any other reader) and in Postgres (used by the EPTSS app's read paths until those are migrated).

## Actors

| Actor | Role |
|---|---|
| **EPTSS admin (human)** | Logged-in admin user in the EPTSS web app |
| **EPTSS admin DID (service identity)** | The DID that signs all round/song/confirmation records |
| **EPTSS web app (server)** | Mediates the write — handles form, talks to admin PDS, dual-writes Postgres |

The human admin and the admin DID are not the same thing. The human authenticates to EPTSS however EPTSS auth normally works (Supabase today). The admin DID is a **service identity** that EPTSS holds credentials for and signs writes with.

## Pre-conditions (Phase 0 infrastructure)

Before the first round can be created, **every item below must exist**. Round creation is the first action that exercises the full stack.

### P0.1 — EPTSS admin DID provisioned

- **What**: A DID with a PDS, a handle, and an active session.
- **Decisions**:
  - **PDS host**: self-host vs. ride bsky.network. Self-hosting gives full control over admin records but is real infrastructure (Docker, backups, monitoring). For v1, riding bsky.network is acceptable; revisit if/when admin record volume justifies self-hosting.
  - **Handle**: `eptss.com` or a subdomain (e.g. `admin.eptss.com`, `atproto.eptss.com`). The handle is the public-facing name for the admin identity. Use the same root domain as the website for trust signal.
  - **Key management**: rotation key + signing key. Stored where? At minimum: environment variables on the web app server (1Password or similar for the backups). Decide before going to prod.
- **How to provision**: DID:plc creation via `com.atproto.identity.*` or via a PDS that does it for you on account creation.
- **Open**: should the admin DID be `did:plc:*` (mutable, key-rotatable) or `did:web:eptss.com` (DNS-controlled, lighter)? Recommend `did:plc:*` for v1 — standard path, fewer DNS gotchas.

### P0.2 — `at.atjam.*` lexicons accessible from EPTSS code

The atjam repo defines these in `lexicons/site/atjam/*.json` (and TS types in `lexicons/src/*.ts`). EPTSS needs to import the TS types.

- **Decisions**:
  - **Distribution mechanism**: npm publish atjam's lexicons package, vendor the JSON + regen TS in EPTSS, or git submodule.
  - **Recommendation**: npm publish under `@atjam/lexicons`. Lowest friction once set up; treats atjam as the upstream library it morally is. Vendoring forks types; submodules are clunky in monorepos.
  - **Counter-argument**: lexicons are pre-v1 and unstable. Frequent publishes will be churn. Mitigation: tight version pinning, only consumed by EPTSS for now.
- **EPTSS package**: new workspace package `packages/atproto-lexicons` (or similar) that re-exports the atjam types and adds `site.eptss.*` definitions/types.

### P0.3 — Lexicons published as `com.atproto.lexicon.schema` records

The ATProto-native way to publish a lexicon: put its JSON as a record on a PDS, under the `com.atproto.lexicon.schema` collection, keyed by NSID.

**Template script** (already battle-tested for `com.natespilman.guestbook.entry`): [`natespilmandotcom/src/lib/publish-lexicon.ts`](../../../../natespilmandotcom/src/lib/publish-lexicon.ts)

```bash
# Per EPTSS lexicon:
bun publish-lexicon.ts path/to/site.eptss.song.json
# → putRecord at com.atproto.lexicon.schema/<NSID> on the admin DID's PDS
```

**What this leaves open**: handle/NSID-authority DNS resolution (so a stranger consuming `site.eptss.song` can find which DID hosts it). That's needed eventually for the network-wide story, but not blocking for v1 — EPTSS knows where its own lexicons live, and atjam.site can be told. Defer until first external consumer asks.

**Action**: copy `publish-lexicon.ts` into the EPTSS monorepo as a workspace script (probably under `packages/atproto-lexicons/scripts/`). Use admin DID's app password from P0.6.

### P0.4 — `at.atjam.jam` record for "EPTSS" exists

The recurring container. Created once, referenced by every round forever.

- **Where**: EPTSS admin DID's PDS.
- **Fields**:
  ```ts
  {
    $type: "at.atjam.jam",
    name: "Everyone Plays The Same Song",
    description: "A community music project where everyone covers the same song.",
    organizer: "<EPTSS admin DID>",
    kind: "music-cover",
    links: [
      { label: "Website", url: "https://everyoneplaysthesamesong.com" },
      // … socials, etc.
    ],
    createdAt: "<ISO datetime>"
  }
  ```
- **Rkey**: meaningful or random? Recommend a meaningful one like `eptss` so the AT URI reads `at://did:plc:.../at.atjam.jam/eptss`.
- **Provenance**: written once, manually or via a one-shot admin script. Not part of the round creation flow itself.

### P0.5 — `site.eptss.song` lexicon defined

Lives in `packages/atproto-lexicons/site/eptss/song.json` plus generated TS.

**Draft fields:**
```ts
{
  lexicon: 1,
  id: "site.eptss.song",
  defs: {
    main: {
      type: "record",
      key: "tid",
      record: {
        type: "object",
        required: ["title", "artist", "createdAt"],
        properties: {
          title:     { type: "string", maxLength: 500 },
          artist:    { type: "string", maxLength: 500 },
          references: {
            type: "array",
            items: {
              type: "object",
              required: ["label", "url"],
              properties: {
                label: { type: "string", maxLength: 100 },
                url:   { type: "string", format: "uri" }
              }
            }
          },
          createdAt: { type: "string", format: "datetime" }
        }
      }
    }
  }
}
```

`references` is an optional array of `{label, url}` — Spotify, YouTube, original recording, lyrics, whatever the admin wants to give participants. Optional in v1; can extend later.

### P0.6 — Write path from EPTSS web app to admin PDS

The EPTSS web app server needs an authenticated `@atproto/api` client acting as the admin DID. Options:

| Option | How | Pros | Cons |
|---|---|---|---|
| **Persistent app password** | Store an app password for admin DID in env vars; create a session at request time | Simple, no OAuth dance | App passwords are scoped less granularly; rotation is manual |
| **Server-side OAuth** | Admin DID OAuth flow; persist refresh tokens in DB; refresh on demand | Proper auth, refreshable | Server-side OAuth for ATProto is less standard; more code |
| **Per-request admin OAuth in browser** | Human admin logs in as admin DID in browser; writes from client | No server-side admin credentials | Conflates human admin with service DID; awkward if multiple humans admin |

**Recommendation**: app password for v1. The admin DID is genuinely a service identity, not a human. App password + env var matches that mental model. Migrate to OAuth if/when bsky deprecates app passwords or scope granularity matters.

### P0.7 — TypeScript type sharing (still open)

JSON publication is solved (P0.3). The remaining piece is **how EPTSS code gets TS types** for both `at.atjam.*` (defined upstream in atjam) and `site.eptss.*` (defined locally).

Options:

| Approach | Mechanism | Trade-off |
|---|---|---|
| **Vendor atjam's `src/*.ts`** | Copy the TS files from `atjam/lexicons/src/` into EPTSS's `packages/atproto-lexicons/src/atjam/` | Simple, no publish pipeline; drift risk while atjam is pre-v1 |
| **npm publish `@atjam/lexicons`** | Flip `private: true` off, publish on each lexicon change | Standard JS dep flow; adds a publish step + version coordination |
| **Generate from JSON locally with `@atproto/lex-cli`** | EPTSS pulls atjam's JSON (via submodule or copy) and regens TS in its own package | No type sync at all — types regenerate per build. More tooling. |

**Recommendation for v1**: vendor atjam's `src/*.ts` into the new EPTSS package. atjam is pre-v1 and unstable; explicit copy-and-track is more honest than chasing version pins. Revisit when atjam stabilizes.

EPTSS's own `site.eptss.*` JSON lives next to it: `packages/atproto-lexicons/site/eptss/*.json` with matching TS files in `packages/atproto-lexicons/src/eptss/`.

## Inputs (form fields)

The admin "create round" form (likely lives at `apps/web/app/admin/rounds/create` or as a modal in the existing rounds page) collects:

| Field | Type | Maps to |
|---|---|---|
| Song title | string | `site.eptss.song.title` + Postgres `songs.title` |
| Song artist | string | `site.eptss.song.artist` + Postgres `songs.artist` |
| Song references (optional) | array of `{label, url}` | `site.eptss.song.references` |
| Round slug | string | `at.atjam.round.name` (probably; could also stuff into rkey) + Postgres `round_metadata.slug` |
| Signup opens | datetime | `at.atjam.round.milestones[0]` + Postgres `signupOpens` |
| Voting opens | datetime | `at.atjam.round.milestones[1]` + Postgres `votingOpens` |
| Covering begins | datetime | `at.atjam.round.milestones[2]` + Postgres `coveringBegins` |
| Covers due | datetime | `at.atjam.round.milestones[3]` + Postgres `coversDue` |
| Listening party | datetime | `at.atjam.round.milestones[4]` + Postgres `listeningParty` |
| Playlist URL (optional, can defer) | string | Postgres only (`playlistUrl`); not on ATProto record at creation time |

## Records written

### `site.eptss.song` (on admin PDS)

```ts
{
  $type: "site.eptss.song",
  title: "<form input>",
  artist: "<form input>",
  references: [/* optional, from form */],
  createdAt: "<now ISO>"
}
```

AT URI: `at://<admin-did>/site.eptss.song/<tid-rkey>`

### `at.atjam.round` (on admin PDS)

```ts
{
  $type: "at.atjam.round",
  jam: {
    uri: "at://<admin-did>/at.atjam.jam/eptss",
    cid: "<cid of jam record>"
  },
  name: "<form: round slug>",
  assignment: "Cover this song before the deadline.",  // generic template; could be customized per round
  subject: {
    $type: "site.eptss.song",  // discriminator for atjam's `unknown`-typed subject
    uri: "at://<admin-did>/site.eptss.song/<tid-rkey>",
    cid: "<cid of song record>"
  },
  acceptedSubmissionTypes: ["fm.plyr.track"],  // pending decision #7; see below
  // Labels use kebab-case. atjam's lexicon defines knownValues:
  //   "signup-deadline", "submission-deadline", "closing-event", "results"
  // Unknown labels are accepted (lexicon explicitly permits) for EPTSS-specific phases.
  milestones: [
    { label: "signup-opens",       date: "<signupOpens ISO>" },
    { label: "voting-opens",       date: "<votingOpens ISO>" },
    { label: "covering-begins",    date: "<coveringBegins ISO>" },
    { label: "submission-deadline", date: "<coversDue ISO>" },        // known value
    { label: "closing-event",      date: "<listeningParty ISO>" }     // known value
  ],
  createdAt: "<now ISO>"
}
```

**Open question on `acceptedSubmissionTypes`**: atjam's lexicon expects an array of `$type` NSIDs that the `payload` can be. For EPTSS that's whatever the audio payload resolves to (`fm.plyr.track` or `site.eptss.cover`). Cannot be filled in until decision #7 lands. Placeholder: `["fm.plyr.track"]` if we're committing to plyr.fm coupling.

AT URI: `at://<admin-did>/at.atjam.round/<tid-rkey>` — this is what every signup/submission for this round will strong-ref.

## Postgres dual-write

The web app continues to write to Postgres for v1 — Postgres remains the read source for all existing pages until those are migrated.

```sql
-- Inside a single transaction:
INSERT INTO songs (id, title, artist, created_at) VALUES (...) RETURNING id;
INSERT INTO round_metadata (
  id, project_id, slug, song_id,
  signup_opens, voting_opens, covering_begins, covers_due, listening_party,
  created_at
) VALUES (...);
```

Plus two new columns to track the ATProto record URIs for reconciliation:

```sql
ALTER TABLE songs ADD COLUMN at_uri text;             -- e.g. at://did:plc:.../site.eptss.song/abc
ALTER TABLE songs ADD COLUMN at_cid text;
ALTER TABLE round_metadata ADD COLUMN at_uri text;    -- e.g. at://did:plc:.../at.atjam.round/abc
ALTER TABLE round_metadata ADD COLUMN at_cid text;
```

(Or a separate `atproto_record_refs` table if we want to keep the existing tables clean — TBD.)

## Write sequence

```
admin clicks "Create Round"
        │
        ▼
┌──────────────────────────────────────────────────┐
│  Server action: createRound(formData)            │
└──────────────────────────────────────────────────┘
        │
        ├─► Validate form against zod schema
        │
        ├─► [1] Write site.eptss.song to admin PDS
        │       → returns { uri, cid }
        │
        ├─► [2] Write at.atjam.round to admin PDS
        │       (using song uri/cid from step 1 in subject)
        │       → returns { uri, cid }
        │
        ├─► [3] BEGIN TRANSACTION
        │       INSERT INTO songs (...)         -- with at_uri/at_cid from [1]
        │       INSERT INTO round_metadata (..) -- with at_uri/at_cid from [2]
        │       COMMIT
        │
        └─► Redirect to admin rounds list
```

## Failure modes

Each step can fail. ATProto writes are not transactional with Postgres. Mitigation:

| Failure | Effect | Mitigation |
|---|---|---|
| Step 1 fails (song write) | No records anywhere. User sees error. | Show error, retry safe. |
| Step 2 fails (round write) | Orphan song record on PDS. | Either: (a) leave it — orphan songs are harmless; (b) delete the song record (`deleteRecord`) in a catch block. |
| Step 3 fails (Postgres) | Records exist on PDS, but EPTSS app can't see the round. | Background reconciler pulls admin PDS, inserts missing rows. Same reconciler addresses any drift. |

**Recommendation**: log all three step results to a `atproto_write_log` table for debugging + reconciliation. Don't try to be clever about rollback in v1 — orphan records are cheap.

## UI changes

Current state: `apps/web/app/admin/rounds/page.tsx` has the rounds management UI. Round creation is presumably… we need to check. May be a modal, may be a sub-route, may not exist (rounds might currently be created via SQL or a script).

**To verify before implementing**:
- Does a "create round" UI exist today?
- If yes — where and what's its current flow?
- If no — design from scratch, likely a new route `apps/web/app/admin/rounds/create/page.tsx`.

Either way, the new flow wraps a server action that does the 3-step sequence above.

## Open questions specific to round creation

1. **Rkey strategy for rounds**: TID (timestamp-based, default) vs. meaningful (e.g. `round-26`). Meaningful rkeys make AT URIs more readable but require checking for collisions. Recommend TID for v1.
2. **`assignment` field content**: generic template ("Cover this song before the deadline") or customizable per round? Probably customizable, with a sensible default.
3. **Multi-project support**: EPTSS schema has `projectId` on `round_metadata`. After archiving Original Songs there's only Cover Songs, but the schema supports more projects. Does each project get its own `at.atjam.jam` record? Yes — one jam per project, but for v1 we only have one (`eptss`).
4. **Round update / edit**: out of scope for round creation, but worth noting — ATProto `putRecord` allows updates. Edits to milestones, etc. would update both the record (`putRecord`) and Postgres. Reconciliation matters more for edits than creation.
5. **Idempotency**: if the admin double-clicks "Create" do we get two rounds? Form submission lock + server-side check for existing record with same `slug` for same project.

## What ships in this phase

- [ ] P0.1 — Admin DID provisioned (`did:plc:...`, handle resolves, PDS reachable)
- [ ] P0.2 — `@atjam/lexicons` consumable by EPTSS (or vendor decision made)
- [ ] P0.3 — `publish-lexicon.ts` script ported to EPTSS monorepo; run against `site.eptss.song` JSON to publish to admin DID's `com.atproto.lexicon.schema` collection
- [ ] P0.4 — `at.atjam.jam` record for EPTSS written (one-shot script, similar shape)
- [ ] P0.5 — `site.eptss.song` lexicon JSON in `packages/atproto-lexicons/site/eptss/`
- [ ] P0.6 — Admin DID app password wired into server env (and `.env.example`)
- [ ] P0.7 — Workspace package `packages/atproto-lexicons/` exists with atjam types vendored + EPTSS types defined
- [ ] Postgres migration: add `at_uri`/`at_cid` columns to `songs` and `round_metadata`
- [ ] Server action `createRound` implementing the 3-step write sequence
- [ ] Admin UI: round creation form (verify whether one exists today first)
- [ ] `atproto_write_log` table + observability hook for failed writes
- [ ] Smoke test: create a test round end-to-end on a dev admin DID

## What this phase does *not* do

- No reads from ATProto yet. EPTSS UI still reads Postgres exclusively.
- No user-side writes. Signups/submissions still hit Postgres only.
- No Constellation integration.
- No voting on-protocol (voting is private; only result will eventually be on-protocol).
- No identity bridging — admin DID is a service account, not tied to a human user.

Those come in subsequent phases.
