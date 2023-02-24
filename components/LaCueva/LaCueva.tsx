import { PageContainer } from "components/shared/PageContainer";
import { SignInGate } from "components/shared/SignInGate";
import { Phase } from "services/PhaseMgmtService";
import { VotingReport } from "./Phases/Voting/VotingReport";
import { useLocalStorageAuthFromParams } from "./useLocalStorageAuthFromParams";

export const LaCueva = ({
  roundId,
  dateLabels,
  phase,
}: {
  roundId: number;
  dateLabels: Record<Phase, Record<"opens" | "closes", string>>;
  phase: Phase;
}) => {
  const { isLoggedIn } = useLocalStorageAuthFromParams();
  return (
    <PageContainer title="la cueva">
      {isLoggedIn ? (
        <VotingReport dateLabels={dateLabels.voting} />
      ) : (
        <div>Get outa here</div>
      )}
    </PageContainer>
  );
};
