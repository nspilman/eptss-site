import { Phase } from "@/types";

interface Props {
  isLoggedIn: boolean;
  phase: Phase;
  hasVoted?: boolean;
  hasSignedUp?: boolean;
  roundId: number;
}
export const getHeroActionTitle = ({
  phase,
  hasVoted,
  hasSignedUp,
  isLoggedIn,
  roundId,
}: Props) => {};
