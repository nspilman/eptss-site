import { RoundDetails } from "../../types";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Main } from "./Main";

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
      <Header />
      <Hero />
      <Main blurb={blurb} roundContent={roundContent} />
      <Footer />
    </>
  );
};
