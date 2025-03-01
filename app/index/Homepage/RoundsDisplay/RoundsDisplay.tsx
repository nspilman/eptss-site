import { Phase } from "types";
import { roundsProvider } from "@/providers";
import { ClientRoundsDisplay } from "./ClientRoundsDisplay";

interface Props {
  currentRoundId: number | null;
  isVotingPhase: boolean;
  phase: Phase;
}
export const RoundsDisplay = async ({
  currentRoundId,
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
 <ClientRoundsDisplay rounds={rounds} currentRoundId={currentRoundId} isVotingPhase={isVotingPhase} />
    </div>
  );
};
