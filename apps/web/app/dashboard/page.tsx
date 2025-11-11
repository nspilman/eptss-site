import { Dashboard } from '@eptss/dashboard';
import { eptssDeboardConfig } from './dashboard-config';
import { getAuthUser } from '@eptss/data-access/utils/supabase/server';
import {
  fetchHeroData,
  fetchActionData,
  fetchParticipantsData,
} from './data-fetchers';

// Force dynamic rendering for authenticated content
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function DashboardPage() {
  // Fetch user for role-based panel visibility
  const { userId } = await getAuthUser();

  // Fetch data for all panels in parallel
  const [heroData, actionData, participantsData] =
    await Promise.all([
      fetchHeroData(),
      fetchActionData(),
      fetchParticipantsData(),
    ]);

  return (
    <Dashboard
      config={eptssDeboardConfig}
      user={userId ? { id: userId, role: 'user' } : undefined}
      panelData={{
        hero: heroData,
        action: actionData,
        participants: participantsData,
      }}
    />
  );
}
