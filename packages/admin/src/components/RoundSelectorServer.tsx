import { roundsProvider, COVER_PROJECT_ID } from "@eptss/data-access";
import { RoundSelector } from "./RoundSelector";

type RoundSelectorServerProps = {
  currentRoundSlug: string;
};

export async function RoundSelectorServer({ currentRoundSlug }: RoundSelectorServerProps) {
  const roundsData = await roundsProvider({ projectId: COVER_PROJECT_ID, excludeCurrentRound: false });
  const { allRoundSlugs } = roundsData;

  return (
    <RoundSelector 
      currentRoundSlug={currentRoundSlug} 
      allRoundSlugs={allRoundSlugs} 
    />
  );
}
