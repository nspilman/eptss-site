"use client";

import { PageTitle } from "@/components/PageTitle";
import { ActionSuccessPanel } from "@/components/ActionSuccessPanel";
import { SignupForm } from "./SignupForm";
import { useSearchParams } from "next/navigation";
import { UserSignupData } from "@eptss/data-access/types/signup";
import { FormReturn } from "@/types";

interface Props {
  hasSignedUp: boolean;
  roundId: number;
  signupsCloseDateLabel: string;
  slug: string;
  projectSlug: string;
  projectName: string;
  isLoggedIn?: boolean;
  userSignup?: UserSignupData;
  signup: (formData: FormData, providedUserId?: string) => Promise<FormReturn>;
  signupWithOTP: (formData: FormData) => Promise<FormReturn>;
  requireSongOnSignup?: boolean;
}

export function SignupPage({
  hasSignedUp,
  roundId,
  signupsCloseDateLabel,
  slug,
  projectSlug,
  projectName,
  isLoggedIn = false,
  userSignup,
  signup,
  signupWithOTP,
  requireSongOnSignup = true,
}: Props) {
  // Check URL parameters
  const searchParams = useSearchParams();
  const isUpdate = searchParams?.get("update") === "true";
  const showSuccess = searchParams?.get("success") === "true";
  const referralCode = searchParams?.get("ref") || undefined;

  // Create signup title based on project
  const getSignupTitle = () => {
    console.log('[SignupPage] ===== TITLE GENERATION =====');
    console.log('[SignupPage] projectSlug:', projectSlug);
    console.log('[SignupPage] projectName:', projectName);
    console.log('[SignupPage] roundId:', roundId);

    if (projectSlug === 'monthly-original') {
      console.log('[SignupPage] Returning Monthly Originals title');
      return 'Sign up for the Monthly Originals project';
    }
    console.log('[SignupPage] Returning generic title:', `Sign Up for ${projectName}`);
    return `Sign Up for ${projectName}`;
  };

  const title = isUpdate
    ? `Update Your Song for ${slug}`
    : getSignupTitle();

  console.log('[SignupPage] Final title:', title);
  console.log('[SignupPage] ============================');

  const signupSuccessText = {
    header: `Thank you for signing up for ${slug} of ${projectName}!`,
    body: `You will get a welcome email with all the information and dates you will need.`,
    thankyou: `Thanks for participating`,
  };

  const signupSuccessImage = {
    src: roundId === 21 ? "/welcome-to-round-21.jpg" : "/welcomeimage.png",
    alt: `Welcome to ${projectName}!`,
    blurSrc:
      roundId === 21
        ? "welcome-to-round-21-blur.jpg"
        : "welcome-image-blur.png",
  };

  return (
    <>
      <PageTitle title={title} />
      {(hasSignedUp && !isUpdate) || showSuccess ? (
        <ActionSuccessPanel
          text={signupSuccessText}
          image={signupSuccessImage}
          roundId={roundId}
          projectSlug={projectSlug}
          action="signups"
        />
      ) : (
        <SignupForm
          roundId={roundId}
          signupsCloseDateLabel={signupsCloseDateLabel}
          title={title}
          isLoggedIn={isLoggedIn}
          isUpdate={hasSignedUp && isUpdate}
          existingSignup={userSignup}
          referralCode={referralCode}
          signup={signup}
          signupWithOTP={signupWithOTP}
          requireSongOnSignup={requireSongOnSignup}
        />
      )}
    </>
  );
}
