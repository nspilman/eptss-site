import { GetStaticProps, InferGetStaticPropsType } from "next";
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

  console.log({ error });

  return {
    props: {
      allSongsData,
    },
    notFound: process.env.NODE_ENV === "production",
  };
};

export default ReportingPage;
