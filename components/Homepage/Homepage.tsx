import { RoundDetails } from "../../types";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Main } from "./Main";
import Head from "next/head";

interface Props {
  signupSheet: string;
  mailingList: string;
  blurb: string;
  roundContent: RoundDetails[];
}

export const Homepage = ({
  signupSheet,
  mailingList,
  blurb,
  roundContent,
}: Props) => {
  return (
    <>
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <Hero />
      <Main blurb={blurb} roundContent={roundContent} />
      <Footer />
    </>
  );
};
