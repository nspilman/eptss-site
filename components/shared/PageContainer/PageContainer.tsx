import Head from "next/head";
import React from "react";

export const PageContainer = ({
  children,
  title,
}: {
  children: React.ReactElement;
  title: string;
}) => {
  return (
    <div className="p-0 w-100">
      <Head>
        <title>{`${title} | Everyone Plays the Same Song`}</title>
      </Head>
      <div className="flex flex-wrap py-24 px-8 justify-center min-h-[100vh]">
        {children}
      </div>
    </div>
  );
};
