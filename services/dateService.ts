import { format, subDays, isBefore, parseISO } from "date-fns";
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
  return typeof date === 'string' ? parseISO(date) : date;
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
