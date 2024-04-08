"use server";
import { roundService } from "@/data-access/roundService";

interface Props {
  excludeCurrentRound?: boolean;
}

export const roundsProvider = async ({
  excludeCurrentRound = false,
}: Props) => {
  const { data } = await roundService.getCurrentAndPastRounds();
  const { roundId } = await roundService.getCurrentRound();
  const roundContent =
    data
      ?.map(({ song, playlistUrl, roundId }) => {
        const { title, artist } = song || { title: null, artist: null };
        return {
          title,
          artist,
          roundId,
          playlistUrl,
        };
      })
      .filter((round) => !(round.roundId === roundId && excludeCurrentRound)) ||
    [];

  const allRoundIds = await roundService.getAllRoundIds();

  return { roundContent, allRoundIds };
};
