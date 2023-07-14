import { useSupabase } from "components/hooks/useSupabaseClient";
import { FormContainer } from "components/shared/FormContainer";
import { GENERIC_ERROR_MESSAGE } from "../../constants";
import { getIsSuccess } from "utils";
import { ActionSuccessPanel } from "components/shared/ActionSuccessPanel";
import { useUserSession } from "components/context/UserSessionContext";
import { SignInGate } from "components/shared/SignInGate";
import { PageContainer } from "components/shared/PageContainer";
import { useRouter } from "next/router";
import { Phase } from "services/PhaseMgmtService";
import { Box, Heading } from "@chakra-ui/react";

export interface Props {
  roundId: number;
  phase: Phase;
  coverClosesLabel: string;
  listeningPartyLabel: string;
  song: {
    title: string;
    artist: string;
  };
}

export const Submit = ({
  roundId,
  phase,
  coverClosesLabel,
  listeningPartyLabel,
  song,
}: Props) => {
  const { user } = useUserSession();
  const supabase = useSupabase();

  const isSubmissionOpen = ["celebration", "covering"].includes(phase);
  if (user && !isSubmissionOpen) {
    return (
      <Box>
        <Heading>
          Submissions are closed. Check the calendar for when submissions will
          be open again
        </Heading>
      </Box>
    );
  }

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
  ];

  interface SubmitModel {
    soundcloudUrl: string;
    coolThingsLearned?: string;
    toolsUsed?: string;
    happyAccidents?: string;
    didntWork?: string;
    userId: string;
  }

  interface SubmitEntity {
    round_id: number;
    soundcloud_url: string;
    additional_comments?: string;
    user_id: string;
  }

  const convertModelToEntity = ({
    soundcloudUrl,
    coolThingsLearned,
    toolsUsed,
    happyAccidents,
    didntWork,
    userId,
  }: SubmitModel): SubmitEntity => {
    return {
      round_id: roundId,
      soundcloud_url: soundcloudUrl,
      user_id: userId,
      additional_comments: JSON.stringify({
        coolThingsLearned,
        toolsUsed,
        happyAccidents,
        didntWork,
      }),
    };
  };

  const onSubmit = async (submitModal: SubmitModel) => {
    if (!user) {
      throw new Error("Cannot submit cover without user");
    }
    const signupEntity = convertModelToEntity({
      ...submitModal,
      userId: user.id,
    });
    const { status } = await supabase.from("submissions").insert(signupEntity);
    return getIsSuccess(status) ? "success" : "error";
  };

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
  };

  return (
    <PageContainer title={`Submit your cover for round ${roundId}`}>
      <SignInGate>
        <FormContainer
          fields={fields}
          description={description}
          onSubmit={onSubmit}
          title={title}
          errorMessage={GENERIC_ERROR_MESSAGE}
          successBlock={
            <ActionSuccessPanel
              text={submitSuccessText}
              image={submitSuccessImage}
            />
          }
        />
      </SignInGate>
    </PageContainer>
  );
};
