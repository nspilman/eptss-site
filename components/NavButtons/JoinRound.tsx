import { Phase } from "@/services/PhaseMgmtService";
import { User } from "@supabase/supabase-js";

interface Props {
  user: User;
  phase: Phase;
  roundId: number;
}

export const JoinRoundButton = async ({ user, phase, roundId }: Props) => {
  return user && phase === "signups" ? (
    <button>
      <a href={"/sign-up"}> Sign up for Round {roundId}</a>
    </button>
  ) : (
    <></>
  );
};
