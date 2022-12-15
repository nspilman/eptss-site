import { AggregateVoteTable } from "./AggregateVoteTable";
import { OutstandingVotes } from "./OutstandingVotes/OutstandingVotes";

export const VotingReport = ({
  dateLabels,
}: {
  dateLabels: Record<"opens" | "closes", string>;
}) => {
  const { opens, closes } = dateLabels;

  return (
    <div>
      Voting: {opens} - {closes}
      <OutstandingVotes />
      <AggregateVoteTable />
    </div>
  );
};
