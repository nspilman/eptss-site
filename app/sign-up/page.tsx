import React from "react";

import { PageContainer } from "components/shared/PageContainer";
import { getUserSession } from "@/components/context/getUserSession";
import { getNewPhaseManager } from "@/services/PhaseMgmtService";
import { SignInGate } from "@/components/shared/SignInGate";
import { ClientFormWrapper } from "@/components/Forms/ClientFormWrapper";
import { Form } from "@/components/shared/FormContainer/Form";
import { ActionSuccessPanel } from "@/components/shared/ActionSuccessPanel";
import { additionalComments } from "@/components/shared/fieldValues";
import { signup } from "@/actions/actions";

const SignUp = async () => {
  const { roundId, dateLabels } = await getNewPhaseManager();
  const { userRoundDetails, user } = await getUserSession();
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
      defaultValue: user?.id,
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
    <PageContainer title={title}>
      <SignInGate userId={user?.id} redirectUrl="/sign-up">
        {userRoundDetails?.hasSignedUp ? (
          <ActionSuccessPanel
            text={signupSuccessText}
            image={signupSuccessImage}
            roundId={roundId}
          />
        ) : (
          <ClientFormWrapper action={signup}>
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
    </PageContainer>
  );
};

export default SignUp;
