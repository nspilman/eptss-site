import { RoundDetails } from "types";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import Head from "next/head";
import { Phase } from "services/PhaseMgmtService";
import { Box, Center, Stack } from "@chakra-ui/react";
import { RoundsDisplay } from "./RoundsDisplay";
import { RoundActionCard } from "./RoundActionCard";

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
  return (
    <Stack alignItems="center" justifyContent="center">
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <Hero />
      <Center mt={-16} mb={12}>
        <RoundActionCard phase={phaseInfo.phase} roundId={phaseInfo.roundId} />
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
