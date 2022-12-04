import type { GetStaticProps } from "next";
import { Homepage } from "../components/Homepage";
import { RoundDetails } from "../types";

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
    song: {
      title: string;
      artist: string;
    } | null;
    playlist_url: string;
    id: string;
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("round_metadata")
    .select(
      `playlist_url, 
      id, 
      song_id,
      song:songs (
      title, 
      artist
    )`
    )
    .order("id", { ascending: false });
  if (error) {
    throw new Error(JSON.stringify(error));
  }

  const roundContent = (data as RoundEntity[])
    ?.filter(({ song }) => !!song)
    .map(({ song, playlist_url, id }) => {
      const { title, artist } = song || {};
      return {
        title,
        artist,
        round: id,
        playlist: playlist_url,
      };
    });

  return {
    props: {
      roundContent,
    },
  };
};

export default Home;
