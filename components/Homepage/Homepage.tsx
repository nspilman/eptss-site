import { RoundDetails } from "types";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Main } from "./Main";
import Head from "next/head";
import { Phase } from "services/PhaseMgmtService";
import { Flex } from "@chakra-ui/react";

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
    <Flex direction={"column"} alignItems="center" justifyContent="center">
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <Hero />
      <Main roundContent={roundContent} phaseInfo={phaseInfo} />
      <Footer />
    </Flex>
  );
};
