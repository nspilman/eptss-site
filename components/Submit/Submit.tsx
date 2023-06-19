import { useSupabase } from "components/hooks/useSupabaseClient";
import { FormContainer } from "components/shared/FormContainer";
import { GENERIC_ERROR_MESSAGE } from "../../constants";
import { getIsSuccess } from "utils";
import { ActionSuccessPanel } from "components/shared/ActionSuccessPanel";
import { useUserSession } from "components/context/UserSessionContext";

interface Props {
  roundId: number;
  coverClosesLabel: string;
  listeningPartyLabel: string;
  song: {
    title: string;
    artist: string;
  };
}

export const Submit = ({
  roundId,
  coverClosesLabel,
  listeningPartyLabel,
  song,
}: Props) => {
  const { user } = useUserSession();

  if (!user) {
    throw new Error("Login required to access Signup page");
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
  const supabase = useSupabase();

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
  );
};
