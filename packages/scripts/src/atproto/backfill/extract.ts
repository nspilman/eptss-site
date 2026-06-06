/**
 * Extract historical round data from the EPTSS Postgres DB into a plain,
 * typed shape (`RoundExport`) — the input the transform turns into atjam
 * lexicon records. No ATProto here; this is pure read + reshape so it's
 * easy to inspect and test.
 *
 * One `round_metadata` row is one round. Hanging off it:
 *   - chosen song   (round_metadata.song_id → songs)
 *   - signups       (sign_ups → suggested songs, with counts)
 *   - vote results  (song_selection_votes → per-song avg + count)
 *   - submissions   (submissions → audio URL + submitter)
 *
 * Child rows are bulk-fetched once and grouped in memory rather than per-round
 * N+1 queries.
 */
import {
  db,
  roundMetadata,
  songs,
  signUps,
  songSelectionVotes,
  submissions,
  roundPrompts,
  users,
  COVER_PROJECT_ID,
  ORIGINAL_PROJECT_ID,
  eq,
  inArray,
} from "@eptss/db";

export interface SongRef {
  title: string;
  artist: string;
}

/** A song people signed up suggesting, and how many signed up with it. */
export interface SignupSong extends SongRef {
  count: number;
}

/**
 * Aggregate vote result for one candidate song (no per-voter data). Stores the
 * integer `total` (sum of scores) + `count` rather than a float average:
 * ATProto records are DAG-CBOR, which forbids floats. average = total/count,
 * computed by readers at display time.
 */
export interface VoteResult extends SongRef {
  total: number;
  count: number;
}

export interface SubmissionExport {
  id: number;
  userId: string;
  username: string | null;
  /** audio_file_url ?? soundcloud_url — null when neither is set. */
  url: string | null;
  note: string | null;
  createdAt: Date;
}

export interface RoundExport {
  id: number;
  slug: string | null;
  createdAt: Date | null;
  chosenSong: SongRef | null;
  promptText: string | null;
  playlistUrl: string | null;
  signupOpens: Date | null;
  votingOpens: Date | null;
  coveringBegins: Date | null;
  coversDue: Date | null;
  listeningParty: Date | null;
  signups: SignupSong[];
  voteResults: VoteResult[];
  submissions: SubmissionExport[];
}

export const PROJECT_IDS = {
  cover: COVER_PROJECT_ID,
  originals: ORIGINAL_PROJECT_ID,
} as const;
export type ProjectKey = keyof typeof PROJECT_IDS;

export async function extractRounds(opts?: {
  project?: ProjectKey;
  roundIds?: number[];
}): Promise<RoundExport[]> {
  const projectId = PROJECT_IDS[opts?.project ?? "cover"];

  // Songs are a small table — load once into a lookup.
  const songRows = await db.select().from(songs);
  const songMap = new Map<number, SongRef>(
    songRows.map((s) => [s.id, { title: s.title, artist: s.artist }]),
  );

  // Rounds for the project (optionally narrowed to specific IDs).
  let roundRows = await db
    .select()
    .from(roundMetadata)
    .where(eq(roundMetadata.projectId, projectId))
    .orderBy(roundMetadata.id);
  if (opts?.roundIds?.length) {
    const want = new Set(opts.roundIds);
    roundRows = roundRows.filter((r) => want.has(r.id));
  }
  const roundIds = roundRows.map((r) => r.id);
  if (roundIds.length === 0) return [];

  // Bulk child fetches (one query each, grouped in memory below).
  const signupRows = await db
    .select()
    .from(signUps)
    .where(inArray(signUps.roundId, roundIds));
  const voteRows = await db
    .select()
    .from(songSelectionVotes)
    .where(inArray(songSelectionVotes.roundId, roundIds));
  const promptRows = await db
    .select()
    .from(roundPrompts)
    .where(inArray(roundPrompts.roundId, roundIds));
  const submissionRows = await db
    .select({
      id: submissions.id,
      userId: submissions.userId,
      username: users.username,
      audioFileUrl: submissions.audioFileUrl,
      soundcloudUrl: submissions.soundcloudUrl,
      additionalComments: submissions.additionalComments,
      createdAt: submissions.createdAt,
      roundId: submissions.roundId,
    })
    .from(submissions)
    .leftJoin(users, eq(submissions.userId, users.userid))
    .where(inArray(submissions.roundId, roundIds));

  // signups → distinct suggested songs + counts, per round.
  const signupsByRound = new Map<number, Map<number, number>>();
  for (const s of signupRows) {
    if (s.songId == null) continue;
    const m = signupsByRound.get(s.roundId) ?? new Map<number, number>();
    m.set(s.songId, (m.get(s.songId) ?? 0) + 1);
    signupsByRound.set(s.roundId, m);
  }

  // votes → per round, per song, the list of scores (aggregated below).
  const votesByRound = new Map<number, Map<number, number[]>>();
  for (const v of voteRows) {
    if (v.roundId == null || v.songId == null) continue;
    const m = votesByRound.get(v.roundId) ?? new Map<number, number[]>();
    const arr = m.get(v.songId) ?? [];
    arr.push(v.vote);
    m.set(v.songId, arr);
    votesByRound.set(v.roundId, m);
  }

  // First prompt per round wins (rounds usually have one).
  const promptByRound = new Map<number, string>();
  for (const p of promptRows) {
    if (!promptByRound.has(p.roundId)) promptByRound.set(p.roundId, p.promptText);
  }

  const submissionsByRound = new Map<number, SubmissionExport[]>();
  for (const s of submissionRows) {
    const list = submissionsByRound.get(s.roundId) ?? [];
    list.push({
      id: s.id,
      userId: s.userId,
      username: s.username ?? null,
      url: s.audioFileUrl ?? s.soundcloudUrl ?? null,
      note: s.additionalComments ?? null,
      createdAt: s.createdAt,
    });
    submissionsByRound.set(s.roundId, list);
  }

  return roundRows.map((r) => {
    const signupsMap = signupsByRound.get(r.id) ?? new Map<number, number>();
    const signups: SignupSong[] = [...signupsMap.entries()]
      .map(([songId, count]) => {
        const song = songMap.get(songId);
        return song ? { ...song, count } : null;
      })
      .filter((x): x is SignupSong => x !== null)
      .sort((a, b) => b.count - a.count);

    const votesMap = votesByRound.get(r.id) ?? new Map<number, number[]>();
    const voteResults: VoteResult[] = [...votesMap.entries()]
      .map(([songId, votes]) => {
        const song = songMap.get(songId);
        if (!song) return null;
        // Integer total (sum) + count — no float average, which DAG-CBOR
        // rejects. Readers compute total/count for display.
        const total = votes.reduce((a, b) => a + b, 0);
        return { ...song, total, count: votes.length };
      })
      .filter((x): x is VoteResult => x !== null)
      // Highest average first (total/count avoids a stored float).
      .sort((a, b) => b.total / b.count - a.total / a.count);

    return {
      id: r.id,
      slug: r.slug ?? null,
      createdAt: r.createdAt ?? null,
      chosenSong: r.songId != null ? songMap.get(r.songId) ?? null : null,
      promptText: promptByRound.get(r.id) ?? null,
      playlistUrl: r.playlistUrl ?? null,
      signupOpens: r.signupOpens ?? null,
      votingOpens: r.votingOpens ?? null,
      coveringBegins: r.coveringBegins ?? null,
      coversDue: r.coversDue ?? null,
      listeningParty: r.listeningParty ?? null,
      signups,
      voteResults,
      submissions: submissionsByRound.get(r.id) ?? [],
    };
  });
}
