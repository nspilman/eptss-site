import { RoundDetails } from "types";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Main } from "./Main";
import Head from "next/head";

interface Props {
  roundContent: RoundDetails[];
}

export const Homepage = ({ roundContent }: Props) => {
  return (
    <>
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <Hero />
      <Main roundContent={roundContent} />
      <Footer />
    </>
  );
};
