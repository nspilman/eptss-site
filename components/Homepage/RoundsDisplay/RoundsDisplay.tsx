import { Stack, Box, Heading } from "@chakra-ui/react";
import { Phase } from "services/PhaseMgmtService";
import { RoundDetails } from "types";
import { RoundDisplay } from "./RoundDisplay";

interface Props {
  rounds: RoundDetails[];
  currentRound: number;
  isVotingPhase: boolean;
}
export const RoundsDisplay = ({
  rounds,
  currentRound,
  isVotingPhase,
}: Props) => {
  return (
    <Stack direction="column" py="8">
      <Box>
        <Heading as="h1" id="listen" pb="8" size={{ base: "md", lg: "lg" }}>
          Rounds
        </Heading>
      </Box>
      {rounds.map((round) => {
        return (
          <RoundDisplay
            key={round.roundId}
            round={round}
            currentRound={currentRound}
            isVotingPhase={isVotingPhase}
          />
        );
      })}
    </Stack>
  );
};
