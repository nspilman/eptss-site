import { RoundDetails } from "types";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import Head from "next/head";
import { Phase } from "services/PhaseMgmtService";
import { Center, Stack } from "@chakra-ui/react";
import { RoundsDisplay } from "./RoundsDisplay";
import { RoundActionCard } from "./RoundActionCard";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useCallback, useEffect } from "react";
import { getRoundDataForUser } from "queries/getRoundDataForUser";

export interface Props {
  roundContent: RoundDetails[];
  phaseInfo: {
    phase: Phase;
    phaseEndsDatelabel: string;
    roundId: number;
  };
}

export const Homepage = ({ roundContent, phaseInfo }: Props) => {
  const isVotingPhase = phaseInfo.phase === "voting";

  const { session } = useSessionContext();
  const isAuthed = !!session?.user;

  console.log("session user", session);

  const getUserRoundDetails = useCallback(
    async (userId: string) => {
      if (!userId) return;
      try {
        const data = await getRoundDataForUser(phaseInfo.roundId, userId);
        console.log({ data });
      } catch (error) {}
      // const { data, error } = await supabase.functions.invoke(
    },
    [phaseInfo.roundId]
  );

  useEffect(() => {
    if (!session?.user?.id) return;
    getUserRoundDetails(session?.user?.id);
  }, [getUserRoundDetails, session?.user?.id]);

  return (
    <Stack alignItems="center" justifyContent="center">
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <Hero />
      <Center mt={-16} mb={12}>
        <RoundActionCard
          phase={phaseInfo.phase}
          roundId={phaseInfo.roundId}
          isAuthed={isAuthed}
          hasSignedUp={false}
          hasSubmitted={false}
          hasVoted={false}
        />
      </Center>

      <HowItWorks phaseInfo={phaseInfo} />
      <RoundsDisplay
        rounds={roundContent}
        currentRound={phaseInfo.roundId}
        isVotingPhase={isVotingPhase}
      />
    </Stack>
  );
};
