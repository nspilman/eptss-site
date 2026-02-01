"use server";
import {
  getCurrentRound,
  getRoundBySlug,
  getCurrentPhase,
  getPhaseDates,
  type RoundDates,
} from "@eptss/rounds/services";
import { type Phase } from "@eptss/rounds/types";
import {
  getSignupsByRound,
  getSubmissions,
} from "../../services";
import { getRoundOverrideVotes } from "@eptss/voting/services";
import { getProjectBySlug } from "../../services/projectService";
import { RoundInfo } from "../../types/round";
import { VoteOption } from "../../types/vote";
import { getProjectSlugFromId } from "../../utils/projectUtils";

const phaseOrder: Phase[] = ["signups", "voting", "covering", "celebration"];

export interface RoundProviderParams {
  slug?: string;
  projectId: string;
}

export const roundProvider = async (params: RoundProviderParams): Promise<RoundInfo> => {
  const { slug, projectId } = params;
  let roundResult;

  if (slug) {
    // If slug is provided, use it to fetch the round for the specified project
    roundResult = await getRoundBySlug(projectId, slug);
  } else {
    // Get the current round for the specified project
    roundResult = await getCurrentRound(projectId);
  }


  if (roundResult.status !== 'success') {
    // Return default empty round info
    const now = new Date();
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
      signups: [],
      // Add default dates
      signupOpens: now,
      votingOpens: now,
      coveringBegins: now,
      coversDue: now,
      listeningParty: now,
      // Project features
      votingEnabled: true, // Default to true for empty rounds
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

  // Get project configuration to check if voting is enabled
  const projectSlug = getProjectSlugFromId(projectId);
  const project = projectSlug ? await getProjectBySlug(projectSlug) : null;
  const votingEnabled = project?.config?.features?.enableVoting ?? true;

  // Convert string dates to Date objects
  const roundDates: RoundDates = {
    signupOpens: signupOpens ? new Date(signupOpens) : new Date(),
    votingOpens: votingOpens ? new Date(votingOpens) : new Date(),
    coveringBegins: coveringBegins ? new Date(coveringBegins) : new Date(),
    coversDue: coversDue ? new Date(coversDue) : new Date(),
    listeningParty: listeningParty ? new Date(listeningParty) : new Date(),
  };

  const phase = getCurrentPhase(roundDates, votingEnabled);
  const phaseDates = getPhaseDates(roundDates, votingEnabled);

  // Store raw ISO strings - formatting happens at display time
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
  
  const [voteOptions, submissions, signups] = await Promise.all([
    getVoteOptions(roundId),
    getSubmissions(roundId),
    getSignupsByRound(roundId)
  ]);

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
    // Add raw dates for reflection scheduling
    signupOpens: roundDates.signupOpens,
    votingOpens: roundDates.votingOpens,
    coveringBegins: roundDates.coveringBegins,
    coversDue: roundDates.coversDue,
    listeningParty: roundDates.listeningParty,
    // Project features
    votingEnabled,
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
