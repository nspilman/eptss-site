/**
 * Server-side logging for bot attempts
 */

import type { BotAttemptData } from '../types';

/**
 * Log a bot attempt to the database
 * This function is designed to be imported and used by data-access services
 * to avoid circular dependencies.
 *
 * @param data - Bot attempt data to log
 */
export async function logBotAttempt(data: BotAttemptData): Promise<void> {
  try {
    // Import dynamically to avoid circular dependencies
    const { db } = await import('@eptss/data-access/db');
    const { botAttempts } = await import('@eptss/data-access/db/schema');

    await db.insert(botAttempts).values({
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      captchaScore: data.captchaScore?.toString(),
      attemptType: data.attemptType,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    });

    console.log(`[Bot Attempt Logged] Type: ${data.attemptType}, IP: ${data.ipAddress}, Score: ${data.captchaScore}`);
  } catch (error) {
    // Don't throw - logging failures shouldn't break the application
    console.error('[logBotAttempt] Failed to log bot attempt:', error);
  }
}
