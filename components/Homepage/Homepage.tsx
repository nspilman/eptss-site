import { RoundDetails } from "types";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Main } from "./Main";
import Head from "next/head";
import { Phase } from "services/PhaseMgmtService";

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
    <>
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <Hero />
      <Main roundContent={roundContent} phaseInfo={phaseInfo} />
      <Footer />
    </>
  );
};
