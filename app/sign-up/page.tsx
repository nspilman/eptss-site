import React from "react";

import { PageTitle } from "@/components/PageTitle";
import { getUserSession } from "@/components/client/context/userSessionProvider";
import { roundManager } from "@/services/roundManager";
import { SignInGate } from "@/components/SignInGate";
import { ClientFormWrapper } from "@/components/client/Forms/ClientFormWrapper";
import { Form } from "@/components/Form";
import { ActionSuccessPanel } from "@/components/ActionSuccessPanel";
import { additionalComments } from "@/components/fieldValues";
import { signup } from "@/actions/actions";
import { Navigation } from "@/enum/navigation";
import { revalidatePath } from "next/cache";

const SignUp = async () => {
  const { roundId, dateLabels } = await roundManager();
  const { userRoundDetails } = await getUserSession();
  const userId = userRoundDetails?.user.userid;
  const signupsCloseDateLabel = dateLabels?.signups.closes;
  const title = `Sign Up for Everyone Plays the Same Song round ${roundId}`;

  const fields = [
    {
      label: "Song title",
      placeholder: "Song title",
      field: "songTitle" as const,
      size: "large" as const,
      defaultValue: "",
    },
    {
      label: "Artist",
      placeholder: "artist",
      field: "artist" as const,
      size: "large" as const,
      defaultValue: "",
    },
    {
      label: "Youtube link",
      placeholder: "Youtube link",
      field: "youtubeLink" as const,
      size: "large" as const,
      defaultValue: "",
    },
    {
      label: "userId",
      placeholder: "Youtube link",
      field: "userId" as const,
      size: "large" as const,
      defaultValue: userId,
      hidden: true,
    },
    {
      label: "roundId",
      placeholder: "Youtube link",
      field: "roundId" as const,
      size: "large" as const,
      defaultValue: roundId,
      hidden: true,
    },
    additionalComments,
  ];

  const signupSuccessText = {
    header: `Thank you for signing up for this round of Everyone Plays the Same Song!`,
    body: ` You will get a welcome email with all the information and dates you will
    need.`,
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
      <SignInGate userId={userId} redirectUrl={Navigation.SignUp}>
        {userRoundDetails?.hasSignedUp ? (
          <ActionSuccessPanel
            text={signupSuccessText}
            image={signupSuccessImage}
            roundId={roundId}
          />
        ) : (
          <ClientFormWrapper
            action={signup}
            onSuccess={() => revalidatePath(Navigation.Submit)}
          >
            <Form
              title={title}
              description={`Signups close ${signupsCloseDateLabel}`}
              formSections={fields.map((field) => ({
                ...field,
                id: field.field,
                defaultValue: field.defaultValue || "",
              }))}
            />
          </ClientFormWrapper>
        )}
      </SignInGate>
    </>
  );
};

export default SignUp;
