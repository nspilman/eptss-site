"use server";

import { isAdmin } from "@/utils/isAdmin";
import { db } from "@/db";
import { votingCandidateOverrides, songs, songSelectionVotes, users } from "@/db/schema";
import { eq, avg, count, sql, desc, and } from "drizzle-orm";
import { handleResponse } from "@/utils";
import { Navigation } from "@/enum/navigation";
import { FormReturn } from "@/types";
import { getAuthUser } from "@/utils/supabase/server";

export const getRoundOverrideVotes = async (roundId: number) => {
  const data = await db
    .select({
      roundId: votingCandidateOverrides.roundId,
      originalRoundId: votingCandidateOverrides.originalRoundId,
      songId: votingCandidateOverrides.songId,
      song: {
        title: songs.title,
        artist: songs.artist
      }
    })
    .from(votingCandidateOverrides)
    .leftJoin(songs, eq(votingCandidateOverrides.songId, songs.id))
    .where(eq(votingCandidateOverrides.roundId, roundId))
    .orderBy(votingCandidateOverrides.originalRoundId);

  return { data: data.map((val) => ({
      ...val,
      song: {
        title: val.song?.title || "",
        artist: val.song?.artist || ""
      }
    })), error: null };
};

export const getVoteResults = async (id: number) => {
  const voteResults = await db
    .select({
      title: songs.title,
      artist: songs.artist,
      average: sql<number>`cast(avg(${songSelectionVotes.vote}) as decimal(10,2))`,
      votesCount: count(songSelectionVotes.vote)
    })
    .from(songSelectionVotes)
    .leftJoin(songs, eq(songSelectionVotes.songId, songs.id))
    .where(eq(songSelectionVotes.roundId, id))
    .groupBy(songs.title, songs.artist)
    .orderBy(desc(avg(songSelectionVotes.vote)));

  return voteResults.map((result) => ({
    title: result.title || "",
    artist: result.artist || "",
    average: Number(result.average) || 0,
    votesCount: Number(result.votesCount) || 0
  }));
};

export const getDetailedVoteResults = async (id: number) => {
  // Get all votes for this round
  const allVotes = await db
    .select({
      songId: songSelectionVotes.songId,
      title: songs.title,
      artist: songs.artist,
      vote: songSelectionVotes.vote
    })
    .from(songSelectionVotes)
    .leftJoin(songs, eq(songSelectionVotes.songId, songs.id))
    .where(eq(songSelectionVotes.roundId, id));

  // Group by song and calculate stats
  const songStats = new Map<string, {
    title: string;
    artist: string;
    votes: number[];
    average: number;
    votesCount: number;
    oneStarCount: number;
  }>();

  for (const vote of allVotes) {
    const key = `${vote.title}|${vote.artist}`;
    if (!songStats.has(key)) {
      songStats.set(key, {
        title: vote.title || "",
        artist: vote.artist || "",
        votes: [],
        average: 0,
        votesCount: 0,
        oneStarCount: 0
      });
    }
    const stats = songStats.get(key)!;
    stats.votes.push(vote.vote);
    if (vote.vote === 1) {
      stats.oneStarCount++;
    }
  }

  // Calculate averages and return sorted results
  const results = Array.from(songStats.values()).map(stats => ({
    title: stats.title,
    artist: stats.artist,
    average: stats.votes.reduce((sum, v) => sum + v, 0) / stats.votes.length,
    votesCount: stats.votes.length,
    oneStarCount: stats.oneStarCount
  }));

  // Sort by average (descending)
  return results.sort((a, b) => b.average - a.average);
};

export const getVotingUsersByRound = async (roundId: number) => {
  if (!await isAdmin()) {
    return [];
  }

  const votes = await db
    .select({
      userId: songSelectionVotes.userId
    })
    .from(songSelectionVotes)
    .where(eq(songSelectionVotes.roundId, roundId))
    .groupBy(songSelectionVotes.userId);

  return votes.map(vote => vote.userId).filter(Boolean);
};

export const getVotesByUserForRound = async (roundId: number) => {
  const { userId } = await getAuthUser();
  if (!userId) return [];
  const votes = await db
    .select({ songId: songSelectionVotes.songId, vote: songSelectionVotes.vote })
    .from(songSelectionVotes)
    .where(
      and(
        eq(songSelectionVotes.userId, userId),
        eq(songSelectionVotes.roundId, roundId)
      )
    );
  return votes;
};

export const getVotesByUserForRoundWithDetails = async (roundId: number) => {
  const { userId } = await getAuthUser();
  if (!userId) return [];
  
  const votes = await db
    .select({ 
      songId: songSelectionVotes.songId, 
      vote: songSelectionVotes.vote,
      title: songs.title,
      artist: songs.artist
    })
    .from(songSelectionVotes)
    .leftJoin(songs, eq(songSelectionVotes.songId, songs.id))
    .where(
      and(
        eq(songSelectionVotes.userId, userId),
        eq(songSelectionVotes.roundId, roundId)
      )
    )
    .orderBy(desc(songSelectionVotes.vote));
  
  return votes.map(vote => ({
    title: vote.title || "",
    artist: vote.artist || "",
    rating: vote.vote
  }));
};

export const getAllVotesForRound = async (roundId: number) => {
  if (!await isAdmin()) {
    return [];
  }

  const votes = await db
    .select({
      email: users.email,
      userId: songSelectionVotes.userId,
      songId: songSelectionVotes.songId,
      vote: songSelectionVotes.vote,
      createdAt: songSelectionVotes.createdAt,
      title: songs.title,
      artist: songs.artist
    })
    .from(songSelectionVotes)
    .leftJoin(songs, eq(songSelectionVotes.songId, songs.id))
    .leftJoin(users, eq(songSelectionVotes.userId, users.userid))
    .where(eq(songSelectionVotes.roundId, roundId))
    .orderBy(songSelectionVotes.createdAt);

  return votes;
};

export const submitVotes = async (
  roundId: number,
  formData: FormData
): Promise<FormReturn> => {
  const { userId } = await getAuthUser();
  if (!userId) {
    return handleResponse(401, Navigation.Login, "User not found");
  }

  try {
    await db.transaction(async (trx) => {
      // Delete existing votes for this user and round
      await trx
        .delete(songSelectionVotes)
        .where(
          and(
            eq(songSelectionVotes.userId, userId),
            eq(songSelectionVotes.roundId, roundId)
          )
        );

      // Get the next vote ID
      const lastVoteId = await trx
        .select({ id: songSelectionVotes.id })
        .from(songSelectionVotes)
        .orderBy(sql`id desc`)
        .limit(1);
      
      let nextVoteId = (lastVoteId[0]?.id || 0) + 1;

      // Insert new votes
      const votes = Array.from(formData.entries())
        .filter(([key]) => key.startsWith('song-'))
        .map(([key, value]) => ({
          id: nextVoteId++,
          userId,
          roundId,
          songId: Number(key.replace('song-', '')),
          vote: Number(value),
          submitterEmail: null
        }));

      if (votes.length === 0) {
        return handleResponse(400, Navigation.Voting, "No votes submitted");
      }

      await trx.insert(songSelectionVotes).values(votes);
    });

    return handleResponse(201, Navigation.Voting, "");
  } catch (error) {
    return handleResponse(500, Navigation.Voting, (error as Error).message);
  }
};