import { format, subDays, isBefore, parseISO, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { Phase } from "@/types/round";

export interface RoundDates {
  signupOpens: Date;
  votingOpens: Date;
  coveringBegins: Date;
  coversDue: Date;
  listeningParty: Date;
}

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

export const formatDate = {
  full: (date: string | Date): string => {
    if (!date) return 'Not set';
    try {
      const parsedDate = parseDate(date);
      if (isNaN(parsedDate.getTime())) return 'Not set';
      return format(parsedDate, "MMM d, yyyy 'at' h:mm a");
    } catch {
      return 'Not set';
    }
  },
  time: (date: string | Date): string => {
    if (!date) return 'Not set';
    try {
      const parsedDate = parseDate(date);
      if (isNaN(parsedDate.getTime())) return 'Not set';
      return format(parsedDate, "h:mm a");
    } catch {
      return 'Not set';
    }
  },
  compact: (date: string | Date): string => {
    if (!date) return 'Not set';
    try {
      const parsedDate = parseDate(date);
      if (isNaN(parsedDate.getTime())) return 'Not set';
      return format(parsedDate, "MMM d, yyyy");
    } catch {
      return 'Not set';
    }
  },
  v: (date: string | Date): string => {
    if (!date) return 'Not set';
    try {
      const parsedDate = parseDate(date);
      if (isNaN(parsedDate.getTime())) return 'Not set';
      return format(parsedDate, "MMMM d, yyyy");
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

export const formatTimeRemaining = (targetDate: string | Date): string => {
  try {
    // If the date is in "MMM dd, yyyy" format, append midnight time
    const dateStr = typeof targetDate === 'string' && !targetDate.includes(':') 
      ? `${targetDate} 23:59:59` 
      : targetDate;

    const target = parseDate(dateStr);
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
