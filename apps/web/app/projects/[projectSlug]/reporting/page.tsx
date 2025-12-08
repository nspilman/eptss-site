import React from "react";
import { roundProvider, getProjectIdFromSlug, type ProjectSlug } from "@eptss/data-access";
import { reportingProvider } from "@eptss/data-access/providers/reportingProvider";
import { Reporting } from "./Reporting";

interface Props {
  params: Promise<{ projectSlug: string }>;
}

const ReportingPage = async ({ params }: Props) => {
  const resolvedParams = await params;
  const { projectSlug } = resolvedParams;
  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);

  const { roundId, phase } = await roundProvider({ projectId });
  const roundIdToRemove = ["signups", "voting"].includes(phase) ? roundId : -1;
  const { allSongsData } = await reportingProvider({ roundIdToRemove });

  return <Reporting allSongsData={allSongsData} />;
};

export default ReportingPage;
