import { Phase } from "@/services/roundManager";

export const useBlurb = ({
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
      return `Round ${roundId} is underway - voting is due ${phaseEndsDatelabel}`;
    case "covering":
      return `Round ${roundId} is underway - covers are due ${phaseEndsDatelabel}`;
    case "celebration":
    default:
      return `Round ${roundId} is over! The listening party is on ${phaseEndsDatelabel}, and the next round will start after that!`;
  }
};
