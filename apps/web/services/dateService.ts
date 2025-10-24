import { format, subDays, isBefore, parseISO, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { Phase } from "@eptss/data-access/types/round";

export interface RoundDates {
  signupOpens: Date;
  votingOpens: Date;
  coveringBegins: Date;
  coversDue: Date;
  listeningParty: Date;
}

/**
 * Parse a date string or Date object into a Date object
 * @param date Date string or Date object
 * @returns Parsed Date object
 */
export const parseDate = (date: string | Date): Date => {
  if (!date) return new Date();
  if (typeof date !== 'string') return date;
  
  // Handle "MMM dd, yyyy" format (e.g., "Mar 24, 2025")
  const parsed = new Date(date);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  // Fallback to parseISO for ISO format dates
  return parseISO(date);
};

/**
 * Converts a UTC date from the backend to local timezone
 * @param utcDate Date in UTC (from backend)
 * @returns Date object in local timezone
 */
export const utcToLocal = (utcDate: string | Date): Date => {
  if (!utcDate) return new Date();
  const parsedDate = typeof utcDate === 'string' ? parseDate(utcDate) : utcDate;
  // Use the browser's local timezone
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return new TZDate(parsedDate, localTimezone);
};

/**
 * Converts a local date to UTC for sending to backend
 * @param localDate Date in local timezone
 * @returns Date object in UTC
 */
export const localToUtc = (localDate: string | Date): Date => {
  if (!localDate) return new Date();
  const parsedDate = typeof localDate === 'string' ? parseDate(localDate) : localDate;
  // Convert to UTC
  return new TZDate(parsedDate, 'UTC');
};

export const formatDate = {
  /**
   * Format a date with timezone conversion from UTC to local
   * @param date Date in UTC format (from backend)
   * @returns Formatted date string in local timezone
   */
  full: (date: string | Date): string => {
    if (!date) return 'Not set';
    try {
      const localDate = utcToLocal(date);
      if (isNaN(localDate.getTime())) return 'Not set';
      return format(localDate, "MMM d, yyyy 'at' h:mm a");
    } catch {
      return 'Not set';
    }
  },
  /**
   * Format time only with timezone conversion from UTC to local
   * @param date Date in UTC format (from backend)
   * @returns Formatted time string in local timezone
   */
  time: (date: string | Date): string => {
    if (!date) return 'Not set';
    try {
      const localDate = utcToLocal(date);
      if (isNaN(localDate.getTime())) return 'Not set';
      return format(localDate, "h:mm a");
    } catch {
      return 'Not set';
    }
  },
  /**
   * Format date in compact form with timezone conversion from UTC to local
   * @param date Date in UTC format (from backend)
   * @returns Formatted date string in local timezone
   */
  compact: (date: string | Date): string => {
    if (!date) return 'Not set';
    try {
      const localDate = utcToLocal(date);
      if (isNaN(localDate.getTime())) return 'Not set';
      return format(localDate, "MMM d, yyyy");
    } catch {
      return 'Not set';
    }
  },
  /**
   * Format date in verbose form with timezone conversion from UTC to local
   * @param date Date in UTC format (from backend)
   * @returns Formatted date string in local timezone
   */
  v: (date: string | Date): string => {
    if (!date) return 'Not set';
    try {
      const localDate = utcToLocal(date);
      if (isNaN(localDate.getTime())) return 'Not set';
      return format(localDate, "MMMM d, yyyy");
    } catch {
      return 'Not set';
    }
  }
};

export const getCurrentPhase = (dates: RoundDates): Phase => {
  const now = new Date();

  // If no dates are set, default to signups
  if (!dates.signupOpens || !dates.votingOpens || !dates.coveringBegins || !dates.coversDue) {
    return "signups";
  }

  if (isBefore(now, dates.votingOpens)) return "signups";
  if (isBefore(now, dates.coveringBegins)) return "voting";
  if (isBefore(now, dates.coversDue)) return "covering";
  return "celebration";
};

/**
 * Format time remaining with timezone conversion from UTC to local
 * @param targetDate Date in UTC format (from backend)
 * @returns Formatted time remaining string
 */
export const formatTimeRemaining = (targetDate: string | Date): string => {
  try {
    // If the date is in "MMM dd, yyyy" format, append midnight time
    const dateStr = typeof targetDate === 'string' && !targetDate.includes(':') 
      ? `${targetDate} 23:59:59` 
      : targetDate;

    const target = utcToLocal(dateStr);
    const now = new Date();

    if (isBefore(target, now)) {
      return '0d 0h 0m';
    }

    const days = differenceInDays(target, now);
    const remainingHours = differenceInHours(target, now) % 24;
    const remainingMinutes = differenceInMinutes(target, now) % 60;

    return `${days}d ${remainingHours}h ${remainingMinutes}m`;
  } catch (error) {
    console.error('Error formatting time remaining:', error, targetDate);
    return 'Invalid date';
  }
};

export const getPhaseDates = (dates: RoundDates) => ({
  signups: {
    opens: dates.signupOpens,
    closes: subDays(dates.votingOpens, 1),
  },
  voting: {
    opens: dates.votingOpens,
    closes: subDays(dates.coveringBegins, 1),
  },
  covering: {
    opens: dates.coveringBegins,
    closes: subDays(dates.coversDue, 1),
  },
  celebration: {
    opens: dates.coversDue,
    closes: dates.listeningParty,
  },
});
