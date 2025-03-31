"use server";
import {
  getAllRoundSlugs,
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
    .map(({ song, playlistUrl, roundId, slug, signupCount, submissionCount, signupOpens, coversDue, listeningParty }) => {
      const { title, artist } = song || { title: '', artist: '' };
      return {
        title,
        artist,
        roundId,
        slug: slug || roundId.toString(),
        playlistUrl: playlistUrl || '',
        signupCount,
        submissionCount,
        startDate: signupOpens?.toISOString(),
        listeningPartyDate: listeningParty?.toISOString(),
        endDate: coversDue?.toISOString(),
      };
    })
    .filter((round) => !(round.roundId === currentRoundId && excludeCurrentRound));

  const allRoundSlugsResult = await getAllRoundSlugs();
  const allRoundSlugs = allRoundSlugsResult.status === 'success' ? allRoundSlugsResult.data : [];

  return { roundContent, allRoundSlugs };
};
