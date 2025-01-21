"use server";

import { isAdmin } from "@/utils/isAdmin";

import { db } from "@/db";
import { votingCandidateOverrides, songs, songSelectionVotes } from "@/db/schema";
import { eq, avg, count, sql, desc } from "drizzle-orm";
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

  return { data, error: null };
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
    .groupBy(songs.title, songs.artist).orderBy(
      desc(avg(songSelectionVotes.vote))
    );

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
    .selectDistinct({ userId: songSelectionVotes.userId })
    .from(songSelectionVotes)
    .where(eq(songSelectionVotes.roundId, roundId));

  return votes.map(vote => vote.userId).filter((id): id is string => id !== null);
};


export const submitVotes = async (
  { roundId }: { roundId: number },
  formData: FormData
): Promise<FormReturn> => {
  const { userId } = getAuthUser();
  const entries = formData.entries();
  const payload = Object.fromEntries(entries);
  const voteKeys = Object.keys(payload).filter(
    (key) => !["name", "email"].includes(key)
  );

  try {
    const votes = voteKeys
      .filter((key) => !["userId", "roundId"].includes(key))
      .map((key) => ({
        id: sql`nextval('song_selection_votes_id_seq')`,
        songId: JSON.parse(key),
        vote: JSON.parse(formData.get(key)?.toString() || "-1"),
        roundId: roundId,
        userId: userId,
        createdAt: new Date(),
      }));

    await db.insert(songSelectionVotes).values(votes);
    
    return handleResponse(201, Navigation.Voting, "");
  } catch (error) {
    return handleResponse(500, Navigation.Voting, (error as Error).message);
  }
};