import { getAllUsers as getAllUsersService } from "@eptss/core";
import { ActionsTab } from "../ActionsTab";

type ActionsTabServerProps = {
  roundId: number;
  roundSlug: string;
  allRoundSlugs: string[];
};

export async function ActionsTabServer({ roundId, roundSlug, allRoundSlugs }: ActionsTabServerProps) {
  const allUsers = await getAllUsersService();
  
  return (
    <ActionsTab
      roundId={roundId}
      roundSlug={roundSlug}
      users={allUsers}
      allRoundSlugs={allRoundSlugs}
    />
  );
}
