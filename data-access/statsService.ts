"use server";

import { db } from "@/db";
import { users, signUps, roundMetadata, submissions } from "@/db/schema";
import { count, sql, desc, and, lte } from "drizzle-orm";

export const getTotalUsers = async () => {
  const result = await db
    .select({ count: count() })
    .from(users);
  return result[0].count;
};

export const getActiveRoundCount = async () => {
  const result = await db
    .select({ count: count() })
    .from(roundMetadata)
    .where(lte(roundMetadata.signupOpens, new Date()));
  return result[0].count;
};

export const getActiveUsers = async () => {
  // Get the last 3 rounds that have started
  const lastThreeRounds = await db
    .select({ id: roundMetadata.id })
    .from(roundMetadata)
    .where(lte(roundMetadata.signupOpens, new Date()))
    .orderBy(desc(roundMetadata.signupOpens))
    .limit(3);

  const roundIds = lastThreeRounds.map(round => round.id);

  // Count unique users who have signed up in these rounds
  const result = await db
    .select({
      count: sql<number>`count(distinct ${signUps.userId})`
    })
    .from(signUps)
    .where(sql`${signUps.roundId} = any(${roundIds})`);

  return result[0].count;
};

export const getCompletionRate = async () => {
  // Get all rounds that have started
  const activeRounds = await db
    .select({ id: roundMetadata.id })
    .from(roundMetadata)
    .where(lte(roundMetadata.signupOpens, new Date()));

  const roundIds = activeRounds.map(round => round.id);

  // Count total signups and submissions for these rounds
  const signupCount = await db
    .select({ count: count() })
    .from(signUps)
    .where(sql`${signUps.roundId} = any(${roundIds})`);

  const submissionCount = await db
    .select({ count: count() })
    .from(submissions)
    .where(sql`${submissions.roundId} = any(${roundIds})`);

  if (signupCount[0].count === 0) return 0;
  return submissionCount[0].count / signupCount[0].count;
};
