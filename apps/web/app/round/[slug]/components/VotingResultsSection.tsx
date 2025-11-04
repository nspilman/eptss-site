import React from "react";
import { DataTable } from "@eptss/ui";
import { StackedBarChart } from "../StackedBarChart";

interface ClientStackedBarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
  title: string;
}

const ClientStackedBarChart = ({ data, title }: ClientStackedBarChartProps) => {
  "use client";
  return <StackedBarChart data={data} title={title} />;
};

import type { Header } from "@eptss/ui";
import type { VoteResults } from "../types";

interface VotingResultsSectionProps {
  voteResults: VoteResults[];
  voteResultsHeaders: Readonly<Header<keyof VoteResults>[]>;
  chartData: any; // Replace 'any' with the actual chart data type if available
}

export const VotingResultsSection = ({ voteResults, voteResultsHeaders, chartData }: VotingResultsSectionProps) => (
  <>
    <DataTable
      title={"Voting Breakdown"}
      headers={voteResultsHeaders}
      rows={voteResults}
    />
    <div
      className={`w-[400px] sm:w-[600px] md:w-[800px] lg:w-[1000px] overflow-scroll`}
    >
      <ClientStackedBarChart
        data={chartData}
        title="Vote Breakdown Bar Chart"
      />
    </div>
  </>
);
