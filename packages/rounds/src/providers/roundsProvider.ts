"use server";
import {
  getAllRoundSlugs,
  getCurrentAndPastRounds,
  getCurrentRound,
} from "../services";

interface Props {
  excludeCurrentRound?: boolean;
  projectId: string;
}

export const roundsProvider = async ({
  excludeCurrentRound = false,
  projectId,
}: Props) => {
  const roundsResult = await getCurrentAndPastRounds(projectId);
  const currentRoundResult = await getCurrentRound(projectId);

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
