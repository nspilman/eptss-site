import { roundProvider, votesProvider, adminPageProvider, COVER_PROJECT_ID } from "@eptss/core";
import { roundsProvider } from "@eptss/rounds/providers";
import { getAllFeedback } from "@eptss/core";
import { getAllUsers as getAllUsersService } from "@eptss/core";
import { getActiveUsers } from "@eptss/core";
import { getAllNotifications, getAllNotificationsCount, type NotificationWithUser } from "@eptss/core";
import { AdminTabs } from "./AdminTabs";

type AdminTabsServerProps = {
  slug?: string;
  tab?: string;
};

export async function AdminTabsServer({ slug, tab }: AdminTabsServerProps) {
  // Fetch all data in parallel
  const [adminData, roundsData, feedbackResult, allUsers, activeUsers, allNotifications, unseenNotifications, totalNotificationsCount, unseenNotificationsCount] = await Promise.all([
    adminPageProvider(),
    roundsProvider({ projectId: COVER_PROJECT_ID, excludeCurrentRound: false }),
    getAllFeedback(100, 0),
    getAllUsersService(),
    getActiveUsers(),
    getAllNotifications({ limit: 50, offset: 0 }),
    getAllNotifications({ unreadOnly: true, limit: 50, offset: 0 }),
    getAllNotificationsCount(false),
    getAllNotificationsCount(true),
  ]);

  const { stats } = adminData;
  const { allRoundSlugs } = roundsData;
  const feedbackList = feedbackResult.status === 'success' ? feedbackResult.data : [];

  const activeTab = tab || "overview";
  const roundSlug = slug || "";

  // Fetch round-specific data if we have a slug
  let roundData = null;
  let votesData = null;

  if (roundSlug) {
    // TODO: Support multi-project - currently hardcoded to Cover Project
    [roundData, votesData] = await Promise.all([
      roundProvider({ slug: roundSlug, projectId: COVER_PROJECT_ID }),
      votesProvider({ projectId: COVER_PROJECT_ID, roundSlug }),
    ]);
  }

  return (
    <AdminTabs
      initialTab={activeTab}
      roundSlug={roundSlug}
      allRoundSlugs={allRoundSlugs}
      stats={stats}
      activeUsers={activeUsers}
      feedbackList={feedbackList}
      allUsers={allUsers}
      roundData={roundData}
      votesData={votesData}
      allNotifications={allNotifications}
      unseenNotifications={unseenNotifications}
      totalNotificationsCount={totalNotificationsCount}
      unseenNotificationsCount={unseenNotificationsCount}
    />
  );
}
