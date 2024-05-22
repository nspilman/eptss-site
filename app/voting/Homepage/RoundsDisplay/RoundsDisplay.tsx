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
  const pastRounds = rounds.slice(1)
  return (
    <div className="flex flex-col pt-8 gap-6 relative items-center">
      <div>
        <h2
          className="text-3xl font-bold"
        >
          Past Rounds
        </h2>
      </div>
      {pastRounds.map((round) => {
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
