/**
 * Reflection Scheduler
 *
 * Determines when different types of reflections should be available
 * based on the current round's phase and dates.
 */

export type ReflectionType = 'initial' | 'checkin';

export interface ReflectionSchedule {
  /** Whether initial reflections can be created */
  canCreateInitial: boolean;
  /** Whether check-in reflections can be created */
  canCreateCheckin: boolean;
  /** Message to display to user about reflection availability */
  availabilityMessage: string;
  /** Current phase that determines reflection behavior */
  currentPhase: 'signup' | 'voting' | 'covering' | 'celebration';
  /** When check-in reflections become available (if in future) */
  checkinAvailableDate?: Date;
}

export interface RoundDates {
  signupOpens: Date;
  votingOpens: Date;
  coveringBegins: Date;
  coversDue: Date;
  listeningParty: Date;
}

/**
 * Calculates the midpoint date between covering begins and covers due
 * Check-in reflections become available at the halfway point of the covering phase
 */
export function calculateCheckinDate(coveringBegins: Date, coversDue: Date): Date {
  const coveringStart = coveringBegins.getTime();
  const coveringEnd = coversDue.getTime();
  const midpoint = Math.floor((coveringStart + coveringEnd) / 2);
  return new Date(midpoint);
}

/**
 * Determines the current phase based on round dates and current time
 */
export function getCurrentPhase(dates: RoundDates, now: Date = new Date()): 'signup' | 'voting' | 'covering' | 'celebration' {
  const currentTime = now.getTime();

  if (currentTime < dates.votingOpens.getTime()) {
    return 'signup';
  }
  if (currentTime < dates.coveringBegins.getTime()) {
    return 'voting';
  }
  if (currentTime < dates.coversDue.getTime()) {
    return 'covering';
  }
  return 'celebration';
}

/**
 * Main function to determine reflection availability and scheduling
 *
 * Rules:
 * - Initial reflections: Available during signup, voting, and first half of covering
 * - Check-in reflections: Available from midpoint of covering through celebration
 *
 * @param dates - Round date information
 * @param hasInitialReflection - Whether user has already created an initial reflection
 * @param now - Current time (defaults to now, can be overridden for testing)
 */
export function getReflectionSchedule(
  dates: RoundDates,
  hasInitialReflection: boolean = false,
  now: Date = new Date()
): ReflectionSchedule {
  const currentPhase = getCurrentPhase(dates, now);
  const currentTime = now.getTime();
  const checkinDate = calculateCheckinDate(dates.coveringBegins, dates.coversDue);
  const checkinAvailable = currentTime >= checkinDate.getTime();

  let canCreateInitial = false;
  let canCreateCheckin = false;
  let availabilityMessage = '';
  console.log({currentPhase})
  switch (currentPhase) {
    case 'signup':
    case 'voting':
      canCreateInitial = !hasInitialReflection;
      canCreateCheckin = false;

      if (!hasInitialReflection) {
        availabilityMessage = 'Create your initial reflection to capture your thoughts at the start of this round.';
      } else {
        availabilityMessage = `Check-in reflections will be available ${formatDate(checkinDate)} (midway through the covering phase).`;
      }
      break;

    case 'covering':
      if (checkinAvailable) {
        // Second half of covering - check-ins available
        canCreateInitial = false;
        canCreateCheckin = true;
        availabilityMessage = 'Create a check-in reflection to share your progress and current thoughts.';
      } else {
        // First half of covering - still time for initial
        canCreateInitial = !hasInitialReflection;
        canCreateCheckin = false;

        if (!hasInitialReflection) {
          availabilityMessage = `Create your initial reflection before ${formatDate(checkinDate)}, when check-in reflections become available.`;
        } else {
          availabilityMessage = `Check-in reflections will be available ${formatDate(checkinDate)}.`;
        }
      }
      break;

    case 'celebration':
      // After covers due - only check-ins available
      canCreateInitial = false;
      canCreateCheckin = true;
      availabilityMessage = 'Create a check-in reflection to share your final thoughts on this round.';
      break;
  }

  return {
    canCreateInitial,
    canCreateCheckin,
    availabilityMessage,
    currentPhase,
    checkinAvailableDate: !checkinAvailable ? checkinDate : undefined,
  };
}

/**
 * Determines which reflection type should be created based on current schedule
 * Returns the appropriate type, or null if no reflections can be created
 */
export function getAvailableReflectionType(
  dates: RoundDates,
  hasInitialReflection: boolean = false,
  now: Date = new Date()
): ReflectionType | null {
  const schedule = getReflectionSchedule(dates, hasInitialReflection, now);

  if (schedule.canCreateCheckin) {
    return 'checkin';
  }
  if (schedule.canCreateInitial) {
    return 'initial';
  }
  return null;
}

/**
 * Simple date formatter for messages
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
