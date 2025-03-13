import { redirect } from 'next/navigation';
import { roundProvider, userParticipationProvider } from "@/providers";
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  // Check auth first
  const { roundDetails: userRoundDetails } = await userParticipationProvider();
  
  if (!userRoundDetails?.user.userid) {
    redirect('/login');
  }

  // Only fetch round data if user is authenticated
  const currentRound = await roundProvider();

  return <DashboardClient 
    roundInfo={currentRound} 
    userRoundDetails={userRoundDetails} 
  />;

}
