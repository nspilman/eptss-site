import { RoundDetails } from "types";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import Head from "next/head";
import { Phase } from "services/PhaseMgmtService";
import { Box, Stack } from "@chakra-ui/react";
import { RoundsDisplay } from "./RoundsDisplay";
import { RoundActionCard } from "./RoundActionCard";
import { useCallback, useEffect, useState } from "react";
import { getRoundDataForUser } from "queries/getRoundDataForUser";
import { useRouter } from "next/router";
import { useAuthModal } from "components/context/EmailAuthModal";
import { useUserSession } from "components/context/UserSessionContext";

export interface Props {
  roundContent: RoundDetails[];
  phaseInfo: {
    phase: Phase;
    phaseEndsDate: string;
    phaseEndsDatelabel: string;
    roundId: number;
  };
}

export const Homepage = ({ roundContent, phaseInfo }: Props) => {
  const { phase, roundId, phaseEndsDate, phaseEndsDatelabel } = phaseInfo;
  const isVotingPhase = phase === "voting";

  const router = useRouter();

  const [loadingUserRoundDetails, setLoadingUserRoundDetails] = useState(false);
  const [userRoundDetails, setUserRoundDetails] = useState({
    hasSignedUp: false,
    hasSubmitted: false,
    hasVoted: false,
  });

  const { user, isLoading } = useUserSession();
  const isAuthed = !!user;

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
    if (!user?.id) return;
    getUserRoundDetails(user?.id);
  }, [getUserRoundDetails, user?.id, phase]);

  const completedCheckByPhase: { [key in Phase]: boolean } = {
    signups: userRoundDetails?.hasSignedUp,
    covering: userRoundDetails?.hasSubmitted,
    voting: userRoundDetails?.hasVoted,
    celebration: userRoundDetails?.hasSubmitted,
  };

  const { setIsOpen: openAuthModal } = useAuthModal();

  const roundActionFunctions = {
    onProfile: () => router.push("/profile"),
    onSignup: () => openAuthModal(),
    onSignupAndJoinRound: () => router.push("/sign-up"),
    onJoinRound: () => router.push("/sign-up"),
    onVote: () => router.push("/voting"),
    onSubmit: () => router.push("/voting"),
    onRoundDetails: () => router.push(`/round/${roundId}`),
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
          roundActionFunctions={roundActionFunctions}
          phaseEndsDate={phaseEndsDate}
          phaseEndsDatelabel={phaseEndsDatelabel}
        />
      </Box>

      <HowItWorks />
      <RoundsDisplay
        rounds={roundContent}
        currentRound={phaseInfo.roundId}
        isVotingPhase={isVotingPhase}
      />
    </Stack>
  );
};
