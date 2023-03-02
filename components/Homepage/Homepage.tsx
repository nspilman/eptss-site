import { RoundDetails } from "types";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import Head from "next/head";
import { Phase } from "services/PhaseMgmtService";
import { Flex, Stack } from "@chakra-ui/react";
import { PastRounds } from "./PastRounds";

export interface Props {
  roundContent: RoundDetails[];
  phaseInfo: {
    phase: Phase;
    phaseEndsDatelabel: string;
    roundId: number;
  };
}

export const Homepage = ({ roundContent, phaseInfo }: Props) => {
  return (
    <Stack alignItems="center" justifyContent="center">
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <Hero />
      <HowItWorks phaseInfo={phaseInfo} />
      <PastRounds pastRounds={roundContent} />
      <Footer />
    </Stack>
  );
};
