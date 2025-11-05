"use server";

import { getCurrentAndPastRounds, getCurrentRound } from "@eptss/data-access/services/roundService";
import { getUserCount, getAllUsers as getAllUsersService, getActiveUsersCount, getUserDetails as getUserDetailsService, getActiveUsers as getActiveUsersService } from "@eptss/data-access/services/userService";

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
  // Get all stats using service layer
  const [totalUsers, rounds, activeUsersCount] = await Promise.all([
    getUserCount(),
    getCurrentAndPastRounds(),
    getActiveUsersCount(3) // Last 3 rounds
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
  // Use service layer
  return getUserDetailsService();
};

export const getRoundDetails = async (): Promise<RoundDetail[]> => {
  // Use service layer - getCurrentAndPastRounds already includes counts
  const rounds = await getCurrentAndPastRounds();

  if (rounds.status !== 'success' || !rounds.data.length) {
    return [];
  }

  // Build details array from round data
  return rounds.data.map(round => {
    const signupCount = round.signupCount || 0;
    const submissionCount = round.submissionCount || 0;
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
  // Use service layer
  return getActiveUsersService();
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
