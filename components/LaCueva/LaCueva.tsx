import { useUser, useSessionContext } from "@supabase/auth-helpers-react";
import { PageContainer } from "components/shared/PageContainer";
import { SignInGate } from "components/SignInGate/SignInGate";
import { Phase } from "services/PhaseMgmtService";
import { VotingReport } from "./Phases/Voting/VotingReport";

export const LaCueva = ({
  roundId,
  dateLabels,
  phase,
}: {
  roundId: number;
  dateLabels: Record<Phase, Record<"opens" | "closes", string>>;
  phase: Phase;
}) => {
  return (
    <PageContainer title="la cueva">
      <SignInGate>
        <VotingReport dateLabels={dateLabels.voting} />
      </SignInGate>
    </PageContainer>
  );
};
