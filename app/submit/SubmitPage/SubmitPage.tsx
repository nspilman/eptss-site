"use client";
import { PageTitle } from "@/components/PageTitle";
import { ClientFormWrapper } from "@/components/client/Forms/ClientFormWrapper";
import { Form } from "@/components/Form";
import { ActionSuccessPanel } from "@/components/ActionSuccessPanel";
import { revalidatePath } from "next/cache";
import { Navigation } from "@/enum/navigation";
import { userParticipationProvider } from "@/providers";

interface Props {
  roundId: number;
  hasSubmitted: boolean;
  song: {
    title: string;
    artist: string;
  };
  dateStrings: {
    coverClosesLabel: string;
    listeningPartyLabel: string;
  };
}

export const SubmitPage = async ({
  roundId,
  hasSubmitted,
  song,
  dateStrings,
}: Props): Promise<React.ReactElement>=> {
  const { coverClosesLabel, listeningPartyLabel } = dateStrings;
  const fields = [
    {
      label: "Soundcloud Link",
      placeholder: "Soundcloud Link",
      field: "soundcloudUrl",
      type: "text",
      size: "small",
    } as const,
    {
      label:
        "Did you learn anything cool in the process of putting this cover together?",
      placeholder: "Cool things learned!",
      field: "coolThingsLearned",
      type: "text",
      size: "large",
      optional: true,
    } as const,
    {
      label: "What tools did you use?",
      placeholder: "Tooooolz",
      field: "toolsUsed",
      type: "text",
      size: "large",
      optional: true,
    } as const,
    {
      label: "Were there any happy accidents you'd like to report?",
      placeholder: "I turned the knob all the way and it sounded superdope!",
      field: "happyAccidents",
      type: "text",
      size: "small",
      optional: true,
    } as const,
    {
      label: "Was there anything you tried to pull off that didn't work?",
      placeholder: "I turned the knob all the way and it sounded really bad!",
      field: "didntWork",
      type: "text",
      size: "small",
      optional: true,
    } as const,
    {
      label: "Invisible roundId",
      placeholder: "",
      field: "roundId",
      type: "text",
      size: "small",
      defaultValue: roundId,
      hidden: true,
    } as const,
  ];

  const title = `Submit your cover of ${song.title} by ${song.artist}`;
  const description = (
    <>
      <p>Covers are due {coverClosesLabel}</p> this form will stay open until
      the listening party on {listeningPartyLabel}
    </>
  );

  const submitSuccessText = {
    header: `Thank you for your submission, and congratulations on your hard work!`,
    body: `Please join us for the virtual listening party on ${listeningPartyLabel}.`,
    thankyou: `Thanks for participating`,
  };

  const submitSuccessImage = {
    src: "/submitSuccess.png",
    alt: "Thank you for submitting your cover!",
    blurSrc:
      "data:image/jpeg;base64,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",
  };

  const {submitCover} = await userParticipationProvider();

  return (
    <>
      <PageTitle title={`Submit your cover for round ${roundId}`} />
        {hasSubmitted ? (
          <ActionSuccessPanel
            text={submitSuccessText}
            image={submitSuccessImage}
            roundId={roundId}
          />
        ) : (
          <ClientFormWrapper
            action={submitCover}
            onSuccess={() => revalidatePath(Navigation.Submit)}
          >
            <Form
              title={title}
              description={description}
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
};
