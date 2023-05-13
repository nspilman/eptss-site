import { GENERIC_ERROR_MESSAGE } from "../../constants";
import { FormContainer } from "../shared/FormContainer";
import { VoteOptionModel } from "./types";
import { useVoting } from "./useVoting";
import { PageContainer } from "components/shared/PageContainer";
import { ActionSuccessPanel } from "components/shared/ActionSuccessPanel";
import { useSessionContext } from "@supabase/auth-helpers-react";

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

  const { session } = useSessionContext();
  if (!session) {
    throw new Error("Login required to access Signup page");
  }

  const { submitVotes, successPanelProps } = useVoting(
    roundId,
    coveringStartsLabel,
    session.user.id
  );

  const fields = voteOptions.map((option) => ({
    ...option,
    type: "vote" as const,
  }));

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
