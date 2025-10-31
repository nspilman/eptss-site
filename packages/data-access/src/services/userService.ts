"use server";

import { db } from "../db";
import { users, signUps, submissions, roundMetadata, songs } from "../db/schema";
import { count, eq } from "drizzle-orm";
import { sql } from "drizzle-orm/sql";

export const getUserCount = async () => {
  const result = await db.select({ count: sql<number>`count(*)` }).from(users);
  return Number(result[0].count);
};

/**
 * Get count of active users (users who have signed up in the last N rounds)
 */
export const getActiveUsersCount = async (lastNRounds: number = 3): Promise<number> => {
  const result = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${signUps.userId})::int` })
    .from(signUps)
    .where(sql`${signUps.roundId} IN (
      SELECT ${roundMetadata.id} 
      FROM ${roundMetadata} 
      ORDER BY ${roundMetadata.id} DESC 
      LIMIT ${lastNRounds}
    )`)
    .execute();
  
  return result[0]?.count || 0;
};

/**
 * Get detailed user statistics
 */
export const getUserDetails = async (): Promise<Array<{
  email: string;
  lastActive: string | null;
  totalParticipation: number;
  totalSubmissions: number;
  lastSubmitted: string | null;
  lastSignup: string | null;
}>> => {
  const userStats = await db
    .select({
      email: users.email,
      lastActive: users.createdAt,
      totalParticipation: sql<number>`COUNT(DISTINCT ${signUps.roundId})::int`,
      totalSubmissions: sql<number>`COUNT(DISTINCT ${submissions.roundId})::int`,
      lastSubmitted: sql<Date>`MAX(${submissions.createdAt})`,
      lastSignup: sql<Date>`MAX(${signUps.createdAt})`
    })
    .from(users)
    .leftJoin(signUps, eq(users.userid, signUps.userId))
    .leftJoin(submissions, eq(users.userid, submissions.userId))
    .groupBy(users.userid, users.email, users.createdAt)
    .having(sql`MAX(${signUps.createdAt}) IS NOT NULL`)
    .orderBy(sql`${users.createdAt} DESC NULLS LAST`);

  return userStats.map(user => ({
    email: user.email,
    lastActive: user.lastActive?.toISOString() || null,
    totalParticipation: user.totalParticipation || 0,
    totalSubmissions: user.totalSubmissions || 0,
    lastSubmitted: user.lastSubmitted?.toISOString() || null,
    lastSignup: user.lastSignup?.toISOString() || null,
  }));
};

/**
 * Get active users with their last signup and submission rounds
 */
export const getActiveUsers = async (): Promise<Array<{
  email: string;
  userId: string;
  lastSignupRound: number | null;
  lastSubmissionRound: number | null;
}>> => {
  // Query 1: Get last signup round for each user
  const lastSignups = await db
    .select({
      userId: signUps.userId,
      email: users.email,
      lastSignupRound: sql<number>`MAX(${signUps.roundId})`
    })
    .from(signUps)
    .leftJoin(users, eq(signUps.userId, users.userid))
    .groupBy(signUps.userId, users.email);
  
  // Query 2: Get last submission round for each user
  const lastSubmissions = await db
    .select({
      userId: submissions.userId,
      lastSubmissionRound: sql<number>`MAX(${submissions.roundId})`
    })
    .from(submissions)
    .groupBy(submissions.userId);
  
  // Create maps for quick lookup
  const submissionsMap = new Map(
    lastSubmissions.map(s => [s.userId, Number(s.lastSubmissionRound)])
  );
  
  // Combine the data
  const activeUsers = lastSignups
    .filter(signup => signup.userId && signup.email)
    .map(signup => ({
      email: signup.email!,
      userId: signup.userId!,
      lastSignupRound: Number(signup.lastSignupRound),
      lastSubmissionRound: submissionsMap.get(signup.userId!) || null,
    }));
  
  // Get users that only have submissions (no signups)
  const submissionOnlyUserIds = lastSubmissions
    .filter(submission => submission.userId && !activeUsers.find(u => u.userId === submission.userId))
    .map(submission => submission.userId!);
  
  if (submissionOnlyUserIds.length > 0) {
    const submissionOnlyUsers = await db
      .select({ email: users.email, userid: users.userid })
      .from(users)
      .where(sql`${users.userid} IN (${sql.join(submissionOnlyUserIds.map(id => sql`${id}`), sql`, `)})`);
    
    submissionOnlyUsers.forEach(user => {
      if (user.email && user.userid) {
        const submission = lastSubmissions.find(s => s.userId === user.userid);
        if (submission) {
          activeUsers.push({
            email: user.email,
            userId: user.userid,
            lastSignupRound: -1,
            lastSubmissionRound: Number(submission.lastSubmissionRound),
          });
        }
      }
    });
  }
  
  return activeUsers;
};

export const getAllUsers = async () => {
  const result = await db
    .select({
      userid: users.userid,
      email: users.email,
      username: users.username,
    })
    .from(users)
    .orderBy(users.username);
  
  return result;
};

/**
 * Get user information by user ID
 * Used in Server Actions for email confirmations
 */
export const getUserInfo = async (userId: string) => {
  const result = await db
    .select({
      email: users.email,
      username: users.username
    })
    .from(users)
    .where(eq(users.userid, userId))
    .limit(1);

  return result[0] || null;
};

/**
 * Get public profile data by username
 * Returns user info, public submissions, and public reflections
 */
export const getPublicProfileByUsername = async (username: string) => {
  // Get user basic info
  const userResult = await db
    .select({
      userid: users.userid,
      username: users.username,
      fullName: users.fullName,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (userResult.length === 0) {
    return null;
  }

  const user = userResult[0];

  // Get user's submissions with round and song info
  const userSubmissions = await db
    .select({
      id: submissions.id,
      soundcloudUrl: submissions.soundcloudUrl,
      createdAt: submissions.createdAt,
      roundSlug: roundMetadata.slug,
      roundId: roundMetadata.id,
      songTitle: songs.title,
      songArtist: songs.artist,
    })
    .from(submissions)
    .innerJoin(roundMetadata, eq(submissions.roundId, roundMetadata.id))
    .innerJoin(songs, eq(roundMetadata.songId, songs.id))
    .where(eq(submissions.userId, user.userid))
    .orderBy(sql`${submissions.createdAt} DESC`);

  return {
    user: {
      username: user.username,
      fullName: user.fullName,
    },
    submissions: userSubmissions.map(s => ({
      id: s.id.toString(),
      soundcloudUrl: s.soundcloudUrl,
      createdAt: s.createdAt?.toISOString() || null,
      roundSlug: s.roundSlug,
      roundId: s.roundId,
      songTitle: s.songTitle,
      songArtist: s.songArtist,
    })),
  };
};
