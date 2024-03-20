"use server";
import { format, subDays } from "date-fns";
import queries, { getCurrentRound } from "queries";

interface Props {
  votingOpens: Date;
  coveringBegins: Date;
  coversDue: Date;
  signupOpens: Date;
  listeningParty: Date;
  roundId: number;
  song: { artist: string; title: string };
  typeOverride?: "runner_up";
}

export type Phase = "signups" | "voting" | "covering" | "celebration";

const PhaseMgmtService = async ({
  votingOpens,
  coveringBegins,
  coversDue,
  signupOpens,
  listeningParty,
  roundId,
  song,
  typeOverride,
}: Props) => {
  let phase: Phase;

  const now = new Date();
  if (now < signupOpens) {
    throw new Error(
      "current date cannot be before signup date. Signup starts the current round"
    );
  }
  if (now > listeningParty) {
    throw new Error(
      "current date cannot be after listening party. The Listening Party ends the round"
    );
  }
  if (!(votingOpens < coveringBegins && coveringBegins < coversDue)) {
    throw new Error("dates are in incorrect order");
  }

  const isBefore = (date: Date) => now < date;

  switch (true) {
    case isBefore(votingOpens):
      phase = "signups";
      break;
    case isBefore(coveringBegins):
      phase = "voting";
      break;
    case isBefore(coversDue):
      phase = "covering";
      break;
    default:
      phase = "celebration";
      break;
  }

  const dates = {
    signups: {
      opens: signupOpens,
      closes: subDays(votingOpens, 1),
    },
    voting: {
      opens: votingOpens,
      closes: subDays(coveringBegins, 1),
    },
    covering: {
      opens: coveringBegins,
      closes: subDays(coversDue, 1),
    },
    celebration: {
      opens: coversDue,
      closes: listeningParty,
    },
  };
  // use this.dates ^ as our source of truth
  // and keeping this.dateLabels to to make sure its backwards compatible
  // but ideally, components should use this.date values, and then format as needed
  const formatLabel = (date: Date) => format(date, "iiii, MMM do");
  const dateLabels = {
    signups: {
      opens: formatLabel(dates.signups.opens),
      closes: formatLabel(dates.signups.closes),
    },
    voting: {
      opens: formatLabel(dates.voting.opens),
      closes: formatLabel(dates.voting.closes),
    },
    covering: {
      opens: formatLabel(dates.covering.opens),
      closes: formatLabel(dates.covering.closes),
    },
    celebration: {
      opens: formatLabel(dates.celebration.opens),
      closes: formatLabel(dates.celebration.closes),
    },
  };

  return {
    phase,
    roundId,
    song,
    typeOverride,
    dateLabels,
    dates,
  };
};

export const getNewPhaseManager = async (currentRound?: {
  votingOpens: string;
  coveringBegins: string;
  coversDue: string;
  signupOpens: string;
  listeningParty: string;
  roundId: number;
  typeOverride?: string;
  song: {
    artist: string;
    title: string;
  };
}) => {
  const {
    votingOpens,
    coveringBegins,
    coversDue,
    signupOpens,
    listeningParty,
    roundId,
    song,
    typeOverride,
  } = currentRound || (await getCurrentRound());
  const datify = (dateString: string) => {
    const date = new Date(dateString);
    const isValidDate = date instanceof Date && !isNaN(date.getDate());
    if (!isValidDate)
      throw new Error(`${dateString} is an invalid date string`);
    return date;
  };

  return PhaseMgmtService({
    votingOpens: datify(votingOpens),
    coveringBegins: datify(coveringBegins),
    coversDue: datify(coversDue),
    signupOpens: datify(signupOpens),
    listeningParty: datify(listeningParty),
    roundId,
    song,
    typeOverride: typeOverride as "runner_up" | undefined,
  });
};
