import { Phase } from "@/types";

export const getBlurb = ({
  phase,
  roundId,
  phaseEndsDatelabel,
}: {
  phase: Phase;
  phaseEndsDatelabel: string;
  roundId: number;
}) => {
  switch (phase) {
    case "signups":
      return {
        phaseStatus: `Signups for round ${roundId} are open!`,
        phaseBlurb: `Signups close ${phaseEndsDatelabel}`,
      };
    case "voting":
      return {
        phaseStatus: `Round ${roundId} is underway`,
        phaseBlurb: `Votes are due by ${phaseEndsDatelabel}`,
      };
    case "covering":
      return {
        phaseStatus: `Round ${roundId} is underway`,
        phaseBlurb: `Covers are due ${phaseEndsDatelabel}`,
      };
    case "celebration":
    default:
      return {
        phaseStatus: `Round ${roundId} is over!`,
        phaseBlurb: `The listening party is on ${phaseEndsDatelabel}, and the next round will start after that!`,
      };
  }
};
