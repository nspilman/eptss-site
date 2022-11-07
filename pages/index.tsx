import type { GetStaticProps } from "next";
import { Homepage } from "../components/Homepage";
import { RoundDetails } from "../types";

import { createClient } from "@supabase/supabase-js";

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
  const { signupSheet, mailingList, blurb } = await body;

  const supabaseUrl = process.env.DB_SERVER;
  const supabaseKey = process.env.SUPABASE_KEY;

  const supabase = createClient(supabaseUrl || "", supabaseKey || "");

  interface RoundEntity {
    title: string;
    artist: string;
    playlist_url: string;
    id: string;
  }

  const { data, error } = await supabase
    .from("round_metadata")
    .select("*")
    .order("id", { ascending: false });
  if (error) {
    throw new Error(JSON.stringify(error));
  }

  const roundContent = data?.map(
    ({ title, artist, playlist_url, id }: RoundEntity) => ({
      title,
      artist,
      round: id,
      playlist: playlist_url,
    })
  );

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
