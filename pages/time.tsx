import { STATIC_REGEN_INTERVAL_SECONDS } from "consts";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import { Phase, PhaseMgmtService } from "services/PhaseMgmtService";

const TimePage = ({
  coverOpen,
  now,
}: InferGetStaticPropsType<
  Record<Phase, Record<"opens" | "closes", Date>>
>) => {
  return (
    <div className="flex col h-screen w-screen content-center items-center justify-center text-white">
      <div>
        <b>cover opens:</b>
        {coverOpen}
      </div>
      <div>
        <b>built at:</b>
        {now}
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const phaseMgmtService = await PhaseMgmtService.build();
  const { dates } = await phaseMgmtService;
  const coverOpen = await dates.covering.opens.toTimeString();
  const now = new Date().toTimeString();

  return {
    props: {
      coverOpen,
      now,
    },
    revalidate: STATIC_REGEN_INTERVAL_SECONDS,
  };
};

export default TimePage;
