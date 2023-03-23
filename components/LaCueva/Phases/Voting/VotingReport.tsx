import { Box } from "@chakra-ui/react";
import { Celebration } from "../Celebration/Celebration";
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
      <Box>
        {/* <OutstandingVotes /> */}
        <Celebration />
        {/* <AggregateVoteTable /> */}
      </Box>
    </div>
  );
};
