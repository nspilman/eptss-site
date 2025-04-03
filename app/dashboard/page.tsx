import { redirect } from 'next/navigation';
import { roundProvider, userParticipationProvider } from "@/providers";
import { DashboardClient } from './DashboardClient';
import { getAuthUser } from "@/utils/supabase/server";
import { db } from "@/db";
import { unverifiedSignups } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardPage() {
  // Check auth first
  const { email } = getAuthUser();
  const { roundDetails: userRoundDetails, verifySignupByEmail } = await userParticipationProvider();

  let verificationStatus: { verified: boolean; message?: string } = { verified: false };

  // Check for pending unverified signups for this user
  if (email) {
    try {
      // First check if there's an unverified signup for this email
      const unverifiedSignup = await db
        .select()
        .from(unverifiedSignups)
        .where(eq(unverifiedSignups.email, email))
        .limit(1);

      // If there is one, verify it automatically
      if (unverifiedSignup.length > 0) {
        const result = await verifySignupByEmail();
        if (result.status === "Success") {
          verificationStatus = { 
            verified: true, 
            message: "Your signup has been verified successfully!" 
          };
        } else {
          verificationStatus = { 
            verified: false, 
            message: `Verification error: ${result.message}` 
          };
        }
      }
    } catch (error) {
      console.error("Error checking for unverified signups:", error);
      verificationStatus = { 
        verified: false, 
        message: `Error during verification: ${(error as Error).message}` 
      };
    }
  }

  // Only fetch round data if user is authenticated
  const currentRound = await roundProvider();

  return <DashboardClient 
    roundInfo={currentRound} 
    userRoundDetails={userRoundDetails}
    verificationStatus={verificationStatus}
  />;
}
