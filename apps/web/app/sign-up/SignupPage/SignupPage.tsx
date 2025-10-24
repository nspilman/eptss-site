"use client";

import { PageTitle } from "@/components/PageTitle";
import { ActionSuccessPanel } from "@/components/ActionSuccessPanel";
import { SignupForm } from "./SignupForm";
import { useSearchParams } from "next/navigation";
import { UserSignupData } from "@/types/signup";
import { FormReturn } from "@/types";

interface Props {
  hasSignedUp: boolean;
  roundId: number;
  signupsCloseDateLabel: string;
  slug: string;
  isLoggedIn?: boolean;
  userSignup?: UserSignupData;
  signup: (formData: FormData, providedUserId?: string) => Promise<FormReturn>;
  signupWithOTP: (formData: FormData) => Promise<FormReturn>;
}

export function SignupPage({
  hasSignedUp,
  roundId,
  signupsCloseDateLabel,
  slug,
  isLoggedIn = false,
  userSignup,
  signup,
  signupWithOTP,
}: Props) {
  // Check URL parameters
  const searchParams = useSearchParams();
  const isUpdate = searchParams?.get("update") === "true";
  const showSuccess = searchParams?.get("success") === "true";
  
  const title = isUpdate 
    ? `Update Your Song for Round ${roundId}` 
    : `Sign Up for Everyone Plays the Same Song round ${roundId}`;

  const signupSuccessText = {
    header: `Thank you for signing up for round ${roundId} of Everyone Plays the Same Song!`,
    body: `You will get a welcome email with all the information and dates you will need.`,
    thankyou: `Thanks for participating`,
  };

  const signupSuccessImage = {
    src: roundId === 21 ? "/welcome-to-round-21.jpg" : "/welcomeimage.png",
    alt: "Welcome to Everyone Plays the Same Song!",
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
        />
      ) : (
        <SignupForm
          roundId={roundId}
          signupsCloseDateLabel={signupsCloseDateLabel}
          isLoggedIn={isLoggedIn}
          isUpdate={hasSignedUp && isUpdate}
          existingSignup={userSignup}
          signup={signup}
          signupWithOTP={signupWithOTP}
        />
      )}
    </>
  );
}
