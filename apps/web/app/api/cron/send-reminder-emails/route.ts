import { NextRequest, NextResponse } from 'next/server';
import { getCurrentRound } from '@/data-access/roundService';
import { determineRemindersToSend, ReminderEmailType } from '@/utils/reminderEmailScheduler';
import { 
  hasReminderBeenSent, 
  recordReminderSent, 
  getUsersSignedUpForRound,
  getUsersWhoHaventSubmitted,
  hasUserSubmitted
} from '@/data-access';
import { 
  sendVotingClosesTomorrowEmail,
  sendCoveringHalfwayEmail,
  sendCoveringOneMonthLeftEmail,
  sendCoveringLastWeekEmail,
  sendCoversDueTomorrowEmail
} from '@/services/emailService';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { formatDate } from '@/services/dateService';

/**
 * API route to automatically send reminder emails throughout the round
 * This should be called by a cron job (GitHub Actions) daily
 * 
 * Logic:
 * 1. Get the current round
 * 2. Determine which reminder emails should be sent today
 * 3. For each email type, get the list of recipients
 * 4. Check if we've already sent this email to each user
 * 5. Send emails and record them in the database
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the request is authorized
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken) {
      console.error('[send-reminder-emails] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${expectedToken}`) {
      console.warn('[send-reminder-emails] Unauthorized request attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the current round
    const currentRoundResult = await getCurrentRound();
    
    if (currentRoundResult.status !== 'success') {
      console.log('[send-reminder-emails] No current round found');
      return NextResponse.json(
        { 
          success: true, 
          message: 'No current round found',
          action: 'none'
        },
        { status: 200 }
      );
    }

    const round = currentRoundResult.data;
    console.log(`[send-reminder-emails] Current round: ${round.slug} (ID: ${round.roundId})`);

    // Determine which reminders should be sent
    const triggers = determineRemindersToSend(round);

    if (triggers.length === 0) {
      console.log('[send-reminder-emails] No reminders to send today');
      return NextResponse.json(
        { 
          success: true, 
          message: 'No reminders triggered for today',
          action: 'none',
          round: {
            id: round.roundId,
            slug: round.slug
          }
        },
        { status: 200 }
      );
    }

    console.log(`[send-reminder-emails] ${triggers.length} reminder type(s) triggered:`, triggers.map(t => t.emailType));

    const results = {
      sent: [] as Array<{ emailType: string; recipientCount: number }>,
      errors: [] as Array<{ emailType: string; error: string }>,
    };

    // Process each reminder type
    for (const trigger of triggers) {
      try {
        const emailsSent = await sendReminderEmailsForType(round, trigger.emailType);
        results.sent.push({
          emailType: trigger.emailType,
          recipientCount: emailsSent
        });
        console.log(`[send-reminder-emails] Sent ${emailsSent} ${trigger.emailType} emails`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[send-reminder-emails] Error sending ${trigger.emailType}:`, errorMsg);
        results.errors.push({
          emailType: trigger.emailType,
          error: errorMsg
        });
      }
    }

    const totalSent = results.sent.reduce((sum, r) => sum + r.recipientCount, 0);

    return NextResponse.json(
      { 
        success: true, 
        message: `Sent ${totalSent} reminder email(s)`,
        action: 'sent',
        round: {
          id: round.roundId,
          slug: round.slug
        },
        results
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[send-reminder-emails] Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * Send reminder emails for a specific type
 */
async function sendReminderEmailsForType(
  round: any,
  emailType: ReminderEmailType
): Promise<number> {
  // Determine recipients based on email type
  let recipientUserIds: string[] = [];

  switch (emailType) {
    case 'voting_closes_tomorrow':
      // Send to all users who signed up
      const signedUpResult = await getUsersSignedUpForRound(round.roundId);
      if (signedUpResult.status === 'success') {
        recipientUserIds = signedUpResult.data;
      }
      break;

    case 'covering_halfway':
      // Send to all users who signed up
      const halfwayResult = await getUsersSignedUpForRound(round.roundId);
      if (halfwayResult.status === 'success') {
        recipientUserIds = halfwayResult.data;
      }
      break;

    case 'covering_one_month_left':
    case 'covering_last_week':
    case 'covers_due_tomorrow':
      // Send to all users who signed up (both submitted and not)
      const allUsersResult = await getUsersSignedUpForRound(round.roundId);
      if (allUsersResult.status === 'success') {
        recipientUserIds = allUsersResult.data;
      }
      break;
  }

  let emailsSent = 0;

  // Send emails to each recipient
  for (const userId of recipientUserIds) {
    try {
      // Check if we've already sent this email to this user
      const alreadySent = await hasReminderBeenSent(round.roundId, userId, emailType);
      if (alreadySent) {
        console.log(`[send-reminder-emails] Already sent ${emailType} to user ${userId}`);
        continue;
      }

      // Get user details
      const userRecord = await db
        .select()
        .from(users)
        .where(eq(users.userid, userId))
        .limit(1);

      if (userRecord.length === 0) {
        console.warn(`[send-reminder-emails] User ${userId} not found`);
        continue;
      }

      const user = userRecord[0];
      const hasSubmitted = await hasUserSubmitted(round.roundId, userId);

      // Send the appropriate email
      let result;
      const roundName = round.slug || `Round ${round.roundId}`;
      const songTitle = round.song.title || 'TBD';
      const songArtist = round.song.artist || 'TBD';

      switch (emailType) {
        case 'voting_closes_tomorrow':
          result = await sendVotingClosesTomorrowEmail({
            userEmail: user.email,
            userName: user.username || user.email.split('@')[0],
            roundName,
            roundSlug: round.slug,
            votingCloses: formatDate.compact(round.coveringBegins),
          });
          break;

        case 'covering_halfway':
          result = await sendCoveringHalfwayEmail({
            userEmail: user.email,
            userName: user.username || user.email.split('@')[0],
            roundName,
            roundSlug: round.slug,
            songTitle,
            songArtist,
            coversDue: formatDate.compact(round.coversDue),
          });
          break;

        case 'covering_one_month_left':
          result = await sendCoveringOneMonthLeftEmail({
            userEmail: user.email,
            userName: user.username || user.email.split('@')[0],
            roundName,
            roundSlug: round.slug,
            songTitle,
            songArtist,
            coversDue: formatDate.compact(round.coversDue),
            hasSubmitted,
          });
          break;

        case 'covering_last_week':
          result = await sendCoveringLastWeekEmail({
            userEmail: user.email,
            userName: user.username || user.email.split('@')[0],
            roundName,
            roundSlug: round.slug,
            songTitle,
            songArtist,
            coversDue: formatDate.compact(round.coversDue),
            hasSubmitted,
          });
          break;

        case 'covers_due_tomorrow':
          result = await sendCoversDueTomorrowEmail({
            userEmail: user.email,
            userName: user.username || user.email.split('@')[0],
            roundName,
            roundSlug: round.slug,
            songTitle,
            songArtist,
            coversDue: formatDate.compact(round.coversDue),
            listeningParty: formatDate.compact(round.listeningParty),
            hasSubmitted,
          });
          break;
      }

      // Record the email send
      await recordReminderSent(
        round.roundId,
        userId,
        emailType,
        result?.success || false,
        result?.error
      );

      if (result?.success) {
        emailsSent++;
      }

    } catch (error) {
      console.error(`[send-reminder-emails] Error sending to user ${userId}:`, error);
      // Record the failure
      await recordReminderSent(
        round.roundId,
        userId,
        emailType,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  return emailsSent;
}

// Optional: Support GET for manual testing (only in development)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'GET method not allowed in production' },
      { status: 405 }
    );
  }

  // In development, allow GET requests for testing
  return POST(request);
}
