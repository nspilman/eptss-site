"use server";

import { Resend } from 'resend';
import { render } from '@react-email/render';
import { RoundSignupConfirmation } from '@/emails/templates/RoundSignupConfirmation';

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
    RoundSignupConfirmation({
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

  return sendEmail({
    to,
    subject: `🎵 You're signed up for ${roundName}!`,
    html,
  });
}
