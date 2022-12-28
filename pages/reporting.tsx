import { GetStaticProps, InferGetStaticPropsType } from "next";
import { Views } from "queries";
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
  const { roundId, phase } = await PhaseMgmtService.build();
  const roundIdToRemove = ["signups", "voting"].includes(phase) ? roundId : -1;
  const { data: allSongsData, error } = await supabase
    .from(Views.VoteResults)
    .select("artist, title, round_id, average, id, round_metadata(song_id)")
    .filter("round_id", "neq", roundIdToRemove);

  return {
    props: {
      allSongsData: allSongsData?.map((song) => ({
        ...song,
        isWinningSong: !!((song.round_metadata as []) || []).length,
      })),
    },
  };
};

export default ReportingPage;
