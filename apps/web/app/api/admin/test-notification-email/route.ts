"use server";

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@eptss/core/utils/supabase/server';
import { processNotificationEmails } from '@eptss/core';
import { db, users, userPrivacySettings, notifications } from '@eptss/db';
import { eq, and } from 'drizzle-orm';
import { sendNewNotificationsEmail, sendOutstandingNotificationsEmail } from '@eptss/email';

/**
 * Admin-only endpoint to test notification emails for the logged-in admin user
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authUser = await getAuthUser();

    // Honest absence check: userId is null when not authenticated
    if (!authUser.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      );
    }

    console.log('Auth user ID:', authUser.userId);

    // Get user details from database
    let user;
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.userid, authUser.userId))
        .limit(1);
      user = result[0];
      console.log('User found:', user ? user.email : 'none');
    } catch (dbError) {
      console.error('Database error fetching user:', dbError);
      return NextResponse.json(
        { error: 'Database error fetching user', details: dbError instanceof Error ? dbError.message : String(dbError) },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is admin (you can adjust this check based on your admin logic)
    const isAdmin = user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - admin only' },
        { status: 403 }
      );
    }

    // Get unread notifications count
    let unreadNotifications;
    try {
      console.log('Fetching unread notifications for user:', authUser.userId);
      unreadNotifications = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, authUser.userId),
            eq(notifications.isRead, false),
            eq(notifications.isDeleted, false)
          )
        );
      console.log('Found unread notifications:', unreadNotifications.length);
    } catch (dbError) {
      console.error('Database error fetching notifications:', dbError);
      return NextResponse.json(
        { error: 'Database error fetching notifications', details: dbError instanceof Error ? dbError.message : String(dbError) },
        { status: 500 }
      );
    }

    if (unreadNotifications.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No unread notifications found for your account',
        unreadCount: 0,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const unsubscribeUrl = `${baseUrl}/settings/privacy?unsubscribe=notifications`;

    // Filter out any notifications with missing required fields
    const validNotifications = unreadNotifications
      .filter((n) => n.id && n.title && n.message && n.type && n.createdAt)
      .slice(0, 10)
      .map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        createdAt: new Date(n.createdAt),
        type: n.type,
      }));

    if (validNotifications.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No valid notifications found (notifications may be missing required fields)',
        unreadCount: unreadNotifications.length,
      });
    }

    // Try sending new notifications email
    const emailParams = {
      userEmail: user.email,
      userName: user.publicDisplayName || user.username || undefined,
      notifications: validNotifications,
      baseUrl,
      unsubscribeUrl,
    };

    console.log('Sending notification email with params:', {
      userEmail: emailParams.userEmail,
      userName: emailParams.userName,
      notificationCount: emailParams.notifications.length,
      baseUrl: emailParams.baseUrl,
      unsubscribeUrl: emailParams.unsubscribeUrl,
      sampleNotification: emailParams.notifications[0],
    });

    const emailResult = await sendNewNotificationsEmail(emailParams);

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${user.email}`,
        emailsSent: 1,
        unreadCount: unreadNotifications.length,
        emailType: 'new_notifications',
        recipientEmail: user.email,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send test email',
        error: emailResult.error,
        unreadCount: unreadNotifications.length,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error testing notification email:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
