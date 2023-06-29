import { RoundDetails } from "types";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import Head from "next/head";
import { Phase } from "services/PhaseMgmtService";
import { Center, Stack } from "@chakra-ui/react";
import { RoundsDisplay } from "./RoundsDisplay";
import { RoundActionCard } from "./RoundActionCard";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useCallback, useEffect, useState } from "react";
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

  const [loadingUserRoundDetails, setLoadingUserRoundDetails] = useState(false);
  const [userRoundDetails, setUserRoundDetails] = useState<any>(null);

  const { isLoading, session } = useSessionContext();
  const isAuthed = !!session?.user;

  const getUserRoundDetails = useCallback(
    async (userId: string) => {
      if (!userId) return;
      try {
        setLoadingUserRoundDetails(true);
        const data = await getRoundDataForUser(phaseInfo.roundId, userId);
        setUserRoundDetails(data);
      } finally {
        setLoadingUserRoundDetails(false);
      }
    },
    [phaseInfo.roundId]
  );

  useEffect(() => {
    if (!session?.user?.id) return;
    getUserRoundDetails(session?.user?.id);
  }, [getUserRoundDetails, session?.user?.id, phaseInfo.phase]);

  console.log("Homepage", {
    userRoundDetails,
    loadingUserRoundDetails,
    isAuthed,
    phaseInfo,
  });

  return (
    <Stack alignItems="center" justifyContent="center">
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <Hero />
      <Center mt={-20} mb={12}>
        <RoundActionCard
          loading={isLoading || loadingUserRoundDetails}
          phase={phaseInfo.phase}
          roundId={phaseInfo.roundId}
          isAuthed={isAuthed}
          hasSignedUp={userRoundDetails?.hasSignedUp}
          hasSubmitted={userRoundDetails?.hasSubmitted}
          hasVoted={userRoundDetails?.hasVoted}
          onProfile={() => {}}
          onSignup={() => {}}
          onSignupAndJoinRound={() => {}}
          onJoinRound={() => {}}
          onVote={() => {}}
          onSubmit={() => {}}
          onRoundDetails={() => {}}
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
