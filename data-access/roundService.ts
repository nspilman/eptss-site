"use server";

import { defaultDateString } from "@/constants";
import { db } from "@/db";
import { roundMetadata, songs, songSelectionVotes } from "@/db/schema";
import { eq, gte, lte, asc, desc, and, or, count, sql, avg } from "drizzle-orm";

export interface Round {
  roundId: number;
  signupOpens: string;
  votingOpens: string;
  coveringBegins: string;
  coversDue: string;
  listeningParty: string;
  typeOverride?: string;
  song: { artist: string; title: string };
}


export const getCurrentRoundId = async () => {
  const currentRound = await db.select({ id: roundMetadata.id }).from(roundMetadata)
    .where(
      and(
        lte(roundMetadata.votingOpens, new Date()),
        gte(roundMetadata.listeningParty, new Date())
      )
    )
    .orderBy(desc(roundMetadata.votingOpens))
    .limit(1);
  return currentRound.length ? currentRound[0].id : -1;
};

export const getRoundById = async (roundId: number) => {
  const roundData = await db
    .select({
      id: roundMetadata.id,
      signupOpens: roundMetadata.signupOpens,
      votingOpens: roundMetadata.votingOpens,
      coveringBegins: roundMetadata.coveringBegins,
      coversDue: roundMetadata.coversDue,
      listeningParty: roundMetadata.listeningParty,
      // typeOverride: roundMetadata.roundTypeOverride,
      playlistUrl: roundMetadata.playlistUrl,
      song: { title: songs.title, artist: songs.artist },
    })
    .from(roundMetadata)
    .where(eq(roundMetadata.id, roundId))
    .leftJoin(songs, eq(roundMetadata.songId, songs.id));

  if (roundData.length) {
    const {
      id,
      signupOpens,
      votingOpens,
      coveringBegins,
      coversDue,
      listeningParty,
      // typeOverride,
      playlistUrl,
      song,
    } = roundData[0];

    return {
      roundId: id,
      signupOpens: signupOpens || defaultDateString,
      votingOpens: votingOpens || defaultDateString,
      coveringBegins: coveringBegins || defaultDateString,
      coversDue: coversDue || defaultDateString,
      listeningParty: listeningParty || defaultDateString,
      // typeOverride: typeOverride || undefined,
      playlistUrl: playlistUrl || "",
      song: song || { artist: "", title: "" },
    };
  }
};

export const getCurrentRound = async () => {
  return await getRoundById(await getCurrentRoundId());
};

export const getCurrentAndFutureRounds = async () => {
  const rounds = await db
    .select()
    .from(roundMetadata)
    .where(gte(roundMetadata.id, await getCurrentRoundId()))
    .orderBy(asc(roundMetadata.id));

    const defaultDate = new Date(defaultDateString)
  return rounds.map(round => ({
    roundId: round.id,
    signupOpens: round.signupOpens || defaultDate,
    votingOpens: round.votingOpens || defaultDate,
    coveringBegins: round.coveringBegins ||defaultDate,
    coversDue: round.coversDue || defaultDate,
    listeningParty: round.listeningParty || defaultDate,
    // typeOverride: round.roundTypeOverride || undefined,
    playlistUrl: round.playlistUrl || "",
    song: { artist: "", title: "" },
  }));
};

export const getCurrentAndPastRounds = async () => {
  const rounds = await db
    .select({
      id: roundMetadata.id,
      signupOpens: roundMetadata.signupOpens,
      votingOpens: roundMetadata.votingOpens,
      coveringBegins: roundMetadata.coveringBegins,
      coversDue: roundMetadata.coversDue,
      listeningParty: roundMetadata.listeningParty,
      playlistUrl: roundMetadata.playlistUrl,
      song: { title: songs.title, artist: songs.artist },
    })
    .from(roundMetadata)
    .leftJoin(songs, eq(roundMetadata.songId, songs.id))
    .where(
      or(
        lte(roundMetadata.id, await getCurrentRoundId()),
        lte(roundMetadata.votingOpens, new Date())
      )
    )
    .orderBy(desc(roundMetadata.id));

  return rounds.map(round => ({
    roundId: round.id,
    signupOpens: round.signupOpens || defaultDateString,
    votingOpens: round.votingOpens || defaultDateString,
    coveringBegins: round.coveringBegins || defaultDateString,
    coversDue: round.coversDue || defaultDateString,
    listeningParty: round.listeningParty || defaultDateString,
    playlistUrl: round.playlistUrl || "",
    song: round.song || { artist: "", title: "" },
  }));
};

export const getAllRoundIds = async () => {
  const rounds = await db
    .select({ id: roundMetadata.id })
    .from(roundMetadata)
    .orderBy(asc(roundMetadata.id));

    
  return rounds.map(round => round.id);
};

export const getVoteBreakdownBySong = async (roundId: number) => {
  const voteBreakdown = await db
    .select({
      title: songs.title,
      artist: songs.artist,
      oneCount: sql<number>`sum(case when ${songSelectionVotes.vote} = 1 then 1 else 0 end)`,
      twoCount: sql<number>`sum(case when ${songSelectionVotes.vote} = 2 then 1 else 0 end)`,
      threeCount: sql<number>`sum(case when ${songSelectionVotes.vote} = 3 then 1 else 0 end)`,
      fourCount: sql<number>`sum(case when ${songSelectionVotes.vote} = 4 then 1 else 0 end)`,
      fiveCount: sql<number>`sum(case when ${songSelectionVotes.vote} = 5 then 1 else 0 end)`,
    })
    .from(songSelectionVotes)
    .leftJoin(songs, eq(songSelectionVotes.songId, songs.id))
    .where(eq(songSelectionVotes.roundId, roundId))
    .groupBy(songs.title, songs.artist)
    .orderBy(desc(avg(songSelectionVotes.vote)))

  return voteBreakdown.map(row => ({
    title: row.title || "",
    artist: row.artist || "",
    oneCount: Number(row.oneCount) || 0,
    twoCount: Number(row.twoCount) || 0,
    threeCount: Number(row.threeCount) || 0,
    fourCount: Number(row.fourCount) || 0,
    fiveCount: Number(row.fiveCount) || 0,
  }));
};

