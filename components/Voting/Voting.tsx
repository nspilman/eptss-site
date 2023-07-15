import { GENERIC_ERROR_MESSAGE } from "../../constants";
import { FormContainer } from "../shared/FormContainer";
import { VoteOptionModel } from "./types";
import { useVoting } from "./useVoting";
import { PageContainer } from "components/shared/PageContainer";
import { ActionSuccessPanel } from "components/shared/ActionSuccessPanel";
import { useUserSession } from "components/context/UserSessionContext";
import { SignInGate } from "components/shared/SignInGate";
import { VotingForm } from "./VotingForm";

export interface Props {
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

  const fields = voteOptions.map((option) => ({
    ...option,
    type: "vote" as const,
  }));

  return (
    <PageContainer title={title}>
      <SignInGate>
        <VotingForm
          fields={fields}
          coveringStartsLabel={coveringStartsLabel}
          title={title}
          roundId={roundId}
        />
      </SignInGate>
    </PageContainer>
  );
};
