"use server";

import * as React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/render';
// Email template imports
import { RoundSignupConfirmation } from '../templates/RoundSignupConfirmation';
import { AdminSignupNotification } from '../templates/AdminSignupNotification';
import { VotingConfirmation } from '../templates/VotingConfirmation';
import { AdminVotingNotification } from '../templates/AdminVotingNotification';
import { SubmissionConfirmation } from '../templates/SubmissionConfirmation';
import { AdminSubmissionNotification } from '../templates/AdminSubmissionNotification';
import { AdminSongAssignmentNotification } from '../templates/AdminSongAssignmentNotification';
import { VotingClosesTomorrow } from '../templates/VotingClosesTomorrow';
import { CoveringHalfway } from '../templates/CoveringHalfway';
import { CoveringOneMonthLeft } from '../templates/CoveringOneMonthLeft';
import { CoveringLastWeek } from '../templates/CoveringLastWeek';
import { CoversDueTomorrow } from '../templates/CoversDueTomorrow';

// Initialize Resend client
const resend = new Resend(process.env.NEXT_RESEND_API_KEY);

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'EPTSS <noreply@everyoneplaysthesamesong.com>';

// Base email sending function
export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Core email sending function using Resend SDK
 * This is the base function that all other email functions should use
 */
export async function sendEmail(params: SendEmailParams): Promise<EmailResult> {
  try {
    const { to, subject, html, replyTo } = params;

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo && { replyTo }),
    });

    if (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('Unexpected error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send a round signup confirmation email
 */
export interface RoundSignupConfirmationParams {
  to: string;
  userName?: string;
  roundName: string;
  songTitle: string;
  artist: string;
  youtubeLink: string;
  roundSlug: string;
  phaseDates: {
    votingOpens: string;
    coveringBegins: string;
    coversDue: string;
    listeningParty: string;
  };
}

export async function sendRoundSignupConfirmation(
  params: RoundSignupConfirmationParams
): Promise<EmailResult> {
  const {
    to,
    userName,
    roundName,
    songTitle,
    artist,
    youtubeLink,
    roundSlug,
    phaseDates,
  } = params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://everyoneplaysthesamesong.com';
  const roundUrl = `${baseUrl}/round/${roundSlug}`;

  // Render React Email template to HTML
  const html = await render(
    React.createElement(RoundSignupConfirmation, {
      userName,
      roundName,
      songTitle,
      artist,
      youtubeLink,
      roundUrl,
      baseUrl,
      phaseDates,
    })
  );

  // Send user confirmation email
  const userEmailResult = await sendEmail({
    to,
    subject: `🎵 You're signed up for ${roundName}!`,
    html,
  });

  // Send admin notification email (don't fail if this fails)
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (adminEmail) {
    try {
      await sendAdminSignupNotification({
        userEmail: to,
        userName,
        songTitle,
        artist,
        youtubeLink,
        roundName,
        roundSlug,
      });
    } catch (error) {
      console.error('Failed to send admin notification:', error);
      // Don't fail the whole operation if admin email fails
    }
  }

  return userEmailResult;
}

/**
 * Send admin notification when a user signs up
 */
export interface AdminSignupNotificationParams {
  userEmail: string;
  userName?: string;
  songTitle: string;
  artist: string;
  youtubeLink: string;
  roundName: string;
  roundSlug: string;
}

export async function sendAdminSignupNotification(
  params: AdminSignupNotificationParams
): Promise<EmailResult> {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  
  if (!adminEmail) {
    return {
      success: false,
      error: 'Admin email not configured',
    };
  }

  const {
    userEmail,
    userName,
    songTitle,
    artist,
    youtubeLink,
    roundName,
    roundSlug,
  } = params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://everyoneplaysthesamesong.com';
  const roundUrl = `${baseUrl}/round/${roundSlug}`;

  // Render React Email template to HTML
  const html = await render(
    React.createElement(AdminSignupNotification, {
      userEmail,
      userName,
      songTitle,
      artist,
      youtubeLink,
      roundName,
      roundUrl,
      baseUrl,
    })
  );

  return sendEmail({
    to: adminEmail,
    subject: `New Signup: ${userEmail} - ${songTitle}`,
    html,
  });
}

/**
 * Send voting confirmation email
 */
export interface VotingConfirmationParams {
  userEmail: string;
  userName?: string;
  roundName: string;
  roundSlug: string;
  votedSongs: Array<{
    title: string;
    artist: string;
    rating: number;
  }>;
  phaseDates: {
    coveringBegins: string;
    coversDue: string;
    listeningParty: string;
  };
}

export async function sendVotingConfirmation(
  params: VotingConfirmationParams
): Promise<EmailResult> {
  const {
    userEmail,
    userName,
    roundName,
    roundSlug,
    votedSongs,
    phaseDates,
  } = params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://everyoneplaysthesamesong.com';
  const roundUrl = `${baseUrl}/round/${roundSlug}`;

  // Render React Email template to HTML
  const html = await render(
    React.createElement(VotingConfirmation, {
      userEmail,
      userName,
      roundName,
      roundSlug,
      votedSongs,
      roundUrl,
      baseUrl,
      phaseDates,
    })
  );

  console.log('Voting confirmation HTML length:', html?.length);
  console.log('Voting confirmation HTML preview:', html?.substring(0, 300));

  // Send user confirmation email
  const userEmailResult = await sendEmail({
    to: userEmail,
    subject: `🗳️ Your votes for ${roundName} have been recorded!`,
    html,
  });

  // Send admin notification email (don't fail if this fails)
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (adminEmail) {
    try {
      await sendAdminVotingNotification({
        userEmail,
        userName,
        roundName,
        roundSlug,
        votedSongs,
      });
    } catch (error) {
      console.error('Failed to send admin voting notification:', error);
    }
  }

  return userEmailResult;
}

/**
 * Send admin notification when a user votes
 */
export interface AdminVotingNotificationParams {
  userEmail: string;
  userName?: string;
  roundName: string;
  roundSlug: string;
  votedSongs: Array<{
    title: string;
    artist: string;
    rating: number;
  }>;
}

export async function sendAdminVotingNotification(
  params: AdminVotingNotificationParams
): Promise<EmailResult> {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  
  if (!adminEmail) {
    return {
      success: false,
      error: 'Admin email not configured',
    };
  }

  const {
    userEmail,
    userName,
    roundName,
    roundSlug,
    votedSongs,
  } = params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://everyoneplaysthesamesong.com';
  const roundUrl = `${baseUrl}/round/${roundSlug}`;

  // Render React Email template to HTML
  const html = await render(
    React.createElement(AdminVotingNotification, {
      userEmail,
      userName,
      roundName,
      roundSlug,
      votedSongs,
      roundUrl,
      baseUrl,
    })
  );

  console.log('Admin voting notification HTML length:', html?.length);
  console.log('Admin voting notification HTML preview:', html?.substring(0, 300));

  return sendEmail({
    to: adminEmail,
    subject: `New Votes: ${userEmail} - ${votedSongs.length} songs`,
    html,
  });
}

/**
 * Send submission confirmation email
 */
export interface SubmissionConfirmationParams {
  userEmail: string;
  userName?: string;
  roundName: string;
  roundSlug: string;
  soundcloudUrl: string;
  additionalComments?: {
    coolThingsLearned?: string;
    toolsUsed?: string;
    happyAccidents?: string;
    didntWork?: string;
  };
  listeningPartyDate: string;
}

export async function sendSubmissionConfirmation(
  params: SubmissionConfirmationParams
): Promise<EmailResult> {
  const {
    userEmail,
    userName,
    roundName,
    roundSlug,
    soundcloudUrl,
    additionalComments,
    listeningPartyDate,
  } = params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://everyoneplaysthesamesong.com';
  const roundUrl = `${baseUrl}/round/${roundSlug}`;

  // Render React Email template to HTML
  const html = await render(
    React.createElement(SubmissionConfirmation, {
      userEmail,
      userName,
      roundName,
      roundSlug,
      soundcloudUrl,
      additionalComments,
      roundUrl,
      baseUrl,
      listeningPartyDate,
    })
  );

  // Send user confirmation email
  const userEmailResult = await sendEmail({
    to: userEmail,
    subject: `🎸 Your cover for ${roundName} has been submitted!`,
    html,
  });

  // Send admin notification email (don't fail if this fails)
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (adminEmail) {
    try {
      await sendAdminSubmissionNotification({
        userEmail,
        userName,
        roundName,
        roundSlug,
        soundcloudUrl,
        additionalComments,
      });
    } catch (error) {
      console.error('Failed to send admin submission notification:', error);
    }
  }

  return userEmailResult;
}

/**
 * Send admin notification when a user submits a cover
 */
export interface AdminSubmissionNotificationParams {
  userEmail: string;
  userName?: string;
  roundName: string;
  roundSlug: string;
  soundcloudUrl: string;
  additionalComments?: {
    coolThingsLearned?: string;
    toolsUsed?: string;
    happyAccidents?: string;
    didntWork?: string;
  };
}

export async function sendAdminSubmissionNotification(
  params: AdminSubmissionNotificationParams
): Promise<EmailResult> {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  
  if (!adminEmail) {
    return {
      success: false,
      error: 'Admin email not configured',
    };
  }

  const {
    userEmail,
    userName,
    roundName,
    roundSlug,
    soundcloudUrl,
    additionalComments,
  } = params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://everyoneplaysthesamesong.com';
  const roundUrl = `${baseUrl}/round/${roundSlug}`;

  // Render React Email template to HTML
  const html = await render(
    React.createElement(AdminSubmissionNotification, {
      userEmail,
      userName,
      roundName,
      roundSlug,
      soundcloudUrl,
      additionalComments,
      roundUrl,
      baseUrl,
    })
  );

  return sendEmail({
    to: adminEmail,
    subject: `New Submission: ${userEmail}`,
    html,
  });
}

/**
 * Send admin notification when a song is automatically assigned to a round
 */
export interface AdminSongAssignmentNotificationParams {
  roundName: string;
  roundSlug: string;
  assignedSong: {
    title: string;
    artist: string;
    average: number;
    votesCount: number;
    oneStarCount: number;
  };
  allResults: Array<{
    title: string;
    artist: string;
    average: number;
    votesCount: number;
    oneStarCount: number;
  }>;
}

export async function sendAdminSongAssignmentNotification(
  params: AdminSongAssignmentNotificationParams
): Promise<EmailResult> {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  
  if (!adminEmail) {
    return {
      success: false,
      error: 'Admin email not configured',
    };
  }

  const {
    roundName,
    roundSlug,
    assignedSong,
    allResults,
  } = params;

  // Render React Email template to HTML
  const html = await render(
    React.createElement(AdminSongAssignmentNotification, {
      roundName,
      roundSlug,
      assignedSong,
      allResults,
    })
  );

  return sendEmail({
    to: adminEmail,
    subject: `🎵 Song Auto-Assigned: ${roundName}`,
    html,
  });
}

/**
 * Send reminder emails
 */

// Voting closes tomorrow
export interface VotingClosesTomorrowParams {
  userEmail: string;
  userName: string;
  roundName: string;
  roundSlug: string;
  votingCloses: string;
}

export async function sendVotingClosesTomorrowEmail(
  params: VotingClosesTomorrowParams
): Promise<EmailResult> {
  const { userEmail, userName, roundName, roundSlug, votingCloses } = params;

  const html = await render(
    React.createElement(VotingClosesTomorrow, {
      userName,
      roundName,
      roundSlug,
      votingCloses,
    })
  );

  return sendEmail({
    to: userEmail,
    subject: `⏰ Voting closes tomorrow for ${roundName}`,
    html,
  });
}

// Covering halfway
export interface CoveringHalfwayParams {
  userEmail: string;
  userName: string;
  roundName: string;
  roundSlug: string;
  songTitle: string;
  songArtist: string;
  coversDue: string;
}

export async function sendCoveringHalfwayEmail(
  params: CoveringHalfwayParams
): Promise<EmailResult> {
  const { userEmail, userName, roundName, roundSlug, songTitle, songArtist, coversDue } = params;

  const html = await render(
    React.createElement(CoveringHalfway, {
      userName,
      roundName,
      roundSlug,
      songTitle,
      songArtist,
      coversDue,
    })
  );

  return sendEmail({
    to: userEmail,
    subject: `🎸 Halfway through covering for ${roundName}`,
    html,
  });
}

// One month left
export interface CoveringOneMonthLeftParams {
  userEmail: string;
  userName: string;
  roundName: string;
  roundSlug: string;
  songTitle: string;
  songArtist: string;
  coversDue: string;
  hasSubmitted: boolean;
}

export async function sendCoveringOneMonthLeftEmail(
  params: CoveringOneMonthLeftParams
): Promise<EmailResult> {
  const { userEmail, userName, roundName, roundSlug, songTitle, songArtist, coversDue, hasSubmitted } = params;

  const html = await render(
    React.createElement(CoveringOneMonthLeft, {
      userName,
      roundName,
      roundSlug,
      songTitle,
      songArtist,
      coversDue,
      hasSubmitted,
    })
  );

  return sendEmail({
    to: userEmail,
    subject: `📅 One month left to submit your cover for ${roundName}`,
    html,
  });
}

// Last week
export interface CoveringLastWeekParams {
  userEmail: string;
  userName: string;
  roundName: string;
  roundSlug: string;
  songTitle: string;
  songArtist: string;
  coversDue: string;
  hasSubmitted: boolean;
}

export async function sendCoveringLastWeekEmail(
  params: CoveringLastWeekParams
): Promise<EmailResult> {
  const { userEmail, userName, roundName, roundSlug, songTitle, songArtist, coversDue, hasSubmitted } = params;

  const html = await render(
    React.createElement(CoveringLastWeek, {
      userName,
      roundName,
      roundSlug,
      songTitle,
      songArtist,
      coversDue,
      hasSubmitted,
    })
  );

  return sendEmail({
    to: userEmail,
    subject: `⏰ Final week to submit your cover for ${roundName}`,
    html,
  });
}

// Covers due tomorrow
export interface CoversDueTomorrowParams {
  userEmail: string;
  userName: string;
  roundName: string;
  roundSlug: string;
  songTitle: string;
  songArtist: string;
  coversDue: string;
  listeningParty: string;
  hasSubmitted: boolean;
}

export async function sendCoversDueTomorrowEmail(
  params: CoversDueTomorrowParams
): Promise<EmailResult> {
  const { userEmail, userName, roundName, roundSlug, songTitle, songArtist, coversDue, listeningParty, hasSubmitted } = params;

  const html = await render(
    React.createElement(CoversDueTomorrow, {
      userName,
      roundName,
      roundSlug,
      songTitle,
      songArtist,
      coversDue,
      listeningParty,
      hasSubmitted,
    })
  );

  return sendEmail({
    to: userEmail,
    subject: `🚨 FINAL CALL: Covers due tomorrow for ${roundName}`,
    html,
  });
}
