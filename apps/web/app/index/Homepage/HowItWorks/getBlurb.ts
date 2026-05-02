import { Phase } from "@/types";
import { getDisplayRoundNumber } from "@/lib/roundDisplay";

export const getBlurb = ({
  phase,
  roundId,
  phaseEndsDatelabel,
}: {
  phase: Phase;
  phaseEndsDatelabel: string;
  roundId: number;
}) => {
  const displayRoundNumber = getDisplayRoundNumber(roundId);
  switch (phase) {
    case "signups":
      return `Signups for round ${displayRoundNumber} are open! Signups close ${phaseEndsDatelabel}`;
    case "voting":
      return `Round ${displayRoundNumber} - voting is due ${phaseEndsDatelabel}`;
    case "covering":
      return `Round ${displayRoundNumber} - covers are due ${phaseEndsDatelabel}`;
    case "celebration":
    default:
      return `The listening party is on ${phaseEndsDatelabel}, where the winning cover for the next round will be announced!`
  }
};
