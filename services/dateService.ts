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
  return typeof date === 'string' ? parseISO(date) : date;
};

export const formatDate = (date: string | Date): string => {
  const parsedDate = parseDate(date);
  return format(parsedDate, "iiii, MMM do");
};

export const getCurrentPhase = (dates: RoundDates): Phase => {
  const now = new Date();
  if (now < dates.signupOpens) {
    throw new Error("Current date cannot be before signup date");
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
