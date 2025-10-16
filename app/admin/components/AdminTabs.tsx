"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReportsTab } from "./ReportsTab";
import { ActionsTab } from "./ActionsTab";
import { UserDetails } from "@/types/user";

import { Phase, DateLabel, Submission } from "@/types/round";
import { ActiveUserDetail } from "@/providers/adminProvider/adminProvider";
import { SignupData } from "@/types/signup";
import { VoteOption } from "@/types/vote";

type VoteResult = {
  title: string;
  artist: string;
  average: number;
  votesCount: number;
};

type AdminTabsProps = {
  initialTab: string;
  stats: {
    totalUsers: number;
    totalRounds: number;
    activeUsers: number;
    completionRate: number;
  };
  activeUsers: ActiveUserDetail[];
  phase: Phase;
  dateLabels: Record<Phase, DateLabel>;
  signups: Array<Pick<SignupData, 'songId' | 'youtubeLink' | 'song' | 'additionalComments'> & {
    userId?: string;
    email?: string | null;
  }>;
  submissions: Submission[];
  voteOptions: VoteOption[];
  outstandingVoters: string[];
  voteResults: VoteResult[];
  roundId: number;
  roundSlug: string;
  users: UserDetails[];
  allRoundSlugs: string[];
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
  allRoundSlugs,
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
          allRoundSlugs={allRoundSlugs}
        />
      )}
    </div>
  );
}
