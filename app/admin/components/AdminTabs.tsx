"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/primitives/tabs";
import { OverviewTab } from "./OverviewTab";
import { ReportsTab } from "./ReportsTab";
import { UsersTab } from "./UsersTab";
import { ActionsTab } from "./ActionsTab";
import { FeedbackTab } from "./FeedbackTab";
import type { Feedback } from "@/data-access/feedbackService";
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

type IndividualVote = {
  email: string | null;
  userId: string | null;
  songId: number | null;
  vote: number;
  createdAt: Date | null;
  title: string | null;
  artist: string | null;
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
  allVotes: IndividualVote[];
  roundId: number;
  roundSlug: string;
  users: UserDetails[];
  allRoundSlugs: string[];
  feedbackList: Feedback[];
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
  allVotes,
  roundId,
  roundSlug,
  users,
  allRoundSlugs,
  feedbackList,
}: AdminTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(initialTab || "overview");

  // Sync with URL changes
  useEffect(() => {
    setActiveTab(initialTab || "overview");
  }, [initialTab]);

  const handleTabChange = (tabId: string) => {
    // Only update client-side state - no URL changes to avoid server round-trips
    setActiveTab(tabId);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="bg-background-secondary/30 border border-background-tertiary/50 mb-6">
        <TabsTrigger 
          value="overview"
          className="cursor-pointer data-[state=active]:bg-background-tertiary/70 data-[state=active]:text-primary data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-4"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="reports"
          className="cursor-pointer data-[state=active]:bg-background-tertiary/70 data-[state=active]:text-primary data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-4"
        >
          Rounds
        </TabsTrigger>
        <TabsTrigger 
          value="users"
          className="cursor-pointer data-[state=active]:bg-background-tertiary/70 data-[state=active]:text-primary data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-4"
        >
          Users
        </TabsTrigger>
        <TabsTrigger 
          value="feedback"
          className="cursor-pointer data-[state=active]:bg-background-tertiary/70 data-[state=active]:text-primary data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-4"
        >
          Feedback
        </TabsTrigger>
        <TabsTrigger 
          value="actions"
          className="cursor-pointer bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 data-[state=active]:bg-yellow-500 data-[state=active]:text-black data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-4"
        >
          Actions
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" padding="none">
        <OverviewTab 
          stats={stats}
        />
      </TabsContent>

      <TabsContent value="reports" padding="none">
        <ReportsTab 
          stats={stats}
          phase={phase}
          dateLabels={dateLabels}
          signups={signups}
          submissions={submissions}
          voteOptions={voteOptions}
          outstandingVoters={outstandingVoters}
          voteResults={voteResults}
          allVotes={allVotes}
        />
      </TabsContent>

      <TabsContent value="users" padding="none">
        <UsersTab 
          activeUsers={activeUsers}
        />
      </TabsContent>

      <TabsContent value="feedback" padding="none">
        <FeedbackTab 
          feedbackList={feedbackList}
        />
      </TabsContent>

      <TabsContent value="actions" padding="none">
        <ActionsTab 
          roundId={roundId} 
          roundSlug={roundSlug}
          users={users}
          allRoundSlugs={allRoundSlugs}
        />
      </TabsContent>
    </Tabs>
  );
}
