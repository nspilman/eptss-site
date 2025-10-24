"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { DataTable, Header } from "@eptss/ui";

type ActiveUser = {
  email: string;
  userId: string;
  lastSignupRound: number | null;
  lastSubmissionRound: number | null;
};

type ActiveUsersCardProps = {
  users: ActiveUser[];
};

export function ActiveUsersCard({ users }: ActiveUsersCardProps) {
  const [sortKey, setSortKey] = useState<string>("email");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>("asc");
  const [isLoading, setIsLoading] = useState(false);

  const headers = [
    { key: "email", label: "Email Address", sortable: true, type: 'text' } as Header<string>,
    { key: "lastSignupRound", label: "Last Signup Round", sortable: true, type: 'number' } as Header<string>,
    { key: "lastSubmissionRound", label: "Last Submission Round", sortable: true, type: 'number' } as Header<string>,
    { key: "status", label: "Status", sortable: true, type: 'text' } as Header<string>,
  ] as const;

  const rows = users.map(user => {
    const status = 
      !user.lastSignupRound ? "Never Participated" :
      !user.lastSubmissionRound ? "Signed Up Only" :
      user.lastSignupRound > user.lastSubmissionRound ? "Signed Up, No Submission" : "Active";
    
    return {
      email: user.email,
      lastSignupRound: user.lastSignupRound || "—",
      lastSubmissionRound: user.lastSubmissionRound || "—",
      status,
    };
  });

  const handleSort = (key: string, direction: "asc" | "desc" | null) => {
    setSortKey(key);
    setSortDirection(direction);
  };

  return (
    <div className="w-full space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-lg border border-background-tertiary/50 bg-background-secondary/50 w-full"
      >
        <div className="p-4 border-b border-background-tertiary/50">
          <h2 className="text-lg font-semibold text-primary">Active Users</h2>
          <p className="text-sm text-secondary">Users and their last participation in rounds</p>
        </div>
        <DataTable
          headers={headers}
          rows={rows}
          isLoading={isLoading}
          defaultSortKey={sortKey}
          defaultSortDirection={sortDirection}
          onSort={handleSort}
          maxHeight={400}
          allowCopy={true}
        />
      </motion.div>
    </div>
  );
}
