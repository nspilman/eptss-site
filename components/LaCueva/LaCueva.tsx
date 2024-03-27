import { PageTitle } from "@/components/PageTitle";
import { Phase } from "@/services/roundManager";
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
    <>
      <PageTitle title="la cueva" />
      {isLoggedIn ? (
        <VotingReport dateLabels={dateLabels.voting} />
      ) : (
        <div>Get outa here</div>
      )}
    </>
  );
};
