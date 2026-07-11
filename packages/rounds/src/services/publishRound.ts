/**
 * The live mirror: publish one round's public state to the AT Protocol network
 * as EPTSS's own `at.atjam.round` record, automatically, at every lifecycle
 * moment (created / song chosen / updated). Postgres remains the app's source
 * of truth; this keeps the network copy current so nothing ever needs a manual
 * backfill again.
 *
 * Composition: a single-round Postgres extract → the shared record builder
 * (@eptss/atproto transformRound — the same one the historical backfill used)
 * → the pure-fetch admin writer (app-password session, putRecord upsert at the
 * stable `eptss-r<id>` rkey).
 *
 * PRIVACY GATE: the round's `selection` (candidate songs + vote aggregates) is
 * only included once the round HAS a chosen song — i.e. voting is settled.
 * Before that, publishing the candidate list would leak live nominations, so
 * the record carries only the public frame (name, assignment, milestones).
 * Individual ballots never appear in any state — only integer aggregates.
 *
 * Best-effort by construction: this NEVER throws. Missing env credentials
 * (ATPROTO_HANDLE / ATPROTO_APP_PASSWORD — e.g. local dev) or a network
 * failure logs and returns { ok: false }; the Postgres mutation it rides on
 * has already succeeded and must not be dragged down by the mirror.
 */
import {
  db,
  roundMetadata,
  songs,
  signUps,
  songSelectionVotes,
  roundPrompts,
  eq,
} from "@eptss/db";
import {
  transformRound,
  getJamRef,
  createAdminSession,
  putAdminRecord,
  type RoundExport,
  type SignupSong,
  type VoteResult,
  type SongRef,
} from "@eptss/atproto";

const ROUND_COLLECTION = "at.atjam.round";

export interface PublishRoundResult {
  ok: boolean;
  uri?: string;
  /** Why nothing was written — creds missing, round not found, record invalid… */
  reason?: string;
}

/** Flatten one round out of Postgres into the builder's input contract. */
async function getRoundExport(roundId: number): Promise<RoundExport | null> {
  const rows = await db
    .select()
    .from(roundMetadata)
    .where(eq(roundMetadata.id, roundId))
    .limit(1);
  const r = rows[0];
  if (!r) return null;

  let chosenSong: SongRef | null = null;
  if (r.songId != null) {
    const songRows = await db
      .select({ title: songs.title, artist: songs.artist })
      .from(songs)
      .where(eq(songs.id, r.songId))
      .limit(1);
    chosenSong = songRows[0] ?? null;
  }

  const promptRows = await db
    .select({ promptText: roundPrompts.promptText })
    .from(roundPrompts)
    .where(eq(roundPrompts.roundId, roundId))
    .limit(1);

  // The selection story (candidates + vote aggregates) — assembled only once the
  // song is chosen (see PRIVACY GATE above). Aggregates only, never ballots.
  let signupSongs: SignupSong[] = [];
  let voteResults: VoteResult[] = [];
  if (chosenSong) {
    const signupRows = await db
      .select({ songId: signUps.songId, title: songs.title, artist: songs.artist })
      .from(signUps)
      .innerJoin(songs, eq(signUps.songId, songs.id))
      .where(eq(signUps.roundId, roundId));
    const counts = new Map<number, SignupSong>();
    for (const s of signupRows) {
      if (s.songId == null) continue;
      const cur = counts.get(s.songId);
      if (cur) cur.count += 1;
      else counts.set(s.songId, { title: s.title, artist: s.artist, count: 1 });
    }
    signupSongs = [...counts.values()].sort((a, b) => b.count - a.count);

    const voteRows = await db
      .select({ songId: songSelectionVotes.songId, vote: songSelectionVotes.vote, title: songs.title, artist: songs.artist })
      .from(songSelectionVotes)
      .innerJoin(songs, eq(songSelectionVotes.songId, songs.id))
      .where(eq(songSelectionVotes.roundId, roundId));
    const tallies = new Map<number, VoteResult>();
    for (const v of voteRows) {
      if (v.songId == null) continue;
      const cur = tallies.get(v.songId);
      if (cur) {
        cur.total += v.vote;
        cur.count += 1;
      } else {
        tallies.set(v.songId, { title: v.title, artist: v.artist, total: v.vote, count: 1 });
      }
    }
    voteResults = [...tallies.values()].sort(
      (a, b) => b.total / b.count - a.total / a.count,
    );
  }

  return {
    id: r.id,
    slug: r.slug ?? null,
    createdAt: r.createdAt ?? null,
    chosenSong,
    promptText: promptRows[0]?.promptText ?? null,
    playlistUrl: r.playlistUrl ?? null,
    signupOpens: r.signupOpens ?? null,
    votingOpens: r.votingOpens ?? null,
    coveringBegins: r.coveringBegins ?? null,
    coversDue: r.coversDue ?? null,
    listeningParty: r.listeningParty ?? null,
    signups: signupSongs,
    voteResults,
    // The live mirror publishes the round only; submissions are their authors'
    // records (written natively at submit time, or via the claim flow).
    submissions: [],
  };
}

/**
 * Publish (upsert) one round's `at.atjam.round` record as EPTSS. Safe to call
 * after any round mutation — idempotent on the stable rkey, silent no-op when
 * publishing credentials aren't configured.
 */
export async function publishRoundToNetwork(
  roundId: number,
): Promise<PublishRoundResult> {
  try {
    const identifier = process.env.ATPROTO_HANDLE;
    const appPassword = process.env.ATPROTO_APP_PASSWORD;
    if (!identifier || !appPassword) {
      console.warn(
        `[publish-round] #${roundId} skipped — ATPROTO_HANDLE/ATPROTO_APP_PASSWORD not set`,
      );
      return { ok: false, reason: "credentials not configured" };
    }

    const exported = await getRoundExport(roundId);
    if (!exported) return { ok: false, reason: `round ${roundId} not found` };

    const jam = await getJamRef();
    if (!jam) return { ok: false, reason: "EPTSS jam record not on the network" };

    const transformed = transformRound(exported, { jam });
    if (!transformed.valid) {
      console.warn(
        `[publish-round] #${roundId} not publishable: ${transformed.warnings.join("; ")}`,
      );
      return { ok: false, reason: "record invalid (needs ≥1 milestone)" };
    }

    const session = await createAdminSession({
      identifier,
      appPassword,
      service: process.env.ATPROTO_SERVICE,
    });
    const ref = await putAdminRecord(session, {
      collection: ROUND_COLLECTION,
      rkey: transformed.rkey,
      record: transformed.record as unknown as Record<string, unknown>,
    });

    console.log(`[publish-round] #${roundId} -> ${ref.uri}`);
    return { ok: true, uri: ref.uri };
  } catch (err) {
    // The mirror must never take down the mutation it follows.
    console.error(`[publish-round] #${roundId} failed`, err);
    return { ok: false, reason: err instanceof Error ? err.message : "unknown error" };
  }
}
