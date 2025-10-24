"use server";

import { db } from "@/db";
import { emailRemindersSent, signUps, submissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { AsyncResult, createSuccessResult, createErrorResult } from '@/types/asyncResult';
import { ReminderEmailType } from '@/utils/reminderEmailScheduler';

/**
 * Check if a reminder email has already been sent to a user for a specific round
 */
export async function hasReminderBeenSent(
  roundId: number,
  userId: string,
  emailType: ReminderEmailType
): Promise<boolean> {
  try {
    const existing = await db
      .select()
      .from(emailRemindersSent)
      .where(
        and(
          eq(emailRemindersSent.roundId, roundId),
          eq(emailRemindersSent.userId, userId),
          eq(emailRemindersSent.emailType, emailType)
        )
      )
      .limit(1);

    return existing.length > 0;
  } catch (error) {
    console.error('[hasReminderBeenSent] Error:', error);
    return false; // Fail open - if we can't check, don't send
  }
}

/**
 * Record that a reminder email was sent
 */
export async function recordReminderSent(
  roundId: number,
  userId: string,
  emailType: ReminderEmailType,
  success: boolean = true,
  errorMessage?: string
): Promise<AsyncResult<void>> {
  try {
    await db.insert(emailRemindersSent).values({
      roundId,
      userId,
      emailType,
      success,
      errorMessage: errorMessage || null,
    });

    return createSuccessResult(undefined);
  } catch (error) {
    console.error('[recordReminderSent] Error:', error);
    return createErrorResult(error instanceof Error ? error : new Error('Failed to record reminder'));
  }
}

/**
 * Get all users who signed up for a round
 */
export async function getUsersSignedUpForRound(roundId: number): Promise<AsyncResult<string[]>> {
  try {
    const signups = await db
      .select({ userId: signUps.userId })
      .from(signUps)
      .where(eq(signUps.roundId, roundId));

    const userIds = signups.map(s => s.userId).filter(Boolean) as string[];
    return createSuccessResult(userIds);
  } catch (error) {
    console.error('[getUsersSignedUpForRound] Error:', error);
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get signed up users'));
  }
}

/**
 * Get all users who have submitted a cover for a round
 */
export async function getUsersWhoSubmitted(roundId: number): Promise<AsyncResult<string[]>> {
  try {
    const subs = await db
      .select({ userId: submissions.userId })
      .from(submissions)
      .where(eq(submissions.roundId, roundId));

    const userIds = subs.map(s => s.userId).filter(Boolean) as string[];
    return createSuccessResult(userIds);
  } catch (error) {
    console.error('[getUsersWhoSubmitted] Error:', error);
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get users who submitted'));
  }
}

/**
 * Get users who signed up but haven't submitted yet
 */
export async function getUsersWhoHaventSubmitted(roundId: number): Promise<AsyncResult<string[]>> {
  try {
    const signedUpResult = await getUsersSignedUpForRound(roundId);
    const submittedResult = await getUsersWhoSubmitted(roundId);

    if (signedUpResult.status !== 'success' || submittedResult.status !== 'success') {
      return createErrorResult(new Error('Failed to get user lists'));
    }

    const signedUp = signedUpResult.data;
    const submitted = new Set(submittedResult.data);
    
    const notSubmitted = signedUp.filter(userId => !submitted.has(userId));
    return createSuccessResult(notSubmitted);
  } catch (error) {
    console.error('[getUsersWhoHaventSubmitted] Error:', error);
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get users who haven\'t submitted'));
  }
}

/**
 * Check if a specific user has submitted for a round
 */
export async function hasUserSubmitted(roundId: number, userId: string): Promise<boolean> {
  try {
    const submission = await db
      .select()
      .from(submissions)
      .where(
        and(
          eq(submissions.roundId, roundId),
          eq(submissions.userId, userId)
        )
      )
      .limit(1);

    return submission.length > 0;
  } catch (error) {
    console.error('[hasUserSubmitted] Error:', error);
    return false;
  }
}
