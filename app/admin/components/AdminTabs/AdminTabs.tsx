"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/primitives/tabs";
import { OverviewTab } from "../OverviewTab";
import { ReportsTab } from "../ReportsTab";
import { UsersTab } from "./UsersTab";
import { FeedbackTab } from "./FeedbackTab";
import { ActionsTab } from "../ActionsTab";

type AdminTabsProps = {
  initialTab: string;
  roundSlug: string;
  allRoundSlugs: string[];
  stats: any;
  activeUsers: any[];
  feedbackList: any[];
  allUsers: any[];
  roundData: any;
  votesData: any;
};

const TabLoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-primary">Loading...</div>
  </div>
);

export function AdminTabs({
  initialTab,
  roundSlug,
  allRoundSlugs,
  stats,
  activeUsers,
  feedbackList,
  allUsers,
  roundData,
  votesData,
}: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState(initialTab || "overview");

  // Sync with URL changes
  useEffect(() => {
    setActiveTab(initialTab || "overview");
  }, [initialTab]);

  const handleTabChange = (tabId: string) => {
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
        <OverviewTab stats={stats} />
      </TabsContent>

      <TabsContent value="reports" padding="none">
        {roundData ? (
          <ReportsTab
            stats={stats}
            phase={roundData.phase}
            dateLabels={roundData.dateLabels}
            signups={roundData.signups}
            submissions={roundData.submissions}
            voteOptions={roundData.voteOptions}
            outstandingVoters={votesData?.outstandingVoters || []}
            voteResults={votesData?.voteResults || []}
            allVotes={votesData?.allVotes || []}
          />
        ) : (
          <div className="text-center text-secondary py-8">
            No round selected. Please select a round from the dropdown above.
          </div>
        )}
      </TabsContent>

      <TabsContent value="users" padding="none">
        <UsersTab activeUsers={activeUsers} />
      </TabsContent>

      <TabsContent value="feedback" padding="none">
        <FeedbackTab feedbackList={feedbackList} />
      </TabsContent>

      <TabsContent value="actions" padding="none">
        <ActionsTab
          roundId={roundData?.roundId || 0}
          roundSlug={roundSlug}
          users={allUsers}
          allRoundSlugs={allRoundSlugs}
        />
      </TabsContent>
    </Tabs>
  );
}
