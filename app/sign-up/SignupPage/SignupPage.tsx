"use client";
import React from "react";

import { PageTitle } from "@/components/PageTitle";
import { ClientFormWrapper } from "@/components/client/Forms/ClientFormWrapper";
import { Form } from "@/components/Form";
import { ActionSuccessPanel } from "@/components/ActionSuccessPanel";
import { additionalComments } from "@/components/fieldValues";
import { signup } from "@/actions/actions";
import { Navigation } from "@/enum/navigation";
import { revalidatePath } from "next/cache";

interface Props {
  userId: string;
  hasSignedUp: boolean;
  roundId: number;
  signupsCloseDateLabel: string;
}
export async function SignupPage({
  userId,
  hasSignedUp,
  roundId,
  signupsCloseDateLabel,
}: Props) {
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
      placeholder: "userId",
      field: "userId" as const,
      defaultValue: userId,
      hidden: true,
      optional: true,
    },
    {
      label: "roundId",
      placeholder: "Youtube link",
      field: "roundId" as const,
      size: "large" as const,
      defaultValue: roundId,
      hidden: true,
      optional: true,
    },
    additionalComments,
  ];

  const signupSuccessText = {
    header: `Thank you for signing up for round ${roundId} of Everyone Plays the Same Song!`,
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
        {hasSignedUp ? (
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
    </>
  );
}
