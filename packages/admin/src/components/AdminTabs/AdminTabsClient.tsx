"use client";

import { useEffect, useState, ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@eptss/ui";

type AdminTabsClientProps = {
  initialTab: string;
  overviewContent: ReactNode;
  reportsContent: ReactNode;
  usersContent: ReactNode;
  feedbackContent: ReactNode;
  actionsContent: ReactNode;
};

export function AdminTabsClient({
  initialTab,
  overviewContent,
  reportsContent,
  usersContent,
  feedbackContent,
  actionsContent,
}: AdminTabsClientProps) {
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
        {overviewContent}
      </TabsContent>

      <TabsContent value="reports" padding="none">
        {reportsContent}
      </TabsContent>

      <TabsContent value="users" padding="none">
        {usersContent}
      </TabsContent>

      <TabsContent value="feedback" padding="none">
        {feedbackContent}
      </TabsContent>

      <TabsContent value="actions" padding="none">
        {actionsContent}
      </TabsContent>
    </Tabs>
  );
}
