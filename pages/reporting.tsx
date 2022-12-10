import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import { PhaseMgmtService } from "services/PhaseMgmtService";

import { Reporting } from "../components/Reporting";
import { getSupabaseClient } from "../utils/getSupabaseClient";

const ReportingPage = ({
  allSongsData,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <Reporting allSongsData={allSongsData} />;
};

export const getStaticProps: GetStaticProps = async () => {
  const supabase = getSupabaseClient();
  const { data: allSongsData, error } = await supabase.rpc("get_all_songs");
  const { data: winningSongs, error: winningSongsError } = await supabase
    .from("round_metadata")
    .select("song_id, id");
  
  const { roundId } = await PhaseMgmtService.build();

  return {
    props: {
      allSongsData: allSongsData
        ?.filter((song) => song.round_id !== roundId)
        .map((song) => ({
          ...song,
          isWinningSong: winningSongs?.some(
            (winningSong) =>
              winningSong.id === song.round_id &&
              winningSong.song_id === song.id
          ),
        })),
    },
  };
};

export default ReportingPage;
