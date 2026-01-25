"use server";

import { db } from "../db";
import { signUps, submissions, songSelectionVotes, roundMetadata, songs } from "../db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Get user's signups grouped by round
 */
export const getUserSignups = async (userId: string) => {
  const result = await db
    .select({
      id: signUps.id,
      createdAt: signUps.createdAt,
      youtubeLink: signUps.youtubeLink,
      roundId: signUps.roundId,
      songId: signUps.songId,
      userId: signUps.userId,
      additionalComments: signUps.additionalComments,
      roundSlug: roundMetadata.slug,
      roundSignupOpens: roundMetadata.signupOpens,
      roundCoveringBegins: roundMetadata.coveringBegins,
      roundCoversDue: roundMetadata.coversDue,
      songTitle: songs.title,
      songArtist: songs.artist,
    })
    .from(signUps)
    .leftJoin(roundMetadata, eq(signUps.roundId, roundMetadata.id))
    .leftJoin(songs, eq(signUps.songId, songs.id))
    .where(eq(signUps.userId, userId))
    .orderBy(desc(signUps.createdAt));

  // Group by round
  const groupedMap = new Map<number, any>();

  result.forEach((signup) => {
    const roundId = signup.roundId;
    if (!roundId) return;

    const signupItem = {
      id: signup.id,
      created_at: signup.createdAt?.toISOString() || null,
      youtube_link: signup.youtubeLink,
      song_id: signup.songId,
      user_id: signup.userId,
      additional_comments: signup.additionalComments,
      title: signup.songTitle || 'Unknown Title',
      artist: signup.songArtist || 'Unknown Artist',
    };

    if (!groupedMap.has(roundId)) {
      groupedMap.set(roundId, {
        round_id: roundId,
        round_slug: signup.roundSlug,
        signup_count: 0,
        latest_signup_date: signup.createdAt?.toISOString() || null,
        signups: [],
        round_metadata: signup.roundSlug ? {
          id: roundId,
          slug: signup.roundSlug,
          signup_opens: signup.roundSignupOpens?.toISOString() || null,
          covering_begins: signup.roundCoveringBegins?.toISOString() || null,
          covers_due: signup.roundCoversDue?.toISOString() || null,
        } : null,
      });
    }

    const group = groupedMap.get(roundId)!;
    group.signups.push(signupItem);
    group.signup_count = group.signups.length;
  });

  return Array.from(groupedMap.values());
};

/**
 * Get user's submissions
 */
export const getUserSubmissions = async (userId: string) => {
  const result = await db
    .select({
      id: submissions.id,
      createdAt: submissions.createdAt,
      // Legacy field
      soundcloudUrl: submissions.soundcloudUrl,
      // New fields
      audioFileUrl: submissions.audioFileUrl,
      audioFilePath: submissions.audioFilePath,
      coverImageUrl: submissions.coverImageUrl,
      coverImagePath: submissions.coverImagePath,
      audioDuration: submissions.audioDuration,
      audioFileSize: submissions.audioFileSize,
      roundId: submissions.roundId,
      userId: submissions.userId,
      additionalComments: submissions.additionalComments,
      roundSlug: roundMetadata.slug,
      roundSignupOpens: roundMetadata.signupOpens,
      roundCoveringBegins: roundMetadata.coveringBegins,
      roundCoversDue: roundMetadata.coversDue,
      songTitle: songs.title,
      songArtist: songs.artist,
    })
    .from(submissions)
    .leftJoin(roundMetadata, eq(submissions.roundId, roundMetadata.id))
    .leftJoin(songs, eq(roundMetadata.songId, songs.id))
    .where(eq(submissions.userId, userId))
    .orderBy(desc(submissions.createdAt));

  return result.map((submission) => ({
    id: submission.id,
    created_at: submission.createdAt?.toISOString() || null,
    title: submission.songTitle || 'Unknown Title',
    artist: submission.songArtist || 'Unknown Artist',
    // Legacy field
    soundcloud_url: submission.soundcloudUrl,
    // New fields
    audio_file_url: submission.audioFileUrl,
    audio_file_path: submission.audioFilePath,
    cover_image_url: submission.coverImageUrl,
    cover_image_path: submission.coverImagePath,
    audio_duration: submission.audioDuration,
    audio_file_size: submission.audioFileSize,
    round_slug: submission.roundSlug,
    user_id: submission.userId,
    additional_comments: submission.additionalComments,
    round_metadata: submission.roundSlug ? {
      id: submission.roundId,
      slug: submission.roundSlug,
      signup_opens: submission.roundSignupOpens?.toISOString() || null,
      covering_begins: submission.roundCoveringBegins?.toISOString() || null,
      covers_due: submission.roundCoversDue?.toISOString() || null,
    } : null,
  }));
};

/**
 * Get user's votes grouped by round
 */
export const getUserVotes = async (userId: string) => {
  const result = await db
    .select({
      id: songSelectionVotes.id,
      createdAt: songSelectionVotes.createdAt,
      vote: songSelectionVotes.vote,
      songId: songSelectionVotes.songId,
      userId: songSelectionVotes.userId,
      roundId: songSelectionVotes.roundId,
      roundSlug: roundMetadata.slug,
    })
    .from(songSelectionVotes)
    .leftJoin(roundMetadata, eq(songSelectionVotes.roundId, roundMetadata.id))
    .where(eq(songSelectionVotes.userId, userId))
    .orderBy(desc(songSelectionVotes.createdAt));

  // Group by round
  const groupedMap = new Map<string, any>();

  result.forEach((vote) => {
    const roundSlug = vote.roundSlug;
    if (!roundSlug) return;

    const voteRow = {
      id: vote.id,
      created_at: vote.createdAt?.toISOString() || '',
      vote: vote.vote,
      round_slug: roundSlug,
      song_id: vote.songId,
      user_id: vote.userId!,
      submitter_email: null,
    };

    if (!groupedMap.has(roundSlug)) {
      groupedMap.set(roundSlug, {
        round_slug: roundSlug,
        count: 0,
        latest_vote_date: vote.createdAt?.toISOString() || null,
        votes: [],
      });
    }

    const group = groupedMap.get(roundSlug)!;
    group.votes.push(voteRow);
    group.count = group.votes.length;
  });

  return Array.from(groupedMap.values());
};

/**
 * Get participation counts for a user
 */
export const getUserParticipationCounts = async (userId: string) => {
  const [signupsData, submissionsData, votesData] = await Promise.all([
    getUserSignups(userId),
    getUserSubmissions(userId),
    getUserVotes(userId),
  ]);

  return {
    signupCount: signupsData.length,
    submissionCount: submissionsData.length,
    voteCount: votesData.length,
  };
};
