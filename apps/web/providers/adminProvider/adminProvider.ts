"use server";

import { db } from "@/db";
import { users, signUps, submissions, roundMetadata } from "@/db/schema";
import { getCurrentAndPastRounds, getSignupsByRound, getSubmissions, getUserCount, getCurrentRound, getAllUsers as getAllUsersService } from "@/data-access";
import { eq, sql, desc } from "drizzle-orm";

export type AdminStats = {
  totalUsers: number;
  totalRounds: number;
  activeUsers: number;
  completionRate: number;
};

export type AdminPageData = {
  stats: AdminStats;
  currentRound: Awaited<ReturnType<typeof getCurrentRound>>['data'] | null;
  allUsers: Awaited<ReturnType<typeof getAllUsersService>>;
  activeUsers: ActiveUserDetail[];
};

export type UserDetail = {
  email: string;
  lastActive: string | null;
  totalParticipation: number;
  totalSubmissions: number;
  lastSubmitted: string | null;
  lastSignup: string | null;
};

export type RoundDetail = {
  roundId: number;
  signupCount: number;
  submissionCount: number;
  completionRate: number;
};

export type ActiveUserDetail = {
  email: string;
  userId: string;
  lastSignupRound: number | null;
  lastSubmissionRound: number | null;
};

export const adminProvider = async (): Promise<AdminStats> => {
  // OPTIMIZED: Get all stats in a single parallel query set
  const [totalUsers, rounds, activeUsersCount] = await Promise.all([
    getUserCount(),
    getCurrentAndPastRounds(),
    // Get active users count directly with COUNT instead of fetching all rows
    // Use a subquery to get the last 3 round IDs
    db
      .select({ count: sql<number>`COUNT(DISTINCT ${signUps.userId})::int` })
      .from(signUps)
      .where(sql`${signUps.roundId} IN (
        SELECT ${roundMetadata.id} 
        FROM ${roundMetadata} 
        ORDER BY ${roundMetadata.id} DESC 
        LIMIT 3
      )`)
      .then(result => result[0]?.count || 0)
  ]);

  if (rounds.status !== 'success') {
    throw new Error('Failed to fetch rounds');
  }

  const totalRounds = rounds.data.length;
  
  // Use the counts already fetched in getCurrentAndPastRounds
  const totalSignups = rounds.data.reduce((sum, round) => sum + (round.signupCount || 0), 0);
  const totalSubmissions = rounds.data.reduce((sum, round) => sum + (round.submissionCount || 0), 0);
  const completionRate = totalSignups > 0 ? totalSubmissions / totalSignups : 0;

  return {
    totalUsers,
    totalRounds,
    activeUsers: activeUsersCount,
    completionRate,
  };
};

export const getUserDetails = async (): Promise<UserDetail[]> => {
  // OPTIMIZED: Use SQL aggregations instead of fetching all data into memory
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

export const getRoundDetails = async (): Promise<RoundDetail[]> => {
  // OPTIMIZED: Get counts in 2 aggregate queries instead of 2N queries
  const rounds = await getCurrentAndPastRounds();
  
  if (rounds.status !== 'success' || !rounds.data.length) {
    return [];
  }

  // Get all signup counts in one query
  const signupCounts = await db
    .select({
      roundId: signUps.roundId,
      count: sql<number>`COUNT(*)::int`
    })
    .from(signUps)
    .groupBy(signUps.roundId);

  // Get all submission counts in one query
  const submissionCounts = await db
    .select({
      roundId: submissions.roundId,
      count: sql<number>`COUNT(*)::int`
    })
    .from(submissions)
    .groupBy(submissions.roundId);

  // Create maps for O(1) lookup
  const signupMap = new Map(signupCounts.map(s => [s.roundId, s.count]));
  const submissionMap = new Map(submissionCounts.map(s => [s.roundId, s.count]));

  // Build details array
  return rounds.data.map(round => {
    const signupCount = signupMap.get(round.roundId) || 0;
    const submissionCount = submissionMap.get(round.roundId) || 0;
    const completionRate = signupCount > 0 ? submissionCount / signupCount : 0;

    return {
      roundId: round.roundId,
      signupCount,
      submissionCount,
      completionRate,
    };
  });
};

export const getActiveUsers = async (): Promise<ActiveUserDetail[]> => {
  // OPTIMIZED: Get all data in 2 queries instead of N queries in loops
  
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
  const activeUsers: ActiveUserDetail[] = lastSignups
    .filter(signup => signup.userId && signup.email)
    .map(signup => ({
      email: signup.email!,
      userId: signup.userId!,
      lastSignupRound: Number(signup.lastSignupRound),
      lastSubmissionRound: submissionsMap.get(signup.userId!) || null,
    }));
  
  // OPTIMIZED: Get all user IDs that only have submissions (no signups) in one query
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
            lastSignupRound: null,
            lastSubmissionRound: Number(submission.lastSubmissionRound),
          });
        }
      }
    });
  }
  
  return activeUsers;
};

/**
 * @deprecated Use individual tab server components with caching instead
 * Comprehensive admin provider that fetches all data needed for the admin page
 * This consolidates what was previously scattered service calls
 */
export const adminPageProvider = async (): Promise<AdminPageData> => {
  // Fetch all data in parallel for better performance
  const [stats, currentRoundResult, allUsers, activeUsers] = await Promise.all([
    adminProvider(),
    getCurrentRound(),
    getAllUsersService(),
    getActiveUsers(),
  ]);

  return {
    stats,
    currentRound: currentRoundResult.status === 'success' ? currentRoundResult.data : null,
    allUsers,
    activeUsers,
  };
};
