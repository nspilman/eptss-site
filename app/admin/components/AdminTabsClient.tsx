"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/primitives/tabs";

type AdminTabsClientProps = {
  initialTab: string;
  children: ReactNode[];
};

export function AdminTabsClient({
  initialTab,
  children,
}: AdminTabsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(initialTab || "overview");

  // Sync with URL changes
  useEffect(() => {
    setActiveTab(initialTab || "overview");
  }, [initialTab]);

  const handleTabChange = (tabId: string) => {
    // Update URL with new tab
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('tab', tabId);
    router.push(`/admin?${params.toString()}`);
  };

  // Extract tab content from children based on data-tab attribute
  const tabContent = {
    overview: children[0],
    reports: children[1],
    users: children[2],
    feedback: children[3],
    actions: children[4],
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
        {tabContent.overview}
      </TabsContent>

      <TabsContent value="reports" padding="none">
        {tabContent.reports}
      </TabsContent>

      <TabsContent value="users" padding="none">
        {tabContent.users}
      </TabsContent>

      <TabsContent value="feedback" padding="none">
        {tabContent.feedback}
      </TabsContent>

      <TabsContent value="actions" padding="none">
        {tabContent.actions}
      </TabsContent>
    </Tabs>
  );
}
