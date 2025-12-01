import { NextRequest, NextResponse } from 'next/server';
import { processNotificationEmails } from '@eptss/data-access/services/notificationEmailService';

/**
 * API route to automatically send notification emails to users
 * This should be called by a cron job (GitHub Actions) every 8 hours
 *
 * Logic:
 * 1. Get all users with notification emails enabled
 * 2. For each user:
 *    - Check if they have new unread notifications (and haven't been emailed recently)
 *    - Check if they have old unread notifications (reminder)
 * 3. Send appropriate emails and record them in the database
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the request is authorized
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken) {
      console.error('[send-notification-emails] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${expectedToken}`) {
      console.warn('[send-notification-emails] Unauthorized request attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[send-notification-emails] Starting notification email processing');

    // Process all notification emails
    const result = await processNotificationEmails();

    if (!result.success) {
      console.error('[send-notification-emails] Processing failed', {
        emailsSent: result.emailsSent,
        errorCount: result.errors.length,
        errors: result.errors.slice(0, 5), // Log first 5 errors
      });

      return NextResponse.json(
        {
          success: false,
          message: `Sent ${result.emailsSent} emails with ${result.errors.length} error(s)`,
          emailsSent: result.emailsSent,
          errorCount: result.errors.length,
          errors: result.errors.slice(0, 10), // Return first 10 errors
        },
        { status: 500 }
      );
    }

    console.log('[send-notification-emails] Processing complete', {
      emailsSent: result.emailsSent,
    });

    return NextResponse.json(
      {
        success: true,
        message: result.emailsSent === 0
          ? 'No notification emails needed to be sent'
          : `Successfully sent ${result.emailsSent} notification email(s)`,
        emailsSent: result.emailsSent,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[send-notification-emails] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
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
