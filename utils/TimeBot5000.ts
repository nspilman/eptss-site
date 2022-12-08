import { getCurrentRound } from "queries";
import { getSupabaseClient } from "./getSupabaseClient";

interface Props {
  votingOpens: Date;
  coveringBegins: Date;
  coversDue: Date;
  listeningParty: Date;
}

type Phase = "signups" | "voting" | "covering" | "celebration";

export class TimeBot5000 {
  phase: Phase;
  constructor({ votingOpens, coveringBegins, coversDue }: Props) {
    const now = new Date();
    if (!(votingOpens < coveringBegins && coveringBegins < coversDue)) {
      throw new Error("dates are in incorrect order");
    }
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
  }

  public getCurrentPhase() {
    return this.phase;
  }

  public static async build() {
    const supabase = getSupabaseClient();
    const { votingOpens, coveringBegins, listeningParty, coversDue } =
      await getCurrentRound(supabase);
    const datify = (dateString: string) => new Date(dateString);
    return new TimeBot5000({
      votingOpens: datify(votingOpens),
      coveringBegins: datify(coveringBegins),
      coversDue: datify(coversDue),
      listeningParty: datify(listeningParty),
    });
  }
}
