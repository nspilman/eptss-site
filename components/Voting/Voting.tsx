import { VoteOptionModel } from "./types";
import { PageContainer } from "components/shared/PageContainer";
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
