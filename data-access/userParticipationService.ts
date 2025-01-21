"use server";
import { db } from "@/db";
import { users, songSelectionVotes, submissions, signUps } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/utils/supabase/server";
import { defaultDateString } from "@/constants";

export const getRoundDataForUser = async (roundId: number) => {
  const { userId } = getAuthUser();

  const userData = await db
    .select({
      userid: users.userid,
      song_selection_votes: songSelectionVotes,
      submissions: submissions,
      sign_ups: signUps,
    })
    .from(users)
    .leftJoin(
      songSelectionVotes,
      and(
        eq(songSelectionVotes.userId, users.userid),
        eq(songSelectionVotes.roundId, roundId)
      )
    )
    .leftJoin(
      submissions,
      and(
        eq(submissions.userId, users.userid),
        eq(submissions.roundId, roundId)
      )
    )
    .leftJoin(
      signUps,
      and(
        eq(signUps.userId, users.userid),
        eq(signUps.roundId, roundId)
      )
    )
    .where(eq(users.userid, userId));

  if (!userData.length) {
    return undefined;
  }

  const user = userData[0];
  const isUserAttributeTruthy = (val: any[]) => 
    !!(Array.isArray(val) && val.filter(Boolean).length);

  return {
    user: {
      userid: user.userid,
      song_selection_votes: userData.filter(d => d.song_selection_votes).map(d => ({
        round_id: d.song_selection_votes?.roundId || -1,
        created_at: d.song_selection_votes?.createdAt?.toISOString() || defaultDateString,
      })),
      submissions: userData.filter(d => d.submissions).map(d => ({
        round_id: d.submissions?.roundId || -1,
        created_at: d.submissions?.createdAt?.toISOString() || defaultDateString,
      })),
      sign_ups: userData.filter(d => d.sign_ups).map(d => ({
        round_id: d.sign_ups?.roundId || -1,
        created_at: d.sign_ups?.createdAt?.toISOString() || defaultDateString,
      })),
    },
    hasVoted: isUserAttributeTruthy(userData.filter(d => d.song_selection_votes)),
    hasSubmitted: isUserAttributeTruthy(userData.filter(d => d.submissions)),
    hasSignedUp: isUserAttributeTruthy(userData.filter(d => d.sign_ups)),
  };
};
