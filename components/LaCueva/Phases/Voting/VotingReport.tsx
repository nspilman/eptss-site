import { AggregateVoteTable } from "./AggregateVoteTable";
import { OutstandingVotes } from "./OutstandingVotes/OutstandingVotes";
import * as styles from "./VoteReport.css";

export const VotingReport = ({
  dateLabels,
}: {
  dateLabels: Record<"opens" | "closes", string>;
}) => {
  const { opens, closes } = dateLabels;

  return (
    <div>
      Voting: {opens} - {closes}
      <div className={styles.container}>
        <OutstandingVotes />
        <AggregateVoteTable />
      </div>
    </div>
  );
};
