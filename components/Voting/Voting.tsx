import { VoteOptionModel } from "./types";
import { PageContainer } from "components/shared/PageContainer";
import { SignInGate } from "components/shared/SignInGate";
import { VotingForm } from "./VotingForm";
import { FormScaffolding } from "components/shared/FormScaffolding";
import { useRound } from "components/context/RoundContext";
import { useUserSession } from "components/context/UserSessionContext";

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

  const { phase, isLoading: isRoundInfoLoading } = useRound();
  const { userRoundDetails, isLoading: isUserSessionLoading } =
    useUserSession();

  const shouldRenderForm =
    phase === "voting" || (roundId === 21 && phase === "signups");

  return (
    <PageContainer title={title}>
      <FormScaffolding
        Form={
          <VotingForm
            fields={fields}
            coveringStartsLabel={coveringStartsLabel}
            title={title}
            roundId={roundId}
          />
        }
        isLoading={isRoundInfoLoading || isUserSessionLoading}
        AlreadyCompleted={
          <h2 className="font-fraunces text-white font-bold text-xl">
            Thanks for Voting!
          </h2>
        }
        FormClosed={
          <h2 className="font-fraunces text-white font-bold text-xl">
            Voting is not open at this time! Check back later
          </h2>
        }
        hasUserCompletedTask={userRoundDetails.hasVoted}
        shouldRenderForm={shouldRenderForm}
      />
    </PageContainer>
  );
};
