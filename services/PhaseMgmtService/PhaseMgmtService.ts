import { format, subDays } from "date-fns";
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
  dates: Record<Phase, Record<"opens" | "closes", Date>>;
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

    this.roundId = roundId;
    this.song = song;
    switch (true) {
      case isBefore(votingOpens):
        this.phase = "signups";
        break;
      case isBefore(coveringBegins):
        this.phase = "voting";
        break;
      case isBefore(coversDue):
        this.phase = "covering";
        break;
      default:
        this.phase = "celebration";
        break;
    }

    this.dates = {
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
    this.dateLabels = {
      signups: {
        opens: formatLabel(this.dates.signups.opens),
        closes: formatLabel(this.dates.signups.closes),
      },
      voting: {
        opens: formatLabel(this.dates.voting.opens),
        closes: formatLabel(this.dates.voting.closes),
      },
      covering: {
        opens: formatLabel(this.dates.covering.opens),
        closes: formatLabel(this.dates.covering.closes),
      },
      celebration: {
        opens: formatLabel(this.dates.celebration.opens),
        closes: formatLabel(this.dates.celebration.closes),
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
    } = currentRound || (await queries.round.getCurrentRound());
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
