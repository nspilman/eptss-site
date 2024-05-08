import { Phase } from "types";
import { RoundDisplay } from "./RoundDisplay";
import { roundsProvider } from "@/providers";

interface Props {
  currentRound: number;
  isVotingPhase: boolean;
  phase: Phase;
}
export const RoundsDisplay = async ({
  currentRound,
  isVotingPhase,
  phase,
}: Props) => {
  const { roundContent: rounds } = await roundsProvider({
    excludeCurrentRound: phase === "signups",
  });

  return (
    <div className="flex flex-col pt-8 pb-32 relative">
     
      <div>
        <h2
          id="rounds"
          className="text-white font-fraunces text-xl pb-8 font-bold"
        >
          Rounds
        </h2>
      </div>
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
