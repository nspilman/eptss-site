"use server";
import { db } from "@/db";
import { users, songSelectionVotes, submissions, signUps } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/utils/supabase/server";
import { defaultDateString } from "@/constants";
import { sql } from "drizzle-orm";

export const getRoundDataForUser = async (roundId: number) => {
  const { userId } = await getAuthUser();
  if (!userId) return undefined;

  const userData = await db
    .select({
      userid: users.userid,
      email: users.email,
      hasVoted: sql<boolean>`EXISTS (
        SELECT 1 FROM ${songSelectionVotes} 
        WHERE ${songSelectionVotes.userId} = ${users.userid} 
        AND ${songSelectionVotes.roundId} = ${roundId}
      )`,
      hasSubmitted: sql<boolean>`EXISTS (
        SELECT 1 FROM ${submissions} 
        WHERE ${submissions.userId} = ${users.userid} 
        AND ${submissions.roundId} = ${roundId}
      )`,
      hasSignedUp: sql<boolean>`EXISTS (
        SELECT 1 FROM ${signUps} 
        WHERE ${signUps.userId} = ${users.userid} 
        AND ${signUps.roundId} = ${roundId}
      )`
    })
    .from(users)
    .where(eq(users.userid, userId))
    .limit(1);

  if (!userData.length) {
    return undefined;
  }

  const user = userData[0];
  
  return {
    user: {
      userid: user.userid,
      email: user.email
    },
    hasVoted: user.hasVoted,
    hasSubmitted: user.hasSubmitted,
    hasSignedUp: user.hasSignedUp
  };
};
