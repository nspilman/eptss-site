import { format, subDays, startOfDay } from "date-fns";
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
    console.log({ now, votingOpens });
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
      song,
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
  song: { artist: string; title: string };
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
      `id, 
      signup_opens, 
      voting_opens, 
      covering_begins, 
      covers_due, 
      listening_party, 
      song:songs(
        title, 
        artist
        )`
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
      song,
    } = roundData[0];

    if (Array.isArray(song)) {
      throw new Error("Only one song can be associated with a single round");
    }
    const songData = song || { artist: "", title: "" };
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
        song: songData,
      };
    }
  }

  throw new Error("Could not find round");
};
