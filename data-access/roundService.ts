"use server";

import { defaultDateString } from "@/constants";
import { db } from "@/db";
import { roundMetadata, songs, songSelectionVotes, signUps, submissions } from "@/db/schema";
import { eq, gte, asc, desc, and, or, sql, avg } from "drizzle-orm";
import { AsyncResult, createSuccessResult, createEmptyResult, createErrorResult } from '@/types/asyncResult';

export interface Round {
  roundId: number;
  signupOpens: Date;
  votingOpens: Date;
  coveringBegins: Date;
  coversDue: Date;
  listeningParty: Date;
  typeOverride?: string;
  playlistUrl: string;
  song: { artist: string; title: string };
  signupCount?: number;
  submissionCount?: number;
}

export const getCurrentRoundId = async (): Promise<AsyncResult<number>> => {
  try {
    const now = new Date();
    const nowStr = now.toISOString();

    const query = db.select({ id: roundMetadata.id }).from(roundMetadata)
      .where(
        and(
          sql`${roundMetadata.signupOpens} IS NOT NULL`,
          sql`${roundMetadata.listeningParty} IS NOT NULL`,
          sql`${roundMetadata.signupOpens} <= ${nowStr}`,
          sql`${roundMetadata.listeningParty} >= ${nowStr}`
        )
      )
      .orderBy(desc(roundMetadata.signupOpens))
      .limit(1);

    const currentRound = await query;

    if (!currentRound?.length) {
      return createEmptyResult('No current round found');
    }

    const roundId = currentRound[0].id;
    if (typeof roundId !== 'number') {
      return createErrorResult(new Error('Invalid round ID type'));
    }

    const result = createSuccessResult(roundId);
    return result;
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get current round ID'));
  }
};

export const getRoundById = async (roundId: number): Promise<AsyncResult<Round>> => {
  try {
    // Validate roundId is a valid number
    if (isNaN(roundId) || !Number.isFinite(roundId)) {
      return createErrorResult(new Error(`Invalid round ID: ${roundId}`));
    }

    const query = db
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
      .where(sql`${roundMetadata.id} = ${roundId}`)
      .leftJoin(songs, sql`${roundMetadata.songId} = ${songs.id}`);

    const roundData = await query;

    if (!roundData.length) {
      return createEmptyResult(`No round found with ID ${roundId}`);
    }

    const {
      id,
      signupOpens,
      votingOpens,
      coveringBegins,
      coversDue,
      listeningParty,
      playlistUrl,
      song,
    } = roundData[0];

    // Helper function to safely convert to Date
    const toDate = (value: Date | string | null) => {
      if (!value) return new Date(defaultDateString);
      return new Date(value);
    };

    const round: Round = {
      roundId: id,
      signupOpens: toDate(signupOpens),
      votingOpens: toDate(votingOpens),
      coveringBegins: toDate(coveringBegins),
      coversDue: toDate(coversDue),
      listeningParty: toDate(listeningParty),
      playlistUrl: playlistUrl ?? "",
      song: {
        artist: song?.artist ?? "",
        title: song?.title ?? "",
      },
    };

    const result = createSuccessResult(round);
    return result;
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to get round ${roundId}`));
  }
};

export const getCurrentRound = async (): Promise<AsyncResult<Round>> => {
  const currentRoundResult = await getCurrentRoundId();

  if (currentRoundResult.status !== 'success') {
    return createEmptyResult('No current round available');
  }

  const roundResult = await getRoundById(currentRoundResult.data);
  return roundResult;
};

export const getCurrentAndFutureRounds = async (): Promise<AsyncResult<Round[]>> => {
  try {
    const currentRoundResult = await getCurrentRoundId();
    if (currentRoundResult.status !== 'success') {
      return createEmptyResult('No current round available');
    }

    const rounds = await db
      .select()
      .from(roundMetadata)
      .where(gte(roundMetadata.id, currentRoundResult.data))
      .orderBy(asc(roundMetadata.id));

    if (!rounds.length) {
      return createEmptyResult('No future rounds found');
    }

    const defaultDate = new Date(defaultDateString);
    const mappedRounds = rounds.map(round => ({
      roundId: round.id,
      signupOpens: new Date(round.signupOpens || defaultDate),
      votingOpens: new Date(round.votingOpens || defaultDate),
      coveringBegins: new Date(round.coveringBegins || defaultDate),
      coversDue: new Date(round.coversDue || defaultDate),
      listeningParty: new Date(round.listeningParty || defaultDate),
      playlistUrl: round.playlistUrl || "",
      song: { artist: "", title: "" },
    }));

    return createSuccessResult(mappedRounds);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get current and future rounds'));
  }
};

export const getCurrentAndPastRounds = async (): Promise<AsyncResult<Round[]>> => {
  try {
    const currentRoundResult = await getCurrentRoundId();
    if (currentRoundResult.status !== 'success') {
      return createEmptyResult('No current round available');
    }

    const now = new Date();
    // Get all rounds first
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
          sql`${roundMetadata.id} <= ${currentRoundResult.data}`,
          sql`${roundMetadata.votingOpens} IS NOT NULL AND ${roundMetadata.votingOpens}::timestamp <= ${now.toISOString()}::timestamp`
        )
      )
      .orderBy(desc(roundMetadata.id));

    if (!rounds.length) {
      return createEmptyResult('No past rounds found');
    }

    const toDate = (value: Date | string | null) => {
      if (!value) return new Date(defaultDateString);
      return new Date(value);
    };

    // Now get counts for each round
    const roundsWithCounts = await Promise.all(
      rounds.map(async (round) => {
        // Get signup count
        const signupResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(signUps)
          .where(eq(signUps.roundId, round.id));
        
        // Get submission count
        const submissionResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(submissions)
          .where(eq(submissions.roundId, round.id));
        
        // Convert to number to ensure proper serialization
        const signupCount = Number(signupResult[0]?.count || 0);
        const submissionCount = Number(submissionResult[0]?.count || 0);
        
        return {
          ...round,
          signupCount,
          submissionCount,
        };
      })
    );

    const mappedRounds = roundsWithCounts.map(round => ({
      roundId: round.id,
      signupOpens: toDate(round.signupOpens),
      votingOpens: toDate(round.votingOpens),
      coveringBegins: toDate(round.coveringBegins),
      coversDue: toDate(round.coversDue),
      listeningParty: toDate(round.listeningParty),
      playlistUrl: round.playlistUrl ?? "",
      song: {
        artist: round.song?.artist ?? "",
        title: round.song?.title ?? "",
      },
      // Ensure these are serialized as numbers
      signupCount: Number(round.signupCount || 0),
      submissionCount: Number(round.submissionCount || 0),
    }));

    return createSuccessResult(mappedRounds);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get past rounds'));
  }
};

export const getAllRoundIds = async (): Promise<AsyncResult<number[]>> => {
  try {
    const rounds = await db
      .select({ id: roundMetadata.id })
      .from(roundMetadata)
      .orderBy(sql`${roundMetadata.id} ASC`);

    if (!rounds.length) {
      return createEmptyResult('No rounds found');
    }

    return createSuccessResult(rounds.map(round => round.id));
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get all round IDs'));
  }
};

export const getVoteBreakdownBySong = async (roundId: number) => {
  // Validate roundId is a valid number
  if (isNaN(roundId) || !Number.isFinite(roundId)) {
    console.error(`Invalid round ID passed to getVoteBreakdownBySong: ${roundId}`);
    return [];
  }
  
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

