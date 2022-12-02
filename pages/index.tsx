import type { GetStaticProps } from "next";
import { Homepage } from "../components/Homepage";
import { RoundDetails } from "../types";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "../utils/getSupabaseClient";

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
  interface RoundEntity {
    title: string;
    artist: string;
    playlist_url: string;
    id: string;
  }

  const supabase = getSupabaseClient();

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
    },
  };
};

export default Home;
