import type { GetStaticProps } from "next";
import { Tables } from "queries";
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
    .from(Tables.RoundMetadata)
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
  const phaseMgmtService = await PhaseMgmtService.build();
  const { phase, dateLabels, roundId } = phaseMgmtService;

  const roundContent = (data as RoundEntity[])
    .map(({ song, playlist_url, id }) => {
      const { title, artist } = song || { title: null, artist: null };
      return {
        title,
        artist,
        roundId: id,
        playlist: playlist_url,
      };
    })
    .filter(
      (round) => !(JSON.parse(round.roundId) === roundId && phase === "signups")
    );

  console.log({ roundContent, roundId, phase });

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
