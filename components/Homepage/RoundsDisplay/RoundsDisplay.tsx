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
    <div className="flex flex-col py-8 relative">
      <div className="pointer-events-none absolute translate-x-52">
        <div className="fixed top-28 -left-4 w-80 h-80 bg-themeYellow rounded-full mix-blend-lighten filter blur-xl opacity-10 animate-blob"></div>
        <div className="fixed top-28 left-40 w-80 h-80 bg-white rounded-full mix-blend-lighten filter blur-xl opacity-10 animate-blob"></div>
        <div className="fixed top-28 left-60 w-80 h-80 bg-bgGradientLighterBLue rounded-full mix-blend-lighten filter blur-xl opacity-40 animate-blob"></div>
      </div>

      <div className="pointer-events-none absolute translate-x-[40vw] translate-y-[80vh]">
        <div className="fixed top-28 -left-4 w-80 h-80 bg-themeYellow rounded-full mix-blend-lighten filter blur-xl opacity-10 animate-blob"></div>
        <div className="fixed top-28 left-40 w-80 h-80 bg-white rounded-full mix-blend-lighten filter blur-xl opacity-10 animate-blob"></div>
        <div className="fixed top-28 left-60 w-80 h-80 bg-bgGradientLighterBLue rounded-full mix-blend-lighten filter blur-xl opacity-40 animate-blob"></div>
      </div>
      <Box>
        <Heading as="h1" id="rounds" pb="8" size={{ base: "md", lg: "lg" }}>
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
    </div>
  );
};
