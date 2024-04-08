import React from "react";
import { roundProvider, reportingProvider } from "@/providers";
import { Reporting } from "./Reporting";

const ReportingPage = async () => {
  const { roundId, phase } = await roundProvider();
  const roundIdToRemove = ["signups", "voting"].includes(phase) ? roundId : -1;
  const { allSongsData } = await reportingProvider({ roundIdToRemove });

  return <Reporting allSongsData={allSongsData} />;
};

export default ReportingPage;
