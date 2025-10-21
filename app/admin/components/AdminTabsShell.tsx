import { Suspense } from "react";
import { TabNavigation } from "./TabNavigation";
import { OverviewTabServer } from "./tabs/OverviewTabServer";
import { ReportsTabServer } from "./tabs/ReportsTabServer";
import { UsersTabServer } from "./tabs/UsersTabServer";
import { FeedbackTabServer } from "./tabs/FeedbackTabServer";
import { ActionsTabServer } from "./tabs/ActionsTabServer";

type AdminTabsShellProps = {
  initialTab: string;
  roundSlug: string;
};

const TabSkeleton = () => (
  <div className="space-y-4">
    <div className="h-8 bg-background-secondary/30 animate-pulse rounded w-1/4" />
    <div className="h-64 bg-background-secondary/30 animate-pulse rounded" />
  </div>
);

export function AdminTabsShell({ initialTab, roundSlug }: AdminTabsShellProps) {
  return (
    <div className="w-full">
      {/* Tab Navigation - wrapped in Suspense */}
      <Suspense fallback={
        <div className="h-12 bg-background-secondary/30 animate-pulse rounded w-96" />
      }>
        <TabNavigation activeTab={initialTab} currentSlug={roundSlug} />
      </Suspense>

      {/* Tab Content - Only render the active tab */}
      <div className="mt-6">
        {initialTab === "overview" && (
          <Suspense fallback={<TabSkeleton />}>
            <OverviewTabServer />
          </Suspense>
        )}

        {initialTab === "reports" && (
          <Suspense fallback={<TabSkeleton />}>
            <ReportsTabServer roundSlug={roundSlug} />
          </Suspense>
        )}

        {initialTab === "users" && (
          <Suspense fallback={<TabSkeleton />}>
            <UsersTabServer />
          </Suspense>
        )}

        {initialTab === "feedback" && (
          <Suspense fallback={<TabSkeleton />}>
            <FeedbackTabServer />
          </Suspense>
        )}

        {initialTab === "actions" && (
          <Suspense fallback={<TabSkeleton />}>
            <ActionsTabServer roundSlug={roundSlug} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
