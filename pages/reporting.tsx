import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";

import { Reporting } from "../components/Reporting";
import { getSupabaseClient } from "../utils/getSupabaseClient";

const ReportingPage = ({}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <Reporting />;
};

export const getStaticProps: GetStaticProps = async () => {
  const supabase = getSupabaseClient();

  return {
    props: {
      //   roundId,
    },
    notFound: process.env.NODE_ENV === "production",
  };
};

export default ReportingPage;
