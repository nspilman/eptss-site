/**
 * Helper functions to determine when reminder emails should be sent
 * 
 * The cron job runs daily and checks:
 * 1. What phase is the current round in?
 * 2. Are we at a trigger point for any reminder emails?
 * 3. Has this email already been sent to this user?
 */

import { Round } from '@eptss/data-access';

export type ReminderEmailType = 
  | 'voting_closes_tomorrow'
  | 'covering_halfway'
  | 'covering_one_month_left'
  | 'covering_last_week'
  | 'covers_due_tomorrow';

export interface ReminderEmailTrigger {
  emailType: ReminderEmailType;
  shouldSend: boolean;
  reason?: string;
}

/**
 * Calculate the number of days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

/**
 * Check if a date is tomorrow (within 24-48 hours from now)
 */
function isTomorrow(date: Date): boolean {
  const now = new Date();
  const hoursUntil = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntil > 0 && hoursUntil <= 48; // Send if within 24-48 hours
}

/**
 * Check if we're at the halfway point of the covering period
 */
function isHalfwayCovering(coveringBegins: Date, coversDue: Date): boolean {
  const now = new Date();
  const totalDuration = coversDue.getTime() - coveringBegins.getTime();
  const elapsed = now.getTime() - coveringBegins.getTime();
  const percentComplete = elapsed / totalDuration;
  
  // Send when we're between 48-52% complete (gives a 4% window around halfway)
  return percentComplete >= 0.48 && percentComplete <= 0.52;
}

/**
 * Check if there's approximately one month left in the covering period
 */
function isOneMonthLeft(coversDue: Date): boolean {
  const now = new Date();
  const daysUntilDue = daysBetween(now, coversDue);
  
  // Send when there are 28-32 days left (gives a 4-day window around 30 days)
  return daysUntilDue >= 28 && daysUntilDue <= 32;
}

/**
 * Check if we're in the last week of the covering period
 */
function isLastWeek(coversDue: Date): boolean {
  const now = new Date();
  const daysUntilDue = daysBetween(now, coversDue);
  
  // Send when there are 6-8 days left (gives a 2-day window around 7 days)
  return daysUntilDue >= 6 && daysUntilDue <= 8;
}

/**
 * Determine which reminder emails should be sent for the current round
 * This is called by the cron job daily
 */
export function determineRemindersToSend(round: Round): ReminderEmailTrigger[] {
  const now = new Date();
  const triggers: ReminderEmailTrigger[] = [];

  // 1. Voting closes tomorrow
  if (isTomorrow(round.coveringBegins)) {
    triggers.push({
      emailType: 'voting_closes_tomorrow',
      shouldSend: true,
      reason: `Voting closes on ${round.coveringBegins.toISOString()}`
    });
  }

  // 2. Halfway through covering period
  if (now >= round.coveringBegins && now < round.coversDue) {
    if (isHalfwayCovering(round.coveringBegins, round.coversDue)) {
      triggers.push({
        emailType: 'covering_halfway',
        shouldSend: true,
        reason: 'Halfway through the covering period'
      });
    }
  }

  // 3. One month left to cover
  if (now >= round.coveringBegins && now < round.coversDue) {
    if (isOneMonthLeft(round.coversDue)) {
      triggers.push({
        emailType: 'covering_one_month_left',
        shouldSend: true,
        reason: `Approximately 30 days until covers due (${round.coversDue.toISOString()})`
      });
    }
  }

  // 4. Last week of covering period
  if (now >= round.coveringBegins && now < round.coversDue) {
    if (isLastWeek(round.coversDue)) {
      triggers.push({
        emailType: 'covering_last_week',
        shouldSend: true,
        reason: `One week until covers due (${round.coversDue.toISOString()})`
      });
    }
  }

  // 5. Covers due tomorrow
  if (isTomorrow(round.coversDue)) {
    triggers.push({
      emailType: 'covers_due_tomorrow',
      shouldSend: true,
      reason: `Covers due on ${round.coversDue.toISOString()}`
    });
  }

  return triggers;
}

/**
 * Get a human-readable description of when an email should be sent
 */
export function getEmailTriggerDescription(emailType: ReminderEmailType): string {
  switch (emailType) {
    case 'voting_closes_tomorrow':
      return 'Sent 24-48 hours before voting closes';
    case 'covering_halfway':
      return 'Sent at the midpoint of the covering period';
    case 'covering_one_month_left':
      return 'Sent when ~30 days remain in the covering period';
    case 'covering_last_week':
      return 'Sent when ~7 days remain in the covering period';
    case 'covers_due_tomorrow':
      return 'Sent 24-48 hours before covers are due';
  }
}
