"use server";

import * as React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { RoundSignupConfirmation } from '@/emails/templates/RoundSignupConfirmation';
import { AdminSignupNotification } from '@/emails/templates/AdminSignupNotification';
import { VotingConfirmation } from '@/emails/templates/VotingConfirmation';
import { AdminVotingNotification } from '@/emails/templates/AdminVotingNotification';
import { SubmissionConfirmation } from '@/emails/templates/SubmissionConfirmation';
import { AdminSubmissionNotification } from '@/emails/templates/AdminSubmissionNotification';

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
