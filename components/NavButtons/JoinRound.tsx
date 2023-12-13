import { useRound } from "components/context/RoundContext";
import { useUserSession } from "components/context/UserSessionContext";
import { useRouter } from "next/router";

export const JoinRoundButton = () => {
  const { user } = useUserSession();
  const { phase, roundId } = useRound();
  const router = useRouter();

  return user && phase === "signups" ? (
    <button>
      <a href={"/sign-up"}> Sign up for Round {roundId}</a>
    </button>
  ) : (
    <></>
  );
};
