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
  const roundsResult = await getCurrentAndPastRounds();
  const currentRoundResult = await getCurrentRound();
  
  const currentRoundId = currentRoundResult.status === 'success' ? currentRoundResult.data.roundId : null;
  
  const rounds = roundsResult.status === 'success' ? roundsResult.data : [];
  const roundContent = rounds
    .map(({ song, playlistUrl, roundId, signupCount, submissionCount, signupOpens, coversDue }) => {
      const { title, artist } = song || { title: '', artist: '' };
      return {
        title,
        artist,
        roundId,
        playlistUrl: playlistUrl || '',
        signupCount,
        submissionCount,
        startDate: signupOpens?.toISOString(),
        endDate: coversDue?.toISOString(),
      };
    })
    .filter((round) => !(round.roundId === currentRoundId && excludeCurrentRound));

  const allRoundIdsResult = await getAllRoundIds();
  const allRoundIds = allRoundIdsResult.status === 'success' ? allRoundIdsResult.data : [];

  return { roundContent, allRoundIds };
};
