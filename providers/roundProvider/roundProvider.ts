"use server";
import {
  getCurrentRound,
  getRoundBySlug,
  getRoundOverrideVotes,
  getSignupsByRound,
  getSubmissions,
} from "@/data-access";
import { Phase, RoundInfo } from "@/types/round";
import { getCurrentPhase, getPhaseDates, RoundDates, formatDate } from "@/services/dateService";
import { VoteOption } from "@/types/vote";

const phaseOrder: Phase[] = ["signups", "voting", "covering", "celebration"];

export const roundProvider = async (slug?: string): Promise<RoundInfo> => {
  let roundResult;
  
  if (slug) {
    // If slug is provided, use it to fetch the round
    roundResult = await getRoundBySlug(slug);
  } else {
    // Get the current round if no slug is provided
    roundResult = await getCurrentRound();
  }


  if (roundResult.status !== 'success') {
    // Return default empty round info
    return {
      roundId: 0,
      slug: '',
      phase: 'signups' as Phase,
      song: { title: '', artist: '' },
      dateLabels: {
        signups: { opens: '', closes: '' },
        voting: { opens: '', closes: '' },
        covering: { opens: '', closes: '' },
        celebration: { opens: '', closes: '' }
      },
      hasRoundStarted: false,
      areSubmissionsOpen: false,
      isVotingOpen: false,
      voteOptions: [],
      submissions: [],
      signups: []
    };
  }

  const round = roundResult.data;

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

  // Convert dates to human-readable format for display
  const dateLabels = Object.fromEntries(
    Object.entries(phaseDates).map(([phase, dates]) => [
      phase,
      {
        opens: formatDate.compact(dates.opens),
        closes: formatDate.compact(dates.closes),
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
    slug: round.slug || '',
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
