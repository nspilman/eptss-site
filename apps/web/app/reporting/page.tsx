import React from "react";
import { roundProvider, COVER_PROJECT_ID } from "@eptss/core";
import { reportingProvider } from "@eptss/core/providers/reportingProvider";
import { Reporting } from "./Reporting";

const ReportingPage = async () => {
  const { roundId, phase } = await roundProvider({ projectId: COVER_PROJECT_ID });
  const roundIdToRemove = ["signups", "voting"].includes(phase) ? roundId : -1;
  const { allSongsData } = await reportingProvider({ roundIdToRemove });

  return <Reporting allSongsData={allSongsData} />;
};

export default ReportingPage;
