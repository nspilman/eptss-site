import { GENERIC_ERROR_MESSAGE } from "../../constants";
import { FormContainer } from "../shared/FormContainer";
import { VoteOptionModel } from "./types";
import { useVoting } from "./useVoting";
import { PageContainer } from "components/shared/PageContainer";
import { ActionSuccessPanel } from "components/shared/ActionSuccessPanel";

interface Props {
  voteOptions: VoteOptionModel[];
  roundId: number;
  coveringStartsLabel: string;
}

export const Voting = ({
  voteOptions,
  roundId,
  coveringStartsLabel,
}: Props) => {
  const title = `Vote for the songs you want to cover in Round ${roundId}`;

  const { submitVotes, getFields, successPanelProps } = useVoting(
    roundId,
    coveringStartsLabel
  );

  const fields = getFields(voteOptions);

  return (
    <PageContainer title={title}>
      <FormContainer
        onSubmit={submitVotes}
        title={title}
        description={<></>}
        fields={fields}
        successBlock={<ActionSuccessPanel {...successPanelProps} />}
        errorMessage={GENERIC_ERROR_MESSAGE}
      />
    </PageContainer>
  );
};
