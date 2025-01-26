"use client";

import { PageTitle } from "@/components/PageTitle";
import { ActionSuccessPanel } from "@/components/ActionSuccessPanel";
import { SignupForm } from "./SignupForm";

interface Props {
  hasSignedUp: boolean;
  roundId: number;
  signupsCloseDateLabel: string;
}

export function SignupPage({
  hasSignedUp,
  roundId,
  signupsCloseDateLabel,
}: Props) {
  const title = `Sign Up for Everyone Plays the Same Song round ${roundId}`;

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
      {hasSignedUp ? (
        <ActionSuccessPanel
          text={signupSuccessText}
          image={signupSuccessImage}
          roundId={roundId}
        />
      ) : (
        <SignupForm
          roundId={roundId}
          signupsCloseDateLabel={signupsCloseDateLabel}
        />
      )}
    </>
  );
}
