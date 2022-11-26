import { GENERIC_ERROR_MESSAGE } from "../../constants";
import { useSuccessState } from "../hooks/useSuccessState";
import { Form } from "../shared/Form";
import { FormContainer } from "../shared/FormContainer";
import { VoteOptionModel } from "./types";
import { useVoting } from "./useVoting";

interface Props {
  voteOptions: VoteOptionModel[];
  roundId: number;
}

export const Voting = ({ voteOptions, roundId }: Props) => {
  const title = `Vote for the songs you want to cover in Round ${roundId}`;
  const [successState, setSuccessState] = useSuccessState();

  const { submitVotes, getFields } = useVoting(roundId, setSuccessState);

  const fields = getFields(voteOptions);

  return (
    <div style={{ padding: "64px" }}>
      <FormContainer
        form={
          <Form
            onSubmit={submitVotes}
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
