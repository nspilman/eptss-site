import type { GetStaticProps } from "next";
import queries, { Tables } from "queries";
import { PhaseMgmtService } from "services/PhaseMgmtService";
import { Homepage, Props } from "../components/Homepage";

import { getSupabaseClient } from "../utils/getSupabaseClient";
import { format } from "date-fns";
import { STATIC_REGEN_INTERVAL_SECONDS } from "consts";

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
    .filter("id", "lte", await queries.round.getCurrentRoundId(supabase))
    .order("id", { ascending: false });
  if (error) {
    throw new Error(JSON.stringify(error));
  }
  const phaseMgmtService = await PhaseMgmtService.build();
  const { phase, dateLabels, roundId } = phaseMgmtService;

  const roundContent = (data as unknown as RoundEntity[])
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

  const phaseEndsDate = format(
    phaseMgmtService.dates[phase].closes,
    "yyyy-MM-dd"
  );
  const phaseEndsDatelabel = dateLabels[phase].closes;

  return {
    props: {
      roundContent,
      phaseInfo: {
        phase,
        phaseEndsDate,
        phaseEndsDatelabel,
        roundId,
      },
    },
    revalidate: STATIC_REGEN_INTERVAL_SECONDS,
  };
};

export default Home;
