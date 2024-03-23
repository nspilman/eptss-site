import Head from "next/head";
import React from "react";

export const PageTitle = ({ title }: { title: string }) => {
  return (
    <Head>
      <title>{`${title} | Everyone Plays the Same Song`}</title>
    </Head>
  );
};
