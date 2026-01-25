"use server";

import { db } from "../db";
import { users, signUps, submissions, roundMetadata, songs, userPrivacySettings, userSocialLinks, userEmbeddedMedia } from "../db/schema";
import { count, eq, and, asc, desc, gte, isNotNull } from "drizzle-orm";
import { sql } from "drizzle-orm/sql";
import { getDisplayName } from "@eptss/shared";

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

  // Helper function to safely convert to ISO string
  const toISOString = (date: Date | string | null | undefined): string | null => {
    if (!date) return null;
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toISOString();
    return null;
  };

  return userStats.map(user => ({
    email: user.email,
    lastActive: toISOString(user.lastActive),
    totalParticipation: user.totalParticipation || 0,
    totalSubmissions: user.totalSubmissions || 0,
    lastSubmitted: toISOString(user.lastSubmitted),
    lastSignup: toISOString(user.lastSignup),
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
      publicDisplayName: users.publicDisplayName,
      profilePictureUrl: users.profilePictureUrl,
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
      // Legacy field
      soundcloudUrl: submissions.soundcloudUrl,
      // New fields
      audioFileUrl: submissions.audioFileUrl,
      coverImageUrl: submissions.coverImageUrl,
      audioDuration: submissions.audioDuration,
      audioFileSize: submissions.audioFileSize,
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

  // Get user privacy settings
  const privacyResult = await db
    .select()
    .from(userPrivacySettings)
    .where(eq(userPrivacySettings.userId, user.userid))
    .limit(1);

  const privacy = privacyResult[0] || {
    showStats: true,
    showSignups: true,
    showSubmissions: true,
    showVotes: false,
    showEmail: false,
    profileBio: null,
  };

  // Filter submissions based on privacy settings
  // All submissions are now either shown or hidden based on the user's showSubmissions preference
  const filteredSubmissions = privacy.showSubmissions ? userSubmissions : [];

  // Determine display name (fallback to username if not set)
  const displayName = getDisplayName(user);

  // Get social links and embedded media
  const [socialLinks, embeddedMedia] = await Promise.all([
    getUserSocialLinks(user.userid),
    getUserEmbeddedMedia(user.userid),
  ]);

  // Filter based on privacy settings
  const filteredSocialLinks = privacy.showSocialLinks ? socialLinks : [];
  const filteredEmbeddedMedia = privacy.showEmbeddedMedia ? embeddedMedia : [];

  return {
    user: {
      userid: user.userid,
      username: user.username,
      publicDisplayName: user.publicDisplayName,
      profilePictureUrl: user.profilePictureUrl,
      displayName,
      bio: privacy.profileBio,
      showEmail: privacy.showEmail,
    },
    submissions: filteredSubmissions.map(s => ({
      id: s.id.toString(),
      // Legacy field
      soundcloudUrl: s.soundcloudUrl,
      // New fields
      audioFileUrl: s.audioFileUrl,
      coverImageUrl: s.coverImageUrl,
      audioDuration: s.audioDuration,
      audioFileSize: s.audioFileSize,
      createdAt: s.createdAt?.toISOString() || null,
      roundSlug: s.roundSlug,
      roundId: s.roundId,
      songTitle: s.songTitle,
      songArtist: s.songArtist,
    })),
    socialLinks: filteredSocialLinks,
    embeddedMedia: filteredEmbeddedMedia,
    privacy: {
      showStats: privacy.showStats,
      showSignups: privacy.showSignups,
      showSubmissions: privacy.showSubmissions,
      showVotes: privacy.showVotes,
      showSocialLinks: privacy.showSocialLinks ?? true,
      showEmbeddedMedia: privacy.showEmbeddedMedia ?? true,
    },
  };
};

/**
 * Type for public profile data returned by getPublicProfileByUsername
 */
export type PublicProfileData = NonNullable<Awaited<ReturnType<typeof getPublicProfileByUsername>>>;

/**
 * Type for public profile submission data
 */
export type PublicProfileSubmission = PublicProfileData['submissions'][number];

/**
 * Get user privacy settings by user ID
 */
export const getUserPrivacySettings = async (userId: string) => {
  const result = await db
    .select()
    .from(userPrivacySettings)
    .where(eq(userPrivacySettings.userId, userId))
    .limit(1);

  if (result.length === 0) {
    // Return default settings if none exist (matches schema defaults)
    return {
      showStats: true,
      showSignups: true,
      showSubmissions: true,
      showVotes: false,
      showEmail: false,
      showSocialLinks: true,
      showEmbeddedMedia: true,
      notificationEmailsEnabled: true,
      profileBio: null,
    };
  }

  return result[0];
};

/**
 * Update or create user privacy settings
 */
export const updateUserPrivacySettings = async (
  userId: string,
  settings: {
    showStats?: boolean;
    showSignups?: boolean;
    showSubmissions?: boolean;
    showVotes?: boolean;
    showEmail?: boolean;
    showSocialLinks?: boolean;
    showEmbeddedMedia?: boolean;
    publicDisplayName?: string | null;
    profileBio?: string | null;
  }
) => {
  const existingSettings = await db
    .select()
    .from(userPrivacySettings)
    .where(eq(userPrivacySettings.userId, userId))
    .limit(1);

  if (existingSettings.length === 0) {
    // Create new settings
    const result = await db
      .insert(userPrivacySettings)
      .values({
        userId,
        ...settings,
      })
      .returning();
    return result[0];
  } else {
    // Update existing settings
    const result = await db
      .update(userPrivacySettings)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(userPrivacySettings.userId, userId))
      .returning();
    return result[0];
  }
};

/**
 * Get user by ID with all their data
 */
export const getUserById = async (userId: string) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.userid, userId))
    .limit(1);

  return result[0] || null;
};

/**
 * Get user's social links ordered by displayOrder
 */
export const getUserSocialLinks = async (userId: string) => {
  const result = await db
    .select()
    .from(userSocialLinks)
    .where(eq(userSocialLinks.userId, userId))
    .orderBy(asc(userSocialLinks.displayOrder));

  return result;
};

/**
 * Create a new social link for a user
 */
export const createUserSocialLink = async (data: {
  userId: string;
  platform: string;
  label?: string | null;
  url: string;
  displayOrder?: number;
}) => {
  const result = await db
    .insert(userSocialLinks)
    .values({
      userId: data.userId,
      platform: data.platform,
      label: data.label,
      url: data.url,
      displayOrder: data.displayOrder ?? 0,
    })
    .returning();

  return result[0];
};

/**
 * Update a social link
 */
export const updateUserSocialLink = async (
  linkId: string,
  data: {
    platform?: string;
    label?: string | null;
    url?: string;
    displayOrder?: number;
  }
) => {
  const result = await db
    .update(userSocialLinks)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(userSocialLinks.id, linkId))
    .returning();

  return result[0];
};

/**
 * Delete a social link
 */
export const deleteUserSocialLink = async (linkId: string) => {
  await db
    .delete(userSocialLinks)
    .where(eq(userSocialLinks.id, linkId));
};

/**
 * Get user's embedded media ordered by displayOrder
 */
export const getUserEmbeddedMedia = async (userId: string) => {
  const result = await db
    .select()
    .from(userEmbeddedMedia)
    .where(eq(userEmbeddedMedia.userId, userId))
    .orderBy(asc(userEmbeddedMedia.displayOrder));

  return result;
};

/**
 * Create a new embedded media item for a user
 */
export const createUserEmbeddedMedia = async (data: {
  userId: string;
  mediaType: 'audio' | 'video' | 'image' | 'embed';
  embedCode: string;
  title?: string | null;
  displayOrder?: number;
}) => {
  const result = await db
    .insert(userEmbeddedMedia)
    .values({
      userId: data.userId,
      mediaType: data.mediaType,
      embedCode: data.embedCode,
      title: data.title,
      displayOrder: data.displayOrder ?? 0,
    })
    .returning();

  return result[0];
};

/**
 * Update an embedded media item
 */
export const updateUserEmbeddedMedia = async (
  mediaId: string,
  data: {
    mediaType?: 'audio' | 'video' | 'image' | 'embed';
    embedCode?: string;
    title?: string | null;
    displayOrder?: number;
  }
) => {
  const result = await db
    .update(userEmbeddedMedia)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(userEmbeddedMedia.id, mediaId))
    .returning();

  return result[0];
};

/**
 * Delete an embedded media item
 */
export const deleteUserEmbeddedMedia = async (mediaId: string) => {
  await db
    .delete(userEmbeddedMedia)
    .where(eq(userEmbeddedMedia.id, mediaId));
};

/**
 * Update user's profile picture URL
 */
export const updateUserProfilePicture = async (userId: string, profilePictureUrl: string | null) => {
  const result = await db
    .update(users)
    .set({
      profilePictureUrl,
    })
    .where(eq(users.userid, userId))
    .returning();

  return result[0];
};

/**
 * Get emails of active users
 * Active users are those who:
 * 1. Signed up within the last 3 months, OR
 * 2. Have ever submitted a cover, OR
 * 3. Have updated their display name (publicDisplayName is not null)
 */
export const getActiveUserEmails = async (): Promise<string[]> => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  // Get users who signed up in the last 3 months
  const recentSignups = await db
    .selectDistinct({ email: users.email })
    .from(signUps)
    .innerJoin(users, eq(signUps.userId, users.userid))
    .where(gte(signUps.createdAt, threeMonthsAgo));

  // Get users who have ever submitted
  const submitters = await db
    .selectDistinct({ email: users.email })
    .from(submissions)
    .innerJoin(users, eq(submissions.userId, users.userid));

  // Get users who have updated their display name
  const displayNameUsers = await db
    .select({ email: users.email })
    .from(users)
    .where(isNotNull(users.publicDisplayName));

  // Combine all emails and remove duplicates
  const allEmails = [
    ...recentSignups.map(u => u.email),
    ...submitters.map(u => u.email),
    ...displayNameUsers.map(u => u.email),
  ];

  const uniqueEmails = [...new Set(allEmails)].filter((email): email is string => !!email);

  return uniqueEmails.sort();
};

