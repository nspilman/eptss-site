"use server";
import {
  getCurrentRound,
  getRoundById,
  getRoundOverrideVotes,
  getSignupsByRound,
  getSubmissions,
} from "@/data-access";
import { Phase, RoundInfo } from "@/types/round";
import { seededShuffle } from "@/utils/seededShuffle";
import { formatDate, getCurrentPhase, getPhaseDates, parseDate, RoundDates } from "@/services/dateService";

const phaseOrder: Phase[] = ["signups", "voting", "covering", "celebration"];

type VoteOption = {
  roundId: number;
  originalRoundId?: number;
  songId: number;
  youtubeLink?: string;
  song: {
    title: string;
    artist: string;
  }
};

// async function getVoteOptions(roundId: number, typeOverride?: "runner_up"): Promise<VoteOption[]> {
//   const signups = await getSignupsByRound(roundId);

//   const overrideVotes = typeOverride && await getRoundOverrideVotes(roundId);
//   const allOptions = [...signups.map(signup => ({...signup, roundId })), ...(overrideVotes?.data || [])].map(signup => ({...signup, roundId})); 

//   return seededShuffle(allOptions, roundId.toString());
// }

async function transformSubmissions(roundId: number) {
  const rawSubmissions = await getSubmissions(roundId);
  return rawSubmissions.map(({ round_id, soundcloud_url, ...rest }) => ({
    ...rest,
    roundId: round_id,
    soundcloudUrl: soundcloud_url,
  }));
}

export const roundProvider = async (currentRoundId?: number): Promise<RoundInfo> => {
  const round = currentRoundId
    ? await getRoundById(currentRoundId)
    : await getCurrentRound();

  if (!round) {
    throw new Error(`Requested round ${currentRoundId} does now exist`);
  }

  const {
    roundId,
    signupOpens,
    votingOpens,
    coveringBegins,
    coversDue,
    listeningParty,
    song,
    playlistUrl,
  } = round;

  // Parse all dates at once
  const dates: RoundDates = {
    signupOpens: parseDate(signupOpens),
    votingOpens: parseDate(votingOpens),
    coveringBegins: parseDate(coveringBegins),
    coversDue: parseDate(coversDue),
    listeningParty: parseDate(listeningParty),
  };

  const phase = getCurrentPhase(dates);
  const phaseDates = getPhaseDates(dates);

  type DateLabel = {
    opens: string;
    closes: string;
  };

  const dateLabels: Record<Phase, DateLabel> = {
    signups: {
      opens: formatDate(phaseDates.signups.opens),
      closes: formatDate(phaseDates.signups.closes),
    },
    voting: {
      opens: formatDate(phaseDates.voting.opens),
      closes: formatDate(phaseDates.voting.closes),
    },
    covering: {
      opens: formatDate(phaseDates.covering.opens),
      closes: formatDate(phaseDates.covering.closes),
    },
    celebration: {
      opens: formatDate(phaseDates.celebration.opens),
      closes: formatDate(phaseDates.celebration.closes),
    },
  };

  const hasRoundStarted = phaseOrder.indexOf(phase) > 0;
  const areSubmissionsOpen = phase === "signups";
  const isVotingOpen = phase === "voting";
  
  const [voteOptions, submissions] = await Promise.all([
    getVoteOptions(roundId),
    transformSubmissions(roundId),
  ]);

  const signups = await getSignupsByRound(roundId);

  return {
    roundId,
    phase,
    song,
    dateLabels,
    hasRoundStarted,
    areSubmissionsOpen,
    isVotingOpen,
    voteOptions,
    submissions,
    playlistUrl,
    signups,
  }
};


const getVoteOptions = async (roundId: number, typeOverride?: "runner_up") => {
  const resultEntities: VoteOption[] = [];
  if (typeOverride === "runner_up") {
    const { data, error } = await getRoundOverrideVotes(roundId);
    //@ts-ignore
    data?.forEach((record) => record.song && resultEntities.push(record));
    if (error) {
      throw new Error(JSON.stringify(error));
    }
  } else {
    const data = await getSignupsByRound(roundId);
    //@ts-ignore
    data?.forEach((record) => resultEntities.push(record));
  }

  return resultEntities?.filter(
    (result) => result.songId && result.songId !== -1
  );
};
