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
    <section id="rounds">
      <ClientRoundsDisplay 
        rounds={rounds} 
        currentRoundId={currentRoundId} 
        isVotingPhase={isVotingPhase} 
      />
    </section>
  );
};
