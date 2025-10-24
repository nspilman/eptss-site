import { getAuthUser } from "@/utils/supabase/server";
import { getUnverifiedSignupByEmail, verifySignupByEmail } from "@/data-access";

export async function VerificationAlert() {
  const { email } = await getAuthUser();

  if (!email) {
    return null;
  }

  let verificationStatus: { verified: boolean; message?: string } = { verified: false };

  try {
    const unverifiedSignupResult = await getUnverifiedSignupByEmail(email);

    if (unverifiedSignupResult.status === 'success') {
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
    console.error("Error verifying signup:", error);
    verificationStatus = { 
      verified: false, 
      message: `Error during verification: ${(error as Error).message}` 
    };
  }

  if (!verificationStatus.message) {
    return null;
  }

  return (
    <div className={`mb-8 rounded-lg p-6 backdrop-blur-sm ${verificationStatus.verified ? 'bg-background-tertiary' : 'bg-background-error'}`}>
      <div className={`border-l-4 pl-4 ${verificationStatus.verified ? 'border-accent-primary' : 'border-accent-error'}`}>
        <h3 className="text-xl font-medium font-fraunces text-primary">
          {verificationStatus.verified ? 'Signup Verified' : 'Verification Issue'}
        </h3>
        <p className="mt-1 text-sm text-accent-primary opacity-90">
          {verificationStatus.message}
        </p>
      </div>
    </div>
  );
}
