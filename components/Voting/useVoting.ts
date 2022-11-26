import { useSupabase } from "components/hooks/useSupabaseClient";
import { yourEmail, yourName } from "components/shared/Form/fieldValues";
import { getIsSuccess } from "utils";
import { VoteOptionModel } from "./types";

export const useVoting = (
  roundId: number,
  setSuccessState: (successState: "success" | "error") => void
) => {
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
    setSuccessState(isSuccess ? "success" : "error");
  };

  const getFields = (voteOptions: VoteOptionModel[]) => {
    const votingFields = voteOptions.map((option) => ({
      ...option,
      type: "vote" as const,
    }));

    return [yourName, yourEmail, ...votingFields];
  };

  return { submitVotes, getFields };
};
