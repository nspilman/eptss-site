import { title } from "process";
import { Rounds, columns } from "./columns"
import { DataTable } from "./Data-table"
import { roundsProvider } from "@/providers";
import { Phase } from "@/types";

interface Props {
    currentRound: number;
    isVotingPhase: boolean;
    phase: Phase;
  }

export const DemoPage = async ({
    currentRound,
    isVotingPhase,
    phase
}: Props) => {
    const { roundContent: rounds } = await roundsProvider({
        excludeCurrentRound: phase === "signups",
      });

      const combinedTitleArtist = rounds.map((round) => {
        return `${round.title} - ${round.artist}`;
      })

console.log( combinedTitleArtist)
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={rounds} />
    </div>
  )
}
