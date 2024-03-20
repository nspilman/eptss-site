import { ActionSuccessPanel } from "components/shared/ActionSuccessPanel";
import { FormContainer } from "components/shared/FormContainer";
import { GENERIC_ERROR_MESSAGE } from "consts";
import { useVoting } from "./useVoting";

interface Props {
  title: string;
  fields: {
    type: "vote";
    label: string;
    field: string;
    link: string;
  }[];
  roundId: number;
  coveringStartsLabel: string;
  userId?: string;
}

export const VotingForm = ({
  roundId,
  coveringStartsLabel,
  fields,
  title,
  userId,
}: Props) => {
  if (!userId) {
    throw new Error("Login required to access Signup page");
  }
  const { submitVotes, successPanelProps } = useVoting(
    roundId,
    coveringStartsLabel,
    userId
  );

  return (
    <FormContainer
      onSubmit={submitVotes}
      title={title}
      description={<></>}
      fields={fields}
      successBlock={<ActionSuccessPanel {...successPanelProps} />}
      errorMessage={GENERIC_ERROR_MESSAGE}
    />
  );
};
