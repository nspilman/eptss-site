"use client"

import { motion } from "framer-motion";
import { DataTable, Header } from "@/components/DataTable";
import { RoundDetail } from "@/providers";

// Round Stats Component
type RoundStatsProps = {
    detailData: RoundDetail[];
    isLoading: boolean;
    sortKey: string | null;
    sortDirection: "asc" | "desc" | null;
    onSort: (key: string, direction: "asc" | "desc" | null) => void;
  };
  
export const RoundStatsComponent = ({ detailData, isLoading, sortKey, sortDirection, onSort }: RoundStatsProps) => {
  const headers = [
    { key: "roundId", label: "Round Number", sortable: true, type: 'number' } as Header<string>,
    { key: "signupCount", label: "Total Signups", sortable: true, type: 'number' } as Header<string>,
    { key: "submissionCount", label: "Total Submissions", sortable: true, type: 'number' } as Header<string>,
    { key: "completionRate", label: "Completion Rate", sortable: true, type: 'number' } as Header<string>,
  ] as const;

  const rows = detailData.map(round => ({
    roundId: round.roundId,
    signupCount: round.signupCount,
    submissionCount: round.submissionCount,
    completionRate: `${Math.round(round.completionRate * 100)}%`,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border border-background-tertiary/50 bg-background-secondary/50 w-full"
    >
      <div className="p-4 border-b border-background-tertiary/50">
        <h2 className="text-lg font-semibold text-primary">Round Details</h2>
      </div>
      <div className="max-h-[400px] overflow-auto">
        <DataTable
          headers={headers}
          rows={rows}
          isLoading={isLoading}
          defaultSortKey={sortKey || undefined}
          defaultSortDirection={sortDirection}
          onSort={onSort}
          allowCopy={true}
        />
      </div>
    </motion.div>
  );
};