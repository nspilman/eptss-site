import { Dashboard } from '@eptss/dashboard';
import { eptssDeboardConfig } from './dashboard-config';
import { getAuthUser } from '@eptss/data-access/utils/supabase/server';
import {
  fetchHeroData,
  fetchPhaseStatusData,
  fetchActionData,
  fetchCurrentRoundData,
  fetchReflectionData,
} from './data-fetchers';

// Force dynamic rendering for authenticated content
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function DashboardPage() {
  // Fetch user for role-based panel visibility
  const { userId } = await getAuthUser();

  // Fetch data for all panels in parallel
  const [heroData, phaseStatusData, actionData, currentRoundData, reflectionData] =
    await Promise.all([
      fetchHeroData(),
      fetchPhaseStatusData(),
      fetchActionData(),
      fetchCurrentRoundData(),
      fetchReflectionData(),
    ]);

  return (
    <Dashboard
      config={eptssDeboardConfig}
      user={userId ? { id: userId, role: 'user' } : undefined}
      panelData={{
        hero: heroData,
        'phase-status': phaseStatusData,
        action: actionData,
        'current-round': currentRoundData,
        reflections: reflectionData,
      }}
    />
  );
}
