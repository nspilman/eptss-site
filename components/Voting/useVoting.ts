import { useSupabase } from "components/hooks/useSupabaseClient";
import { Tables } from "queries";
import { getIsSuccess } from "utils";

export const useVoting = (
  roundId: number,
  coveringStartsLabel: string,
  userId: string
) => {
  const subapase = useSupabase();

  const submitVotes = async (formPayload: Record<string, string>) => {
    const voteKeys = Object.keys(formPayload).filter(
      (key) => !["name", "email"].includes(key)
    );

    const votes = voteKeys.map((key) => ({
      song_id: key,
      vote: formPayload[key],
      round_id: roundId,
      user_id: userId,
    }));

    const { status } = await subapase.from(Tables.Votes).insert(votes);
    const isSuccess = getIsSuccess(status);
    return isSuccess ? "success" : "error";
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

  return { submitVotes, successPanelProps };
};
