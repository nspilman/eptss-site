"use server";

import { db } from "@/db";
import { users, signUps, submissions } from "@/db/schema";
import { getCurrentAndPastRounds, getSignupsByRound, getSubmissions, getUserCount } from "@/data-access";
import { eq } from "drizzle-orm";

export type AdminStats = {
  totalUsers: number;
  totalRounds: number;
  activeUsers: number;
  completionRate: number;
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

  console.log({rounds})
  
  if (rounds.status !== 'success') {
    throw new Error('Failed to fetch rounds');
  }

  const totalRounds = rounds.data.length;
  const lastThreeRounds = rounds.data.slice(-3);
  const activeUserIds = new Set<string>();
  
  for (const round of lastThreeRounds) {
    const signups = await getSignupsByRound(round.roundId);
    signups.forEach(signup => activeUserIds.add(signup.userId || ""));
  }
  const activeUsers = activeUserIds.size;

  let totalSignups = 0;
  let totalSubmissions = 0;

  for (const round of rounds.data) {
    const signups = await getSignupsByRound(round.roundId);
    const submissions = await getSubmissions(round.roundId);
    totalSignups += signups.length;
    totalSubmissions += submissions.length;
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
  // Get all users with their IDs
  const allUsers = await db.select({
    email: users.email,
    userid: users.userid,
    lastActive: users.createdAt, // Using createdAt as lastActive for now
  }).from(users)

  // Get all signups with user IDs
  const signupsByUser = await Promise.all(
    allUsers.map(async (user) => {
      const userSignups = await db
        .select()
        .from(signUps)
        .where(eq(signUps.userId, user.userid));
      return {
        userid: user.userid,
        signups: userSignups,
      };
    })
  );

  // Get all submissions with user IDs
  const submissionsByUser = await Promise.all(
    allUsers.map(async (user) => {
      const userSubmissions = await db
        .select()
        .from(submissions)
        .where(eq(submissions.userId, user.userid));
      return {
        userid: user.userid,
        submissions: userSubmissions,
      };
    })
  );

  // Map the data together
  const userDetails = allUsers.map(user => {
    const userSignupData = signupsByUser.find(s => s.userid === user.userid);
    const userSubmissionData = submissionsByUser.find(s => s.userid === user.userid);
    
    const lastSubmission = userSubmissionData?.submissions.length ? 
      userSubmissionData.submissions.reduce((latest, current) => {
        const latestTime = latest.createdAt?.getTime() || 0;
        const currentTime = current.createdAt?.getTime() || 0;
        return latestTime > currentTime ? latest : current;
      }).createdAt : null;

    const lastSignup = userSignupData?.signups.length ? 
      userSignupData.signups.reduce((latest, current) => {
        const latestTime = latest.createdAt?.getTime() || 0;
        const currentTime = current.createdAt?.getTime() || 0;
        return latestTime > currentTime ? latest : current;
      }).createdAt : null;

    return {
      email: user.email,
      lastActive: user.lastActive?.toISOString() || null,
      totalParticipation: userSignupData?.signups.length || 0,
      totalSubmissions: userSubmissionData?.submissions.length || 0,
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
  // Get all users
  const allUsers = await db.select({
    email: users.email,
    userid: users.userid,
  }).from(users);

  // Get all rounds
  const rounds = await getCurrentAndPastRounds();
  if (rounds.status !== 'success') {
    return [];
  }

  // Create a map of user details
  const userDetailsMap = new Map<string, ActiveUserDetail>();
  
  // Initialize the map with all users
  allUsers.forEach(user => {
    userDetailsMap.set(user.userid, {
      email: user.email,
      userId: user.userid,
      lastSignupRound: null,
      lastSubmissionRound: null,
    });
  });

  // Process all rounds to find the last signup and submission for each user
  for (const round of rounds.data) {
    const roundId = round.roundId;
    
    // Get signups for this round
    const signups = await getSignupsByRound(roundId);
    
    // Update last signup round for each user
    signups.forEach(signup => {
      if (signup.userId) {
        const userDetail = userDetailsMap.get(signup.userId);
        if (userDetail) {
          if (userDetail.lastSignupRound === null || roundId > userDetail.lastSignupRound) {
            userDetail.lastSignupRound = roundId;
          }
        }
      }
    });
    
    // Get submissions for this round
    const submissions = await getSubmissions(roundId);
    
    // Update last submission round for each user
    submissions.forEach(submission => {
      if (submission.userId) {
        const userDetail = userDetailsMap.get(submission.userId);
        if (userDetail) {
          if (userDetail.lastSubmissionRound === null || roundId > userDetail.lastSubmissionRound) {
            userDetail.lastSubmissionRound = roundId;
          }
        }
      }
    });
  }

  // Convert map to array and filter out users who have never participated
  return Array.from(userDetailsMap.values())
    .filter(user => user.lastSignupRound !== null || user.lastSubmissionRound !== null);
};
