"use server";

import { db } from "@/db";
import { users, signUps, submissions } from "@/db/schema";
import { getCurrentAndPastRounds, getSignupsByRound, getSubmissions, getUserCount, getCurrentRound, getAllUsers as getAllUsersService } from "@/data-access";
import { eq, sql } from "drizzle-orm";

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
  const totalUsers = await getUserCount();
  const rounds = await getCurrentAndPastRounds();

  if (rounds.status !== 'success') {
    throw new Error('Failed to fetch rounds');
  }

  const totalRounds = rounds.data.length;
  
  // OPTIMIZED: Use the counts already fetched in getCurrentAndPastRounds
  // instead of fetching them again in loops
  const totalSignups = rounds.data.reduce((sum, round) => sum + (round.signupCount || 0), 0);
  const totalSubmissions = rounds.data.reduce((sum, round) => sum + (round.submissionCount || 0), 0);
  
  // OPTIMIZED: Get active users from last 3 rounds in a single query
  const lastThreeRounds = rounds.data.slice(-3);
  const lastThreeRoundIds = lastThreeRounds.map(r => r.roundId);
  
  let activeUsers = 0;
  if (lastThreeRoundIds.length > 0) {
    // Single query to get distinct user count from last 3 rounds
    const activeUsersResult = await db
      .selectDistinct({ userId: signUps.userId })
      .from(signUps)
      .where(sql`${signUps.roundId} IN (${sql.join(lastThreeRoundIds.map(id => sql`${id}`), sql`, `)})`);
    
    activeUsers = activeUsersResult.filter(u => u.userId).length;
  }

  const completionRate = totalSignups > 0 ? totalSubmissions / totalSignups : 0;

  return {
    totalUsers,
    totalRounds,
    activeUsers,
    completionRate,
  };
};

export const getUserDetails = async (): Promise<UserDetail[]> => {
  // OPTIMIZED: Get all data in 3 parallel queries instead of N+1 queries
  const [allUsers, allSignups, allSubmissions] = await Promise.all([
    db.select({
      email: users.email,
      userid: users.userid,
      lastActive: users.createdAt,
    }).from(users),
    db.select().from(signUps),
    db.select().from(submissions),
  ]);

  // Group signups and submissions by user ID
  const signupsByUser = new Map<string, typeof allSignups>();
  const submissionsByUser = new Map<string, typeof allSubmissions>();
  
  allSignups.forEach(signup => {
    if (!signup.userId) return;
    if (!signupsByUser.has(signup.userId)) {
      signupsByUser.set(signup.userId, []);
    }
    signupsByUser.get(signup.userId)!.push(signup);
  });
  
  allSubmissions.forEach(submission => {
    if (!submission.userId) return;
    if (!submissionsByUser.has(submission.userId)) {
      submissionsByUser.set(submission.userId, []);
    }
    submissionsByUser.get(submission.userId)!.push(submission);
  });

  // Map the data together
  const userDetails = allUsers.map(user => {
    const userSignups = signupsByUser.get(user.userid) || [];
    const userSubmissions = submissionsByUser.get(user.userid) || [];
    
    const lastSubmission = userSubmissions.length ? 
      userSubmissions.reduce((latest, current) => {
        const latestTime = latest.createdAt?.getTime() || 0;
        const currentTime = current.createdAt?.getTime() || 0;
        return latestTime > currentTime ? latest : current;
      }).createdAt : null;

    const lastSignup = userSignups.length ? 
      userSignups.reduce((latest, current) => {
        const latestTime = latest.createdAt?.getTime() || 0;
        const currentTime = current.createdAt?.getTime() || 0;
        return latestTime > currentTime ? latest : current;
      }).createdAt : null;

    return {
      email: user.email,
      lastActive: user.lastActive?.toISOString() || null,
      totalParticipation: userSignups.length,
      totalSubmissions: userSubmissions.length,
      lastSubmitted: lastSubmission?.toISOString() || null,
      lastSignup: lastSignup?.toISOString() || null,
    };
  }).filter(user => user.lastSignup !== null);

  // Sort by lastActive date, with most recent first
  return userDetails.sort((a, b) => {
    const timeA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
    const timeB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
    return timeB - timeA; // most recent first
  });
};

export const getRoundDetails = async (): Promise<RoundDetail[]> => {
  const rounds = await getCurrentAndPastRounds();
  const details: RoundDetail[] = [];

  for (const round of rounds.data || []) {
    const signups = await getSignupsByRound(round.roundId);
    const submissions = await getSubmissions(round.roundId);
    const completionRate = signups.length > 0 ? submissions.length / signups.length : 0;

    details.push({
      roundId: round.roundId,
      signupCount: signups.length,
      submissionCount: submissions.length,
      completionRate,
    });
  }

  return details;
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
  
  // Add users who only have submissions (no signups)
  lastSubmissions.forEach(submission => {
    if (!activeUsers.find(u => u.userId === submission.userId)) {
      // Get user email
      db.select({ email: users.email })
        .from(users)
        .where(eq(users.userid, submission.userId!))
        .then(userResult => {
          if (userResult.length > 0 && userResult[0].email) {
            activeUsers.push({
              email: userResult[0].email,
              userId: submission.userId!,
              lastSignupRound: null,
              lastSubmissionRound: Number(submission.lastSubmissionRound),
            });
          }
        });
    }
  });
  
  return activeUsers;
};

/**
 * Comprehensive admin provider that fetches all data needed for the admin page
 * This consolidates what was previously scattered service calls
 */
export const adminPageProvider = async (): Promise<AdminPageData> => {
  // Fetch all data in parallel for better performance
  console.time('adminPageProvider - total');
  console.time('adminPageProvider - parallel queries');
  const [stats, currentRoundResult, allUsers, activeUsers] = await Promise.all([
    adminProvider(),
    getCurrentRound(),
    getAllUsersService(),
    getActiveUsers(),
  ]);
  console.timeEnd('adminPageProvider - parallel queries');
  console.timeEnd('adminPageProvider - total');

  return {
    stats,
    currentRound: currentRoundResult.status === 'success' ? currentRoundResult.data : null,
    allUsers,
    activeUsers,
  };
};
