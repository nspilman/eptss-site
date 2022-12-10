import type { GetStaticProps } from "next";
import { PhaseMgmtService } from "services/PhaseMgmtService";
import { Homepage, Props } from "../components/Homepage";

import { getSupabaseClient } from "../utils/getSupabaseClient";

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

  const phaseMgmtService = await PhaseMgmtService.build();
  const { phase, dateLabels, roundId } = phaseMgmtService;
  const phaseEndsDatelabel = dateLabels[phase].closes;

  return {
    props: {
      roundContent,
      phaseInfo: {
        phase,
        phaseEndsDatelabel,
        roundId,
      },
    },
  };
};

export default Home;
