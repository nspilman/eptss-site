# Retire the Postgres pointers (`plyr_track_uri`, `claimed_at_uri`)

**Status:** planned cleanup. Do NOT drop the columns yet — they are load-bearing
today (see "Why they're still load-bearing").

## The point

Two columns on `submissions` mirror facts that now live, authoritatively, in the
user's own AT Protocol repo:

| column | what it mirrors | where the truth now lives |
|---|---|---|
| `plyr_track_uri` / `plyr_track_cid` | the submission → plyr-track link | the `at.atjam.submission` record's **`payload`** strong-ref |
| `claimed_at_uri` / `claimed_at` | "this cover has been migrated, and here" | the **existence** of the user's own `at.atjam.submission/eptss-sub<id>` record |

This is the same derived-pointer pattern we already removed for **signups**, which
use repo-presence (`listRecordRkeys`) as the done-flag instead of a DB column. The
repo is the source of truth; these columns are caches that can drift.

The plyr rkey is an opaque TID (`3mnpfgggoeo22`), so *something* must map a
submission to its track — but `payload` already is that something. Two homes for one
link; `payload` is the atproto-native one.

## Why they're still load-bearing

The read/display layer does **not** read the user's own submission record. It reads:
- the **EPTSS scaffold** copy of the submission (via `getEptssData`), whose `payload`
  was never backfilled (it still carries the legacy `url`), and
- the **Postgres columns** — `applyClaims` re-homes reads through `claimed_at_uri`,
  and the round/profile pages resolve plyr embeds through `plyr_track_uri`.

So you can't simply drop the columns: reads would lose both the migrated-location and
the plyr-track link. The columns go away only as reads move onto the user's repo.

## Staged plan

1. **Backfill `payload` on the scaffold submissions.** Teach the backfill
   (`scripts/.../backfill`) to set `payload` from `plyr_track_uri` so the canonical
   scaffold copy matches the user copies. (This was already flagged as a follow-up.)
2. **Resolve plyr embeds from `submission.payload`,** not the column — in
   `app/atproto/round/[rkey]/page.tsx` and `dashboard/profile/page.tsx`
   (`resolvePlyrListenUrls`). Embeds derive from the record, not Postgres.
3. **Source claimed reads from the user's repo.** Have the read seam resolve a
   migrated cover from the user's own `eptss-sub<id>` record (presence + its content)
   rather than `applyClaims(claimed_at_uri)`. This retires `claimed_at_uri`'s read role.
4. **Drop the columns** once nothing reads them — `plyr_track_uri`/`plyr_track_cid`
   and `claimed_at_uri`/`claimed_at`. Keep one *only* if profiling shows per-view PDS
   reads are too slow, and then frame it explicitly as a **rebuildable cache**, not a
   source of truth.

## Guardrails / things not to break

- **Order matters:** reads must move (steps 1–3) *before* any column drop (step 4).
- **The TID rkey means `payload` is the only submission→track link** — never lose it
  on a record rewrite (re-home/undo already keep it in sync; preserve that).
- **Scripts reference the columns:** `migrate-to-plyr.ts` (sets `plyr_track_uri` +
  `plyr_cover_image_url`; clears all three on `--purge`), `reset-migration-for-user.ts
  --include-plyr` (clears `plyr_track_uri`/`cid`, *keeps* `plyr_cover_image_url`),
  `audit-legacy-migration.ts` (reads them). Update or retire alongside step 4.
- **Postgres rows remain the source of truth for everything non-atproto** (the
  `submissions`/`sign_ups` rows themselves). Only the *pointer columns* are derived.

## Note: the OAuth upload already shrinks this

The in-app upload now writes `fm.plyr.track` straight into the user's repo (uploadBlob
+ createRecord, no scaffold), so the whole "scaffold vs mine" re-home machinery —
`plyr_track_uri`'s biggest remaining job — is legacy-only for net-new covers. That
makes step 2 the high-value first move.

## Not on this list: `plyr_cover_image_url`

`plyr_cover_image_url` is **not** a derived pointer to retire — keep it. plyr's ingester
trusts an `imageUrl` only from its own host (`images.plyr.fm`), and only plyr's upload
API can mint one. So the trusted cover URL is a genuine fact with no atproto-native home
on the user's side; the in-app claim copies it onto the user's track. We store it in its
own column (rather than reading it live off `plyr_track_uri`'s record) precisely because
the claim overwrites that pointer — keeping the art-source there would lose it on the
first re-claim or reset. It's a **rebuildable cache** (re-run migrate-to-plyr repopulates
it), which is the framing step 4 reserves for any column worth keeping.
