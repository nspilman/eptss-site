import { RoundDetails } from "types";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import Head from "next/head";
import { Phase } from "services/PhaseMgmtService";
import { Stack } from "@chakra-ui/react";
import { RoundsDisplay } from "./RoundsDisplay";

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
      <HowItWorks phaseInfo={phaseInfo} />
      <RoundsDisplay
        rounds={roundContent}
        currentRound={phaseInfo.roundId}
        isVotingPhase={isVotingPhase}
      />
      <Footer />
    </Stack>
  );
};
