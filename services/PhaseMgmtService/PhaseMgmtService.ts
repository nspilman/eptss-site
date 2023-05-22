import { format, subDays, startOfDay } from "date-fns";
import queries from "queries";

interface Props {
  votingOpens: Date;
  coveringBegins: Date;
  coversDue: Date;
  signupOpens: Date;
  listeningParty: Date;
  roundId: number;
  song: { artist: string; title: string };
}

export type Phase = "signups" | "voting" | "covering" | "celebration";

export class PhaseMgmtService {
  phase: Phase;
  dateLabels: Record<Phase, Record<"opens" | "closes", string>>;
  roundId: number;
  song: { artist: string; title: string };

  private constructor({
    votingOpens,
    coveringBegins,
    coversDue,
    signupOpens,
    listeningParty,
    roundId,
    song,
  }: Props) {
    const now = startOfDay(new Date());
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

    const isBeforeStartOfDay = (date: Date) => now < startOfDay(date);

    this.roundId = roundId;
    this.song = song;
    switch (true) {
      case isBeforeStartOfDay(votingOpens):
        this.phase = "signups";
        break;
      case isBeforeStartOfDay(coveringBegins):
        this.phase = "voting";
        break;
      case isBeforeStartOfDay(coversDue):
        this.phase = "covering";
        break;
      default:
        this.phase = "celebration";
        break;
    }

    const formatLabel = (date: Date) => format(date, "iiii, MMM do");
    this.dateLabels = {
      signups: {
        opens: formatLabel(signupOpens),
        closes: formatLabel(subDays(votingOpens, 1)),
      },
      voting: {
        opens: formatLabel(votingOpens),
        closes: formatLabel(subDays(coveringBegins, 1)),
      },
      covering: {
        opens: formatLabel(coveringBegins),
        closes: formatLabel(subDays(coversDue, 1)),
      },
      celebration: {
        opens: formatLabel(coversDue),
        closes: formatLabel(listeningParty),
      },
    };
  }

  public getCurrentPhase() {
    return this.phase;
  }

  public static async build(currentRound?: {
    votingOpens: string;
    coveringBegins: string;
    coversDue: string;
    signupOpens: string;
    listeningParty: string;
    roundId: number;
    song: {
      artist: string;
      title: string;
    };
  }) {
    const {
      votingOpens,
      coveringBegins,
      coversDue,
      signupOpens,
      listeningParty,
      roundId,
      song,
    } = currentRound || (await queries.getCurrentRound());
    const datify = (dateString: string) => {
      const date = new Date(dateString);
      const isValidDate = date instanceof Date && !isNaN(date.getDate());
      if (!isValidDate)
        throw new Error(`${dateString} is an invalid date string`);
      return date;
    };
    return new PhaseMgmtService({
      votingOpens: datify(votingOpens),
      coveringBegins: datify(coveringBegins),
      coversDue: datify(coversDue),
      signupOpens: datify(signupOpens),
      listeningParty: datify(listeningParty),
      roundId,
      song,
    });
  }
}
