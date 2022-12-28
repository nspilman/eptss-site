import { format, subDays } from "date-fns";
import { PostgrestError } from "@supabase/supabase-js";
import { getSupabaseClient } from "utils/getSupabaseClient";
import { Tables } from "queries";

interface Props {
  votingOpens: Date;
  coveringBegins: Date;
  coversDue: Date;
  signupOpens: Date;
  listeningParty: Date;
  roundId: number;
}

export type Phase = "signups" | "voting" | "covering" | "celebration";

export class PhaseMgmtService {
  phase: Phase;
  dateLabels: Record<Phase, Record<"opens" | "closes", string>>;
  roundId: number;

  private constructor({
    votingOpens,
    coveringBegins,
    coversDue,
    signupOpens,
    listeningParty,
    roundId,
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

    this.roundId = roundId;

    switch (true) {
      case now < votingOpens:
        this.phase = "signups";
        break;
      case now < coveringBegins:
        this.phase = "voting";
        break;
      case now < coversDue:
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
  }) {
    const {
      votingOpens,
      coveringBegins,
      coversDue,
      signupOpens,
      listeningParty,
      roundId,
    } = currentRound || (await getCurrentRound());
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
    });
  }
}

interface Round {
  roundId: number;
  signupOpens: string;
  votingOpens: string;
  coveringBegins: string;
  coversDue: string;
  listeningParty: string;
  status: number;
}

export const getCurrentRound = async (): Promise<
  Round & { error: PostgrestError | null }
> => {
  const supabase = getSupabaseClient();
  const {
    data: roundData,
    error,
    status,
  } = await supabase
    .from(Tables.RoundMetadata)
    .select(
      "id, signup_opens, voting_opens, covering_begins, covers_due, listening_party"
    )
    .order("id", { ascending: false })
    .limit(1);

  if (roundData) {
    const {
      id: roundId,
      signup_opens: signupOpens,
      voting_opens: votingOpens,
      covering_begins: coveringBegins,
      covers_due: coversDue,
      listening_party: listeningParty,
    } = roundData[0];
    if (typeof roundId === "number") {
      return {
        roundId,
        signupOpens,
        votingOpens,
        coveringBegins,
        coversDue,
        listeningParty,
        status,
        error,
      };
    }
  }

  throw new Error("Could not find round");
};
