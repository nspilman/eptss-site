import { NextRequest, NextResponse } from 'next/server';
import {
  determineRemindersToSend,
  type ReminderEmailType,
  hasReminderBeenSent,
  recordReminderSent,
  getUsersSignedUpForRound,
  hasUserSubmitted,
  getUserInfo,
  getAllProjects
} from '@eptss/core';
import { getCurrentRound, formatDate } from '@eptss/rounds/services';
import { getProjectAutomation } from '@eptss/project-config';
import type { ProjectSlug } from '@eptss/core';
import {
  sendVotingClosesTomorrowEmail,
  sendCoveringHalfwayEmail,
  sendCoveringOneMonthLeftEmail,
  sendCoveringLastWeekEmail,
  sendCoversDueTomorrowEmail,
  type EmailResult
} from '@eptss/email';

/**
 * API route to automatically send reminder emails throughout the round
 * This should be called by a cron job (GitHub Actions) daily
 *
 * Logic:
 * 1. Loop through all active projects
 * 2. Check if email reminders are enabled for each project
 * 3. Get the current round for each enabled project
 * 4. Determine which reminder emails should be sent today
 * 5. For each email type, get the list of recipients
 * 6. Check if we've already sent this email to each user
 * 7. Send emails and record them in the database
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

    // Get all active projects
    const allProjects = await getAllProjects();
    const activeProjects = allProjects.filter(p => p.isActive);

    console.log(`[send-reminder-emails] Processing ${activeProjects.length} active project(s)`);

    const projectResults = [];
    let totalEmailsSent = 0;

    // Loop through each project
    for (const project of activeProjects) {
      try {
        // Check if email reminders are enabled for this project
        const automation = await getProjectAutomation(project.slug as ProjectSlug);

        if (!automation.enableEmailReminders) {
          console.log(`[send-reminder-emails] Email reminders disabled for project: ${project.slug}`);
          projectResults.push({
            project: project.slug,
            skipped: true,
            reason: 'Email reminders disabled'
          });
          continue;
        }

        // Get the current round for this project
        const currentRoundResult = await getCurrentRound(project.id);

        if (currentRoundResult.status !== 'success') {
          console.log(`[send-reminder-emails] No current round found for project: ${project.slug}`);
          projectResults.push({
            project: project.slug,
            skipped: true,
            reason: 'No current round'
          });
          continue;
        }

        const round = currentRoundResult.data;
        console.log(`[send-reminder-emails] [${project.slug}] Current round: ${round.slug} (ID: ${round.roundId})`);

        // Determine which reminders should be sent
        const triggers = determineRemindersToSend(round);

        if (triggers.length === 0) {
          console.log(`[send-reminder-emails] [${project.slug}] No reminders to send today`);
          projectResults.push({
            project: project.slug,
            round: {
              id: round.roundId,
              slug: round.slug
            },
            triggered: false
          });
          continue;
        }

        console.log(`[send-reminder-emails] [${project.slug}] ${triggers.length} reminder type(s) triggered:`, triggers.map(t => t.emailType));

        const results = {
          sent: [] as Array<{ emailType: string; recipientCount: number }>,
          errors: [] as Array<{ emailType: string; error: string }>,
        };

        // Process each reminder type
        for (const trigger of triggers) {
          try {
            const emailsSent = await sendReminderEmailsForType(project.id, round, trigger.emailType);
            results.sent.push({
              emailType: trigger.emailType,
              recipientCount: emailsSent
            });
            totalEmailsSent += emailsSent;
            console.log(`[send-reminder-emails] [${project.slug}] Sent ${emailsSent} ${trigger.emailType} emails`);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[send-reminder-emails] [${project.slug}] Error sending ${trigger.emailType}:`, errorMsg);
            results.errors.push({
              emailType: trigger.emailType,
              error: errorMsg
            });
          }
        }

        projectResults.push({
          project: project.slug,
          round: {
            id: round.roundId,
            slug: round.slug
          },
          triggered: true,
          results
        });

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[send-reminder-emails] Error processing project ${project.slug}:`, errorMsg);
        projectResults.push({
          project: project.slug,
          error: errorMsg
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Processed ${activeProjects.length} project(s), sent ${totalEmailsSent} total email(s)`,
        action: 'sent',
        projectResults
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
  projectId: string,
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
      const user = await getUserInfo(userId);

      if (!user) {
        console.warn(`[send-reminder-emails] User ${userId} not found`);
        continue;
      }

      const userHasSubmitted = await hasUserSubmitted(round.roundId, userId);

      // Send the appropriate reminder email
      const roundName = round.slug || `Round ${round.roundId}`;
      const songTitle = round.song.title || 'TBD';
      const songArtist = round.song.artist || 'TBD';

      let result: EmailResult;

      switch (emailType) {
        case 'voting_closes_tomorrow':
          result = await sendVotingClosesTomorrowEmail({
            userEmail: user.email,
            userName: user.username || user.email,
            roundName,
            roundSlug: round.slug || round.roundId.toString(),
            votingCloses: formatDate.full(round.coveringBegins)
          });
          break;

        case 'covering_halfway':
          result = await sendCoveringHalfwayEmail({
            userEmail: user.email,
            userName: user.username || user.email,
            roundName,
            roundSlug: round.slug || round.roundId.toString(),
            songTitle,
            songArtist,
            coversDue: formatDate.full(round.coversDue)
          });
          break;

        case 'covering_one_month_left':
          result = await sendCoveringOneMonthLeftEmail({
            userEmail: user.email,
            userName: user.username || user.email,
            roundName,
            roundSlug: round.slug || round.roundId.toString(),
            songTitle,
            songArtist,
            coversDue: formatDate.full(round.coversDue),
            hasSubmitted: userHasSubmitted
          });
          break;

        case 'covering_last_week':
          result = await sendCoveringLastWeekEmail({
            userEmail: user.email,
            userName: user.username || user.email,
            roundName,
            roundSlug: round.slug || round.roundId.toString(),
            songTitle,
            songArtist,
            coversDue: formatDate.full(round.coversDue),
            hasSubmitted: userHasSubmitted
          });
          break;

        case 'covers_due_tomorrow':
          result = await sendCoversDueTomorrowEmail({
            userEmail: user.email,
            userName: user.username || user.email,
            roundName,
            roundSlug: round.slug || round.roundId.toString(),
            songTitle,
            songArtist,
            coversDue: formatDate.full(round.coversDue),
            listeningParty: formatDate.full(round.listeningParty),
            hasSubmitted: userHasSubmitted
          });
          break;

        default:
          console.warn(`[send-reminder-emails] Unknown email type: ${emailType}`);
          result = { success: false, error: 'Unknown email type' };
      }

      console.log(`[send-reminder-emails] ${result.success ? 'Sent' : 'Failed to send'} ${emailType} to ${user.email} (user: ${user.username})`);

      // Record the email send
      await recordReminderSent(
        projectId,
        round.roundId,
        userId,
        emailType,
        result.success,
        result.error
      );

      if (result?.success) {
        emailsSent++;
      }

    } catch (error) {
      console.error(`[send-reminder-emails] Error sending to user ${userId}:`, error);
      // Record the failure
      await recordReminderSent(
        projectId,
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
