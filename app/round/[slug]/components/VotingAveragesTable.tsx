import React from "react";
import { DataTable } from "@/components/DataTable";
import { VoteResults } from "../types";

import type { Header } from "@/components/DataTable/DataTable";

interface VotingAveragesTableProps {
  voteResults: VoteResults[];
  outstandingVoters: string[];
  voteResultsHeaders: Readonly<Header<keyof VoteResults>[]>;
}

export const VotingAveragesTable = ({ voteResults, outstandingVoters, voteResultsHeaders }: VotingAveragesTableProps) => (
  <div className="w-full max-w-2xl mb-8">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
        <span>Current Voting Averages</span>
      </h3>
      <span className="text-sm text-secondary">
        Votes In: {(() => {
          const pending = outstandingVoters?.length ?? 0;
          const totalEligible = voteResults && outstandingVoters ? voteResults.length : 0;
          const votesIn = totalEligible - pending;
          return `${votesIn} | ${pending} pending`;
        })()}
      </span>
    </div>
    <div className="rounded-lg border border-background-tertiary/50 bg-background-secondary/50">
      <DataTable
        headers={voteResultsHeaders}
        rows={voteResults}
      />
    </div>
  </div>
);
