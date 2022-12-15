import { useSupabase } from "components/hooks/useSupabaseClient";
import { yourEmail, yourName } from "components/shared/fieldValues";
import { getIsSuccess } from "utils";
import { VoteOptionModel } from "./types";

export const useVoting = (roundId: number, coveringStartsLabel: string) => {
  const subapase = useSupabase();

  const submitVotes = async (formPayload: Record<string, string>) => {
    const { email } = formPayload;
    const voteKeys = Object.keys(formPayload).filter(
      (key) => !["name", "email"].includes(key)
    );

    const votes = voteKeys.map((key) => ({
      song_id: key,
      vote: formPayload[key],
      submitter_email: email,
      round_id: roundId,
    }));

    const { status } = await subapase
      .from("song_selection_votes")
      .insert(votes);
    const isSuccess = getIsSuccess(status);
    return isSuccess ? "success" : "error";
  };

  const getFields = (voteOptions: VoteOptionModel[]) => {
    const votingFields = voteOptions.map((option) => ({
      ...option,
      type: "vote" as const,
    }));

    return [yourName, yourEmail, ...votingFields];
  };

  const successText = {
    header: `Thank you for voting!!`,
    body: `The winning song will be announced and covers will start on ${coveringStartsLabel}`,
    thankyou: `May the best song win!`,
  };

  const signupSuccessImage = {
    src: "/thxForVoting.png",
    alt: "Thank you for voting!!",
  };

  const successPanelProps = {
    text: successText,
    image: signupSuccessImage,
  };

  return { submitVotes, getFields, successPanelProps };
};
