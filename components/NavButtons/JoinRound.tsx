import { Button } from "@chakra-ui/react";
import { useRound } from "components/context/RoundContext";
import { useUserSession } from "components/context/UserSessionContext";
import { useRouter } from "next/router";

export const JoinRoundButton = () => {
  const { user } = useUserSession();
  const { phase, roundId } = useRound();
  const router = useRouter();

  return user && phase === "signups" ? (
    <Button onClick={() => router.push("/sign-up")}>
      Sign up for Round {roundId}
    </Button>
  ) : (
    <></>
  );
};
