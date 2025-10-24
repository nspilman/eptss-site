"use server";
import { getMonitoringData } from "@/data-access";

export const monitoringProvider = async () => {
  const { runs, latestRuns, successRate, totalRuns } = await getMonitoringData();

  // Sort runs by date and convert dates to ISO strings for serialization
  const sortedRuns = [...runs]
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
    .map(run => ({
      ...run,
      startedAt: new Date(run.startedAt).toISOString()
    }));

  return {
    runs: sortedRuns,
    latestRuns,
    successRate,
    totalRuns
  };
};
