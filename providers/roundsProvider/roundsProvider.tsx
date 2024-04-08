"use server";
import {
  getAllRoundIds,
  getCurrentAndPastRounds,
  getCurrentRound,
} from "@/data-access/roundService";

interface Props {
  excludeCurrentRound?: boolean;
}

export const roundsProvider = async ({
  excludeCurrentRound = false,
}: Props) => {
  const { data } = await getCurrentAndPastRounds();
  const { roundId } = await getCurrentRound();
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

  const allRoundIds = await getAllRoundIds();

  return { roundContent, allRoundIds };
};
