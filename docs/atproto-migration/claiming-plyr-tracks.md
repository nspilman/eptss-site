# Claiming plyr.fm Tracks — Resolved

The sibling of [claiming backfilled submissions](./claiming-the-form.md). A cover
re-hosted to plyr is two records: an `at.atjam.submission` (the claimable artifact)
**and** an `fm.plyr.track` whose audio streams from plyr's R2. Claiming the
submission re-homes the first; this doc is about the second — getting a
participant's *plyr track* into **their own** repo, attributed to their own
identity, with them OAuth'd as themselves.

**Status: solved — automatic on link.** When a member links their Bluesky account,
the link→migrate run (`RecordMigration`, the full-screen modal) claims each cover,
and each claim lands the cover's plyr track in the member's repo via
`ensurePlyrTrackForCover` (`apps/web/lib/atproto/plyr-user-track.ts`). There is no
button and no manual step; a member whose track didn't make it home (e.g. a
mid-claim upload failure) is topped up on their next visit — the claim self-heals.

---

## The Form

Three sentences, same shape as the submission Form:

1. Every re-hosted cover is an `fm.plyr.track` in **its author's repo**, with plyr's
   `artist_did` equal to that author.
2. The cover's `at.atjam.submission` reaches its audio by **strong-ref to that
   track** (`payload`).
3. Attribution is **intrinsic**: the track's repo DID *is* the artist, on plyr and
   on the network alike.

---

## How it works — "both" storage

The user's track is written over their own atproto OAuth session (the
`fm.plyr.track` repo scope + blob upload their link grants):

1. The cover's original audio is downloaded and **`uploadBlob`'d into the USER's
   PDS** — self-custody of the bytes. Per plyr's lexicon, `audioBlob` is the
   canonical source.
2. The record **also carries `audioUrl`** — the existing R2 object the admin
   migration minted — plus `duration`. This is load-bearing: plyr's ingester does
   NOT transcode a bare PDS blob to R2 (a blob-only record stays
   `audio_storage: "pds"`, gets no `r2_url`, and the embed shows NaN:NaN). Carrying
   the R2 url makes the ingested track `audio_storage: "both"` — user-custodied
   bytes, clean R2 playback.
3. `imageUrl` carries the plyr-hosted cover art from `plyr_cover_image_url` — the
   only image origin plyr's ingester trusts (anything else is stripped on ingest).
4. plyr's firehose indexes the record under the user's DID; the branded embed
   resolves under them.

The EPTSS scaffold record stays behind as a backup and as the source the claim
harvests the R2 url + duration from. **Purge caveat:** user records reference the
*admin's* R2 objects — any future `migrate-to-plyr.ts --purge` must spare R2
objects that user records still point at, or their `r2_url` playback 404s.

---

## History — the record-duplication era

The first solution (verified live, June 2026) simply **copied** the admin's record
into the user's repo pointing at the same R2 url — no upload, no blob. That
verification corrected a chain of wrong assumptions, recorded here so we don't
re-derive them:

| Feared | Actually |
|---|---|
| Copying the record can't move plyr ownership — `artist_did` stays admin. | plyr **re-attributes** via the firehose record; the new track's `artist_did` is the user. |
| A track only gets R2 via `POST /tracks/`; a PDS-native record stays `audio_storage: pds`. | True only for *new* audio. When `audioUrl` already points at R2, the ingested record becomes `audio_storage: r2`. |
| Global content dedup blocks it. | Dedup only rejects **file uploads** of duplicate bytes. A *record* referencing existing R2 doesn't dedup. |
| Needs a plyr token / delegated upload / OAuth client. | Not for claiming. The atproto OAuth record write is enough. |

The lesson stands: don't conclude from one read of an eventually-consistent index.

It shipped as a manual per-cover "Move plyr track to my PDS" button, and was
retired when the automatic claim adopted "both"-storage: the copy gave the user the
*record* but not the *bytes*; the upload path gives both, and it runs without a
click. (The dedup lesson lives on in code — `migrate-to-plyr` recovers and
re-associates when plyr rejects a re-upload of bytes it already stores.)

---

## New uploads — no migration at all

Future rounds need none of this. Members upload directly to plyr under their own
account and paste the track link into the submit form, which resolves it to the
`fm.plyr.track` already in their repo and writes the `at.atjam.submission` with
`payload` → that track (`apps/web/lib/atproto/submit-actions.ts`). Born owned;
nothing to claim.

---

## What's built

- **OAuth scope** (`apps/web/lib/atproto/metadata.ts`) includes `fm.plyr.track` +
  blob upload; the OAuth client cache is keyed by scope (`client.ts`), so a link
  made before the scope existed must re-link once.
- **`ensurePlyrTrackForCover`** (`apps/web/lib/atproto/plyr-user-track.ts`):
  download the original audio → `uploadBlob` into the user's PDS → `createRecord`
  with `audioBlob` + the scaffold's `audioUrl` + `duration` + trusted `imageUrl` →
  repoint `plyr_track_uri`.
- **Self-healing claim** (`claim-actions.ts`): an already-claimed cover whose track
  still sits on the EPTSS scaffold is topped up — track homed, submission `payload`
  re-stamped — gated on ownership so it never duplicates.
- **`RecordMigration`** (`apps/web/components/RecordMigration/`): the auto-run on
  link — a full-screen modal while each record lands, an inline card for a linked
  revisit with un-migrated records.

The `plyr_track_uri`/`plyr_track_cid` columns still do double duty (live-embed
source *and* ownership marker) — retiring that, by reading the deliverable from the
submission's `payload`, is the remaining structural work (tasks #174–176).
