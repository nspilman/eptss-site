"use server";
import {
  getCurrentRound,
  getRoundById,
  getRoundOverrideVotes,
  getSignupsByRound,
  getSubmissions,
} from "@/data-access";
import { Phase, RoundInfo } from "@/types/round";
import { getCurrentPhase, getPhaseDates, RoundDates } from "@/services/dateService";

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

  // Convert string dates to Date objects
  const roundDates: RoundDates = {
    signupOpens: signupOpens ? new Date(signupOpens) : new Date(),
    votingOpens: votingOpens ? new Date(votingOpens) : new Date(),
    coveringBegins: coveringBegins ? new Date(coveringBegins) : new Date(),
    coversDue: coversDue ? new Date(coversDue) : new Date(),
    listeningParty: listeningParty ? new Date(listeningParty) : new Date(),
  };

  const phase = getCurrentPhase(roundDates);
  const phaseDates = getPhaseDates(roundDates);

  // Convert dates to ISO strings for consistent formatting
  const dateLabels = Object.fromEntries(
    Object.entries(phaseDates).map(([phase, dates]) => [
      phase,
      {
        opens: dates.opens.toISOString(),
        closes: dates.closes.toISOString(),
      },
    ])
  ) as Record<Phase, { opens: string; closes: string }>;

  const hasRoundStarted = phaseOrder.indexOf(phase) > 0;
  const areSubmissionsOpen = phase === "signups";
  const isVotingOpen = phase === "voting";
  
  const [voteOptions, submissions] = await Promise.all([
    getVoteOptions(roundId),
    getSubmissions(roundId)
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
