import { GENERIC_ERROR_MESSAGE } from "../../constants";
import { useSuccessState } from "../hooks/useSuccessState";
import { useSupabase } from "../hooks/useSupabaseClient";
import { getIsSuccess } from "../../utils/utils";
import { Form } from "../shared/Form";
import { yourName, yourEmail } from "../shared/Form/fieldValues";
import { FormContainer } from "../shared/FormContainer";
import { VoteOptionModel } from "./types";

interface Props {
  voteOptions: VoteOptionModel[];
  roundId: string;
}

export const Voting = ({ voteOptions, roundId }: Props) => {
  const subapase = useSupabase();

  const title = `Vote for the songs you want to cover in Round ${roundId}`;
  const [successState, setSuccessState] = useSuccessState();

  const onSubmit = async (formPayload: Record<string, string>) => {
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

  const votingFields = voteOptions.map((option) => ({
    ...option,
    type: "vote" as const,
  }));

  const fields = [yourName, yourEmail, ...votingFields];

  return (
    <div style={{ padding: "64px" }}>
      <FormContainer
        form={
          <Form
            onSubmit={onSubmit}
            title={title}
            description={<></>}
            fields={fields}
          />
        }
        successBlock={<div> Thank you for voting! </div>}
        errorMessage={GENERIC_ERROR_MESSAGE}
        successState={successState}
      />
    </div>
  );
};
