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
      return `Signups for round ${roundId} are open! Signups close ${phaseEndsDatelabel}`;
    case "voting":
      return `Round ${roundId} - voting is due ${phaseEndsDatelabel}`;
    case "covering":
      return `Round ${roundId} - covers are due ${phaseEndsDatelabel}`;
    case "celebration":
    default:
      return `The listening party is on ${phaseEndsDatelabel}, where the winning cover for the next round will be announced!`
  }
};
