import { Box, Heading } from "@chakra-ui/react";
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
    <div className="flex flex-col pt-8 pb-32 relative">
      <div className="pointer-events-none absolute translate-x-52">
        <div className="fixed top-28 md:left-40 right-24 w-80 h-80 bg-white rounded-full mix-blend-lighten filter blur-xl opacity-20 animate-blob"></div>
        <div className="fixed top-28 md:-left-4 w-80 h-80 bg-themeYellow rounded-full mix-blend-lighten filter blur-xl opacity-20 animate-blob"></div>
        <div className="fixed top-28 md:left-60 w-80 h-80 bg-bgGradientLighterBLue rounded-full mix-blend-lighten filter blur-xl opacity-40 animate-blob"></div>
      </div>

      <div className="pointer-events-none absolute translate-x-[40vw] translate-y-[80vh]">
        <div className="fixed top-28 md:-left-4 right-6 w-80 h-80 bg-themeYellow rounded-full mix-blend-lighten filter blur-xl opacity-10 animate-blob"></div>
        <div className="fixed top-28 md:left-40 left-8 w-80 h-80 bg-white rounded-full mix-blend-lighten filter blur-xl opacity-10 animate-blob"></div>
        <div className="fixed top-28 md:left-60 left-0 w-80 h-80 bg-bgGradientLighterBLue rounded-full mix-blend-lighten filter blur-xl opacity-40 animate-blob"></div>
      </div>
      <div className="pointer-events-none absolute translate-x-[40vw] translate-y-[160vh] md:hidden">
        <div className="fixed top-28 md:left-40 w-80 h-80 bg-white rounded-full mix-blend-lighten filter blur-xl opacity-10 animate-blob"></div>
        <div className="fixed top-28 md:left-60  right-6 w-80 h-80 bg-bgGradientLighterBLue rounded-full mix-blend-lighten filter blur-xl opacity-40 animate-blob"></div>
      </div>
      <Box>
        <h2
          id="rounds"
          className="text-white font-fraunces text-xl pb-8 font-bold"
        >
          Rounds
        </h2>
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
