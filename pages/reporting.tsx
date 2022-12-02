import { GetStaticProps, InferGetStaticPropsType } from "next";
import { getCurrentRound } from "queries";
import React from "react";

import { Reporting } from "../components/Reporting";
import { getSupabaseClient } from "../utils/getSupabaseClient";

const ReportingPage = ({
  allSongsData,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <Reporting allSongsData={allSongsData} />;
};

export const getStaticProps: GetStaticProps = async () => {
  const supabase = getSupabaseClient();
  const { data: allSongsData, error } = await supabase.rpc(
    "get_all_songs_data"
  );

  const roundId = await getCurrentRound(supabase);

  return {
    props: {
      allSongsData: allSongsData?.filter((song) => song.round_id !== roundId),
    },
  };
};

export default ReportingPage;
