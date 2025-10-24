"use server";

import { defaultDateString } from "@eptss/shared";
import { db } from "../db";
import { roundMetadata, songs, songSelectionVotes, signUps, submissions } from "../db/schema";
import { eq, gte, asc, desc, and, or, sql, avg } from "drizzle-orm";
import { AsyncResult, createSuccessResult, createEmptyResult, createErrorResult } from '../types/asyncResult';

// Helper function to safely convert to Date
const toDate = (value: Date | string | null) => {
  if (!value) return new Date(defaultDateString);
  return new Date(value);
};

// Base query builder for round data
const createBaseRoundQuery = () => {
  return db
    .select({
      id: roundMetadata.id,
      slug: roundMetadata.slug,
      signupOpens: roundMetadata.signupOpens,
      votingOpens: roundMetadata.votingOpens,
      coveringBegins: roundMetadata.coveringBegins,
      coversDue: roundMetadata.coversDue,
      listeningParty: roundMetadata.listeningParty,
      playlistUrl: roundMetadata.playlistUrl,
      song: { title: songs.title, artist: songs.artist },
    })
    .from(roundMetadata)
    .leftJoin(songs, eq(roundMetadata.songId, songs.id));
};

// Query by ID
const queryRoundById = (roundId: number) => {
  return createBaseRoundQuery()
    .where(eq(roundMetadata.id, roundId));
};

// Query by slug
const queryRoundBySlug = (slug: string) => {
  return createBaseRoundQuery()
    .where(eq(roundMetadata.slug, slug));
};

// Query current round
const queryCurrentRound = () => {
  const now = new Date();
  return createBaseRoundQuery()
    .where(
      and(
        sql`${roundMetadata.signupOpens} IS NOT NULL`,
        sql`${roundMetadata.listeningParty} IS NOT NULL`,
        sql`${roundMetadata.signupOpens} <= ${now.toISOString()}`,
        sql`${roundMetadata.listeningParty} >= ${now.toISOString()}`
      )
    )
    .orderBy(asc(roundMetadata.listeningParty))
    .limit(1);
};

// Helper function to map database round data to Round objects
const mapToRound = (dbRound: any): Round => {
  return {
    roundId: dbRound.id,
    slug: dbRound.slug ?? "",
    signupOpens: toDate(dbRound.signupOpens),
    votingOpens: toDate(dbRound.votingOpens),
    coveringBegins: toDate(dbRound.coveringBegins),
    coversDue: toDate(dbRound.coversDue),
    listeningParty: toDate(dbRound.listeningParty),
    playlistUrl: dbRound.playlistUrl ?? "",
    song: {
      artist: dbRound.song?.artist ?? "",
      title: dbRound.song?.title ?? "",
    },
    signupCount: typeof dbRound.signupCount === 'number' ? Number(dbRound.signupCount) : undefined,
    submissionCount: typeof dbRound.submissionCount === 'number' ? Number(dbRound.submissionCount) : undefined,
  };
};

export interface Round {
  roundId: number;
  slug: string;
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

export interface NextRoundData {
  roundId: number;
  slug: string | null;
  song: { title: string; artist: string } | null;
  signupOpens: Date | string | null;
  votingOpens: Date | string | null;
  coveringBegins: Date | string | null;
}

export const getCurrentRoundId = async (): Promise<AsyncResult<number>> => {
  try {
    const currentRound = await queryCurrentRound();

    if (!currentRound?.length) {
      return createEmptyResult('No current round found');
    }

    const roundId = currentRound[0].id;
    if (typeof roundId !== 'number') {
      return createErrorResult(new Error('Invalid round ID type'));
    }

    return createSuccessResult(roundId);
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

    const roundData = await queryRoundById(roundId);

    if (!roundData.length) {
      return createEmptyResult(`No round found with ID ${roundId}`);
    }

    const round = mapToRound(roundData[0]);
    return createSuccessResult(round);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to get round ${roundId}`));
  }
};

export const getRoundBySlug = async (slug: string): Promise<AsyncResult<Round>> => {
  try {
    // Validate slug is not empty
    if (!slug || typeof slug !== 'string') {
      return createErrorResult(new Error(`Invalid slug: ${slug}`));
    }

    const roundData = await queryRoundBySlug(slug);

    if (!roundData.length) {
      return createEmptyResult(`No round found with slug ${slug}`);
    }

    const round = mapToRound(roundData[0]);
    return createSuccessResult(round);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to get round with slug ${slug}`));
  }
};

export const getCurrentRound = async (): Promise<AsyncResult<Round>> => {
  try {
    const roundData = await queryCurrentRound();

    if (!roundData.length) {
      return createEmptyResult('No current round found');
    }

    const round = mapToRound(roundData[0]);
    return createSuccessResult(round);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get current round'));
  }
};

export const getCurrentAndFutureRounds = async (): Promise<AsyncResult<Round[]>> => {
  try {
    const currentRoundResult = await getCurrentRoundId();
    if (currentRoundResult.status !== 'success') {
      return createSuccessResult([]);
    }

    const rounds = await db
      .select()
      .from(roundMetadata)
      .where(gte(roundMetadata.id, currentRoundResult.data))
      .orderBy(asc(roundMetadata.id));

    if (!rounds.length) {
      return createSuccessResult([]);
    }

    const mappedRounds = rounds.map(round => mapToRound({
      ...round,
      song: { artist: "", title: "" }
    }));

    return createSuccessResult(mappedRounds);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get current and future rounds'));
  }
};

export const getFutureRounds = async (): Promise<AsyncResult<Round[]>> => {
  try {
    const currentRoundResult = await getCurrentRoundId();
    if (currentRoundResult.status !== 'success') {
      return createSuccessResult([]);
    }

    // Get rounds with ID greater than current round
    const rounds = await db
      .select()
      .from(roundMetadata)
      .leftJoin(songs, eq(roundMetadata.songId, songs.id))
      .where(sql`${roundMetadata.id} > ${currentRoundResult.data}`)
      .orderBy(asc(roundMetadata.id));

    if (!rounds.length) {
      return createSuccessResult([]);
    }

    const mappedRounds = rounds.map(round => mapToRound({
      ...round.round_metadata,
      song: round.songs ? { artist: round.songs.artist, title: round.songs.title } : { artist: "", title: "" }
    }));

    return createSuccessResult(mappedRounds);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get future rounds'));
  }
};

export const getNextRoundByVotingDate = async (): Promise<AsyncResult<NextRoundData>> => {
  try {
    const now = new Date();
    
    const result = await db
      .select({
        roundId: roundMetadata.id,
        slug: roundMetadata.slug,
        song: { title: songs.title, artist: songs.artist },
        signupOpens: roundMetadata.signupOpens,
        votingOpens: roundMetadata.votingOpens,
        coveringBegins: roundMetadata.coveringBegins,
      })
      .from(roundMetadata)
      .leftJoin(songs, eq(roundMetadata.songId, songs.id))
      .where(gte(roundMetadata.votingOpens, now))
      .orderBy(asc(roundMetadata.votingOpens))
      .limit(1);

    if (result.length === 0) {
      return createEmptyResult<NextRoundData>('No upcoming rounds found');
    }

    return createSuccessResult(result[0]);
  } catch (error) {
    return createErrorResult<NextRoundData>(error instanceof Error ? error : new Error('Failed to get next round'));
  }
};

export const getCurrentAndPastRounds = async (): Promise<AsyncResult<Round[]>> => {
  try {
    const now = new Date();
    const currentRoundResult = await getCurrentRoundId();
    
    // Build the where clause - if we have a current round, use it; otherwise just get past rounds by voting date
    const whereClause = currentRoundResult.status === 'success'
      ? or(
          sql`${roundMetadata.id} <= ${currentRoundResult.data}`,
          sql`${roundMetadata.votingOpens} IS NOT NULL AND ${roundMetadata.votingOpens}::timestamp <= ${now.toISOString()}::timestamp`
        )
      : sql`${roundMetadata.votingOpens} IS NOT NULL AND ${roundMetadata.votingOpens}::timestamp <= ${now.toISOString()}::timestamp`;

    // Get all rounds
    const rounds = await db
      .select({
        id: roundMetadata.id,
        slug: roundMetadata.slug,
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
      .where(whereClause)
      .orderBy(desc(roundMetadata.id));

    if (!rounds.length) {
      return createSuccessResult([]);
    }

    // OPTIMIZED: Get all counts in 2 queries instead of 2*N queries
    const roundIds = rounds.map(r => r.id);
    
    const [signupCounts, submissionCounts] = await Promise.all([
      db
        .select({ 
          roundId: signUps.roundId, 
          count: sql<number>`count(*)` 
        })
        .from(signUps)
        .where(sql`${signUps.roundId} IN (${sql.join(roundIds.map(id => sql`${id}`), sql`, `)})`)
        .groupBy(signUps.roundId),
      db
        .select({ 
          roundId: submissions.roundId, 
          count: sql<number>`count(*)` 
        })
        .from(submissions)
        .where(sql`${submissions.roundId} IN (${sql.join(roundIds.map(id => sql`${id}`), sql`, `)})`)
        .groupBy(submissions.roundId)
    ]);
    
    // Create maps for O(1) lookup
    const signupCountMap = new Map(signupCounts.map(s => [Number(s.roundId), Number(s.count)]));
    const submissionCountMap = new Map(submissionCounts.map(s => [Number(s.roundId), Number(s.count)]));
    
    // Add counts to rounds
    const roundsWithCounts = rounds.map(round => ({
      ...round,
      signupCount: signupCountMap.get(round.id) || 0,
      submissionCount: submissionCountMap.get(round.id) || 0,
    }));

    // Map database results to Round objects using our helper function
    const mappedRounds = roundsWithCounts.map(round => mapToRound(round));

    return createSuccessResult(mappedRounds);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get past rounds'));
  }
};

export const getAllRoundSlugs = async (): Promise<AsyncResult<string[]>> => {
  try {
    const rounds = await db
      .select({ 
        id: roundMetadata.id,
        slug: roundMetadata.slug 
      })
      .from(roundMetadata)
      .orderBy(sql`${roundMetadata.id} ASC`);

    if (!rounds.length) {
      return createEmptyResult('No rounds found');
    }

    return createSuccessResult(rounds.map(round => round.slug || round.id.toString()));
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get round slugs'));
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

// Get all songs from signups for a specific round
export const getSignupSongsForRound = async (roundId: number): Promise<AsyncResult<{ id: number; title: string; artist: string; }[]>> => {
  try {
    // Validate roundId is a valid number
    if (isNaN(roundId) || !Number.isFinite(roundId)) {
      return createErrorResult(new Error(`Invalid round ID: ${roundId}`));
    }

    const signupSongs = await db
      .select({
        id: songs.id,
        title: songs.title,
        artist: songs.artist,
      })
      .from(signUps)
      .innerJoin(songs, eq(signUps.songId, songs.id))
      .where(eq(signUps.roundId, roundId))
      .groupBy(songs.id, songs.title, songs.artist)
      .orderBy(songs.title, songs.artist);

    return createSuccessResult(signupSongs);
  } catch (error) {
    console.error('Error getting signup songs for round:', error);
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to get signup songs for round ${roundId}`));
  }
};

// Set the song for a round
export const setRoundSong = async (roundId: number, songId: number): Promise<AsyncResult<Round>> => {
  try {
    // Validate inputs
    if (isNaN(roundId) || !Number.isFinite(roundId)) {
      return createErrorResult(new Error(`Invalid round ID: ${roundId}`));
    }

    if (isNaN(songId) || !Number.isFinite(songId)) {
      return createErrorResult(new Error(`Invalid song ID: ${songId}`));
    }

    // Check if round exists
    const existingRound = await db
      .select({ id: roundMetadata.id })
      .from(roundMetadata)
      .where(eq(roundMetadata.id, roundId));

    if (existingRound.length === 0) {
      return createErrorResult(new Error(`Round with ID ${roundId} not found`));
    }

    // Check if song exists
    const existingSong = await db
      .select({ id: songs.id })
      .from(songs)
      .where(eq(songs.id, songId));

    if (existingSong.length === 0) {
      return createErrorResult(new Error(`Song with ID ${songId} not found`));
    }

    // Update the round with the selected song
    await db
      .update(roundMetadata)
      .set({ songId: songId })
      .where(eq(roundMetadata.id, roundId));

    // Get the updated round
    const updatedRound = await queryRoundById(roundId);

    if (!updatedRound.length) {
      return createErrorResult(new Error(`Failed to retrieve updated round ${roundId}`));
    }

    return createSuccessResult(mapToRound(updatedRound[0]));
  } catch (error) {
    console.error('Error setting round song:', error);
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to set song for round ${roundId}`));
  }
};

type CreateRoundInput = {
  slug: string;
  song?: {
    title: string;
    artist: string;
  };
  signupOpens: Date;
  votingOpens: Date;
  coveringBegins: Date;
  coversDue: Date;
  listeningParty: Date;
  playlistUrl?: string;
};

export const createRound = async (input: CreateRoundInput): Promise<AsyncResult<Round>> => {
  try {
    // Validate input
    if (!input.slug) {
      return createErrorResult(new Error('Missing required field: slug is required'));
    }
    
    // Validate song if provided
    if (input.song && (!input.song.title || !input.song.artist)) {
      return createErrorResult(new Error('If song is provided, both title and artist are required'));
    }

    // Check if slug already exists
    const existingRound = await db
      .select({ id: roundMetadata.id })
      .from(roundMetadata)
      .where(eq(roundMetadata.slug, input.slug));

    if (existingRound.length > 0) {
      return createErrorResult(new Error(`A round with slug "${input.slug}" already exists`));
    }

    // Start a transaction
    return await db.transaction(async (tx) => {
      // Handle song if provided
      let songId: number | null = null;
      
      if (input.song) {
        // First, create or find the song
        const existingSong = await tx
          .select({ id: songs.id })
          .from(songs)
          .where(
            and(
              eq(songs.title, input.song.title),
              eq(songs.artist, input.song.artist)
            )
          );

        if (existingSong.length > 0) {
          // Use existing song
          songId = existingSong[0].id;
        } else {
          // Create new song
          const songTimestamp = Date.now();
          const newSong = await tx
            .insert(songs)
            .values({
              id: songTimestamp, // Use number directly
              title: input.song.title,
              artist: input.song.artist,
            })
            .returning({ id: songs.id });

          if (!newSong.length) {
            throw new Error('Failed to create song');
          }

          songId = newSong[0].id;
        }
      }

      // Get the highest round ID and increment by 1 for the new round
      const maxRoundResult = await tx
        .select({ maxId: sql`MAX(${roundMetadata.id})` })
        .from(roundMetadata);
      
      const nextRoundId = maxRoundResult.length > 0 && maxRoundResult[0].maxId ? Number(maxRoundResult[0].maxId) + 1 : 1;
      
      // Now create the round with incremental ID
      const newRound = await tx
        .insert(roundMetadata)
        .values({
          id: nextRoundId, // Use incremental ID
          slug: input.slug,
          songId: songId, // This will be null if no song was provided
          signupOpens: input.signupOpens,
          votingOpens: input.votingOpens,
          coveringBegins: input.coveringBegins,
          coversDue: input.coversDue,
          listeningParty: input.listeningParty,
          playlistUrl: input.playlistUrl || null,
        })
        .returning();

      if (!newRound.length) {
        throw new Error('Failed to create round');
      }

      // Map to our Round type
      const createdRound = mapToRound({
        ...newRound[0],
        song: input.song ? {
          title: input.song.title,
          artist: input.song.artist,
        } : {
          title: "",
          artist: "",
        },
      });

      return createSuccessResult(createdRound);
    });
  } catch (error) {
    console.error('Error creating round:', error);
    return createErrorResult(error instanceof Error ? error : new Error('Failed to create round'));
  }
};

type UpdateRoundInput = {
  slug: string;
  signupOpens?: Date;
  votingOpens?: Date;
  coveringBegins?: Date;
  coversDue?: Date;
  listeningParty?: Date;
  playlistUrl?: string;
};

export const updateRound = async (input: UpdateRoundInput): Promise<AsyncResult<Round>> => {
  try {
    // Validate input
    if (!input.slug) {
      return createErrorResult(new Error('Missing required field: slug is required'));
    }

    // Check if round exists
    const existingRound = await db
      .select({ id: roundMetadata.id })
      .from(roundMetadata)
      .where(eq(roundMetadata.slug, input.slug));

    if (existingRound.length === 0) {
      return createErrorResult(new Error(`Round with slug "${input.slug}" not found`));
    }

    const roundId = existingRound[0].id;

    // Build update object with only provided fields
    const updateData: any = {};
    if (input.signupOpens) updateData.signupOpens = input.signupOpens;
    if (input.votingOpens) updateData.votingOpens = input.votingOpens;
    if (input.coveringBegins) updateData.coveringBegins = input.coveringBegins;
    if (input.coversDue) updateData.coversDue = input.coversDue;
    if (input.listeningParty) updateData.listeningParty = input.listeningParty;
    if (input.playlistUrl !== undefined) updateData.playlistUrl = input.playlistUrl || null;

    // Update the round
    await db
      .update(roundMetadata)
      .set(updateData)
      .where(eq(roundMetadata.id, roundId));

    // Get the updated round
    const updatedRound = await getRoundBySlug(input.slug);

    if (updatedRound.status !== 'success') {
      return createErrorResult(new Error('Failed to retrieve updated round'));
    }

    return createSuccessResult(updatedRound.data);
  } catch (error) {
    console.error('Error updating round:', error);
    return createErrorResult(error instanceof Error ? error : new Error('Failed to update round'));
  }
};

/**
 * Get basic round information by round ID
 * Simpler version for Server Actions that need round metadata
 */
export const getRoundInfo = async (roundId: number) => {
  const result = await db
    .select({
      id: roundMetadata.id,
      slug: roundMetadata.slug,
      signupOpens: roundMetadata.signupOpens,
      votingOpens: roundMetadata.votingOpens,
      coveringBegins: roundMetadata.coveringBegins,
      coversDue: roundMetadata.coversDue,
      listeningParty: roundMetadata.listeningParty,
    })
    .from(roundMetadata)
    .where(eq(roundMetadata.id, roundId))
    .limit(1);
  
  return result[0] || null;
};

