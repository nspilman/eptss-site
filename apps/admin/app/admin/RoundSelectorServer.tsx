import { roundsProvider } from "@eptss/data-access";
import { RoundSelector } from "./RoundSelector";

type RoundSelectorServerProps = {
  currentRoundSlug: string;
};

export async function RoundSelectorServer({ currentRoundSlug }: RoundSelectorServerProps) {
  const roundsData = await roundsProvider({});
  const { allRoundSlugs } = roundsData;

  return (
    <RoundSelector 
      currentRoundSlug={currentRoundSlug} 
      allRoundSlugs={allRoundSlugs} 
    />
  );
}
