import { getCurrentRound } from "queries";

interface Props {
  votingOpens: Date;
  coveringBegins: Date;
  coversDue: Date;
  signupOpens: Date;
  listeningParty: Date;
}

type Phase = "signups" | "voting" | "covering" | "celebration";

export class TimeBot5000 {
  phase: Phase;

  private constructor({
    votingOpens,
    coveringBegins,
    coversDue,
    signupOpens,
    listeningParty,
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

  public static async build(currentRound?: {
    votingOpens: string;
    coveringBegins: string;
    coversDue: string;
    signupOpens: string;
    listeningParty: string;
  }) {
    const {
      votingOpens,
      coveringBegins,
      coversDue,
      signupOpens,
      listeningParty,
    } = currentRound || (await getCurrentRound());
    const datify = (dateString: string) => new Date(dateString);
    return new TimeBot5000({
      votingOpens: datify(votingOpens),
      coveringBegins: datify(coveringBegins),
      coversDue: datify(coversDue),
      signupOpens: datify(signupOpens),
      listeningParty: datify(listeningParty),
    });
  }
}
