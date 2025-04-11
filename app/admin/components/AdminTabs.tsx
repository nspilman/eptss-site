"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReportsTab } from "./ReportsTab";
import { ActionsTab } from "./ActionsTab";

type AdminTabsProps = {
  initialTab: string;
  stats: any;
  activeUsers: any[];
  phase: any;
  dateLabels: any;
  signups: any[];
  submissions: any[];
  voteOptions: any[];
  outstandingVoters: any[];
  voteResults: any;
  roundId: number;
  roundSlug: string;
  users: any[];
};

export function AdminTabs({
  initialTab,
  stats,
  activeUsers,
  phase,
  dateLabels,
  signups,
  submissions,
  voteOptions,
  outstandingVoters,
  voteResults,
  roundId,
  roundSlug,
  users,
}: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState(initialTab || "reports");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // Create a new URLSearchParams object
    const params = new URLSearchParams(searchParams?.toString());
    params.set("tab", tabId);
    
    // Navigate to the new URL
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <div className="flex space-x-1 bg-background-secondary/30 p-1 rounded-lg border border-background-tertiary/50 mb-6">
        <button
          onClick={() => handleTabChange("reports")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "reports"
              ? "bg-accent-primary text-white"
              : "text-primary hover:bg-background-tertiary/50"
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => handleTabChange("actions")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "actions"
              ? "bg-accent-primary text-white"
              : "text-primary hover:bg-background-tertiary/50"
          }`}
        >
          Actions
        </button>
      </div>

      {activeTab === "reports" && (
        <ReportsTab 
          stats={stats}
          activeUsers={activeUsers}
          phase={phase}
          dateLabels={dateLabels}
          signups={signups}
          submissions={submissions}
          voteOptions={voteOptions}
          outstandingVoters={outstandingVoters}
          voteResults={voteResults}
        />
      )}

      {activeTab === "actions" && (
        <ActionsTab 
          roundId={roundId} 
          roundSlug={roundSlug}
          users={users} 
        />
      )}
    </div>
  );
}
