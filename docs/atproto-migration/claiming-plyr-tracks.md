# Claiming plyr.fm Tracks — Resolved

The sibling of [claiming backfilled submissions](./claiming-the-form.md). A cover
re-hosted to plyr is two records: an `at.atjam.submission` (the claimable artifact)
**and** an `fm.plyr.track` whose audio streams from plyr's R2. Claiming the
submission re-homes the first; this doc is about the second — getting a
participant's *plyr track* attributed to **their own** plyr identity, with them
OAuth'd as themselves.

**Status: solved, and far simpler than first feared.** The in-app OAuth re-home
(record duplication) is sufficient on its own. Verified live (June 2026): after the
profile "Move plyr track to my PDS" button wrote `fm.plyr.track` records into a
user's repo, plyr's firehose indexer — after a short lag — created
`audio_storage: r2`, user-owned tracks for them (`artist_did` = the user, real
`r2_url`), with **no plyr token, no re-upload, and no `audioBlob`**.

---

## The Form

Three sentences, same shape as the submission Form:

1. Every re-hosted cover is an `fm.plyr.track` in **its author's repo**, with plyr's
   `artist_did` equal to that author, streaming from plyr's R2.
2. The cover's `at.atjam.submission` reaches its audio by **strong-ref to that
   track** — no Postgres pointer stands between them.
3. Attribution is **intrinsic**: the track's repo DID *is* the artist, on plyr and
   on the network alike.

> **When the move is done, nothing in either system remembers it happened.**

---

## How it actually works

A re-hosted cover's audio already lives on plyr's R2 — the admin's migration upload
put it there — and the `fm.plyr.track` record carries that R2 URL in `audioUrl`. So
claiming is pure record movement:

1. The user, OAuth'd as themselves, `putRecord`s a copy of the `fm.plyr.track` into
   their own repo (same `audioUrl` + metadata; `artist` re-stamped to them). EPTSS's
   existing atproto OAuth — with `fm.plyr.track` added to its scope — is all that's
   needed.
2. plyr's firehose indexer sees the new record and, because its `audioUrl` already
   points at audio on R2, attaches a new track row to that existing R2 object,
   attributed to the record's repo DID. (Lag: minutes, eventually-consistent.)
3. The round page resolves the embed by querying plyr for the user's DID → the new
   track → the branded player plays under the user.

The audio never moves; only the attribution does. No upload, no transcode-by-us, no
admin token. The admin's original track still exists (same R2 file) — harmless, and
removable later via `migrate-to-plyr.ts --purge` if we want the Form's single copy.

---

## What we feared vs. what was true

A too-early check showed plyr *not* listing the re-homed records, which sent us down
a long path of wrong assumptions. The verified result corrects them — recorded here
so we don't re-derive the same mistakes:

| Feared | Actually |
|---|---|
| Copying the record can't move plyr ownership — `artist_did` stays admin. | plyr **re-attributes** via the firehose record; the new track's `artist_did` is the user. |
| A track only gets R2 via `POST /tracks/`; a PDS-native record stays `audio_storage: pds`. | True only for *new* audio. When `audioUrl` already points at R2, the ingested record becomes `audio_storage: r2`. |
| Global content dedup blocks it. | Dedup only rejects **file uploads** of duplicate bytes. A *record* referencing existing R2 doesn't dedup — plyr mints a second track row on the same file. |
| Needs a plyr token / delegated upload / OAuth client. | Not for claiming. The atproto OAuth record write is enough. |

The lesson: don't conclude from one read of an eventually-consistent index.

---

## The one residual boundary — *new* uploads

All of the above works **because the audio is already on plyr's R2.** A genuinely
new track — audio that has never been uploaded to plyr (e.g. a future EPTSS
submission that never went through the migration) — has no R2 object for a record to
point at, so it still needs a real upload through `POST api.plyr.fm/tracks/`. That
endpoint is authorized by a **plyr** developer token (plyr.fm/portal,
`Authorization: Bearer`), not EPTSS's atproto OAuth — confirmed against plyr's
OpenAPI spec and the `plyrfm` Python SDK, neither of which exposes a third-party
OAuth/token-delegation flow. Making that path in-app would need plyr to add
delegated upload. **That is a separate question from claiming, and not a blocker for
it.**

---

## What's built

- **OAuth scope** (`apps/web/lib/atproto/metadata.ts`) includes `fm.plyr.track`; the
  OAuth client cache is keyed by scope (`client.ts`) so scope edits take effect.
  Existing links must re-link once to pick up the grant — the action detects a scope
  denial and prompts a re-link (`AtprotoLinkSection`).
- **`rehomePlyrTrack` / `undoRehomePlyrTrack`** (`apps/web/lib/atproto/plyr-actions.ts`):
  copy the admin's `fm.plyr.track` (its R2 `audioUrl` + metadata, `artist`
  re-stamped) into the user's repo, read it back, repoint the Postgres
  `plyr_track_uri` pointer. Reversible — the admin copy is untouched, and Undo
  removes the user copy.
- **Profile UI**: per-cover "Move plyr track to my PDS" / "Undo" control
  (`PlyrRehomeButton`, via `MyCoversSection`'s `renderPlyrAction` slot).

The `plyr_track_uri` / `plyr_track_cid` columns and per-DID embed resolution remain
scaffolding (like `claimed_at_uri`): in the Form the submission strong-refs its
track and no Postgres pointer stands between them.
