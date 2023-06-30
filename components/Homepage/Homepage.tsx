import { RoundDetails } from "types";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import Head from "next/head";
import { Phase } from "services/PhaseMgmtService";
import { Box, Stack } from "@chakra-ui/react";
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
  const { phase, roundId, phaseEndsDatelabel } = phaseInfo;
  const isVotingPhase = phase === "voting";

  const [loadingUserRoundDetails, setLoadingUserRoundDetails] = useState(false);
  const [userRoundDetails, setUserRoundDetails] = useState({
    hasSignedUp: false,
    hasSubmitted: false,
    hasVoted: false,
  });

  const { isLoading, session } = useSessionContext();
  const isAuthed = !!session?.user;

  const getUserRoundDetails = useCallback(
    async (userId: string) => {
      if (!userId) return;
      try {
        setLoadingUserRoundDetails(true);
        const data = await getRoundDataForUser(roundId, userId);
        setUserRoundDetails(
          data as {
            hasSubmitted: boolean;
            hasVoted: boolean;
            hasSignedUp: boolean;
          }
        );
      } finally {
        setLoadingUserRoundDetails(false);
      }
    },
    [roundId]
  );

  useEffect(() => {
    if (!session?.user?.id) return;
    getUserRoundDetails(session?.user?.id);
  }, [getUserRoundDetails, session?.user?.id, phase]);

  console.log("Homepage", {
    userRoundDetails,
    loadingUserRoundDetails,
    isAuthed,
    phaseInfo,
  });

  const completedCheckByPhase: { [key in Phase]: boolean } = {
    signups: userRoundDetails.hasSignedUp,
    covering: userRoundDetails.hasSubmitted,
    voting: userRoundDetails.hasVoted,
    celebration: userRoundDetails.hasSubmitted,
  };

  return (
    <Stack alignItems="center" justifyContent="center">
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <Hero />
      <Box mt={-20} mb={12}>
        <RoundActionCard
          loading={isLoading || loadingUserRoundDetails}
          phase={phase}
          roundId={roundId}
          isAuthed={isAuthed}
          hasCompletedPhase={completedCheckByPhase[phase]}
          roundActionFunctions={{
            onProfile: () => {},
            onSignup: () => {},
            onSignupAndJoinRound: () => {},
            onJoinRound: () => {},
            onVote: () => {},
            onSubmit: () => {},
            onRoundDetails: () => {},
          }}
        />
      </Box>

      <HowItWorks phaseInfo={phaseInfo} />
      <RoundsDisplay
        rounds={roundContent}
        currentRound={phaseInfo.roundId}
        isVotingPhase={isVotingPhase}
      />
    </Stack>
  );
};
