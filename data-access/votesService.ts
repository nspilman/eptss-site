"use server";

import { isAdmin } from "@/utils/isAdmin";
import { db } from "@/db";
import { votingCandidateOverrides, songs, songSelectionVotes } from "@/db/schema";
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

export const submitVotes = async (
  { roundId }: { roundId: number },
  formData: FormData
): Promise<FormReturn> => {
  const { userId } = getAuthUser();
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
        return handleResponse(400, Navigation.Vote, "No votes submitted");
      }

      await trx.insert(songSelectionVotes).values(votes);
    });

    return handleResponse(201, Navigation.Vote, "");
  } catch (error) {
    return handleResponse(500, Navigation.Vote, (error as Error).message);
  }
};