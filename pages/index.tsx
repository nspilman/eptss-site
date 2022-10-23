import type { GetStaticProps, NextPage, InferGetStaticPropsType } from "next";
import { Homepage } from "../components/Homepage";
import { RoundDetails } from "../types";

interface Props {
  signupSheet: string;
  mailingList: string;
  blurb: string;
  roundContent: RoundDetails[];
}

const Home = (props: Props) => {
  return <Homepage {...props} />;
};

export const getStaticProps: GetStaticProps = async () => {
  const response = await fetch(
    "https://pioneer-django.herokuapp.com/eptss/state"
  );

  const body = await response.json();
  const { Round, signupSheet, mailingList, blurb } = await body;
  const currentRound = JSON.parse(await Round);

  const roundContent = [];
  for (let i = currentRound; i > 0; i--) {
    try {
      const roundReponse = await fetch(
        `https://pioneer-django.herokuapp.com/eptss/${i}`
      );
      const body = await roundReponse.json();
      roundContent.push(body[0]);
    } catch (e) {
      console.log({ e });
    }
  }

  return {
    props: {
      roundContent,
      signupSheet,
      mailingList,
      blurb,
    },
  };
};

export default Home;
