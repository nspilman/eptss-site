"use server";
import { format, subDays } from "date-fns";
import {
  getCurrentRound,
  getRoundById,
  getRoundOverrideVotes,
  getSignupsByRound,
  getSubmissions,
} from "@/data-access";
import { Phase } from "@/types";
import { seededShuffle } from "@/utils/seededShuffle";

interface Props {
  votingOpens: Date;
  coveringBegins: Date;
  coversDue: Date;
  signupOpens: Date;
  listeningParty: Date;
  roundId: number;
  song: { artist: string; title: string };
  typeOverride?: "runner_up";
  playlistUrl?: string;
}

const PhaseMgmtService = async ({
  votingOpens,
  coveringBegins,
  coversDue,
  signupOpens,
  listeningParty,
  roundId,
  song,
  typeOverride,
  playlistUrl,
}: Props) => {
  let phase: Phase;

  const now = new Date();
  if (now < signupOpens) {
    throw new Error(
      "current date cannot be before signup date. Signup starts the current round"
    );
  }
  if (!(votingOpens < coveringBegins && coveringBegins < coversDue)) {
    throw new Error("dates are in incorrect order");
  }

  const isBefore = (date: Date) => now < date;

  switch (true) {
    case isBefore(votingOpens):
      phase = "signups";
      break;
    case isBefore(coveringBegins):
      phase = "voting";
      break;
    case isBefore(coversDue):
      phase = "covering";
      break;
    default:
      phase = "celebration";
      break;
  }

  const dates = {
    signups: {
      opens: signupOpens,
      closes: subDays(votingOpens, 1),
    },
    voting: {
      opens: votingOpens,
      closes: subDays(coveringBegins, 1),
    },
    covering: {
      opens: coveringBegins,
      closes: subDays(coversDue, 1),
    },
    celebration: {
      opens: coversDue,
      closes: listeningParty,
    },
  };
  // use this.dates ^ as our source of truth
  // and keeping this.dateLabels to to make sure its backwards compatible
  // but ideally, components should use this.date values, and then format as needed
  const formatLabel = (date: Date) => format(date, "iiii, MMM do");
  const dateLabels = {
    signups: {
      opens: formatLabel(dates.signups.opens),
      closes: formatLabel(dates.signups.closes),
    },
    voting: {
      opens: formatLabel(dates.voting.opens),
      closes: formatLabel(dates.voting.closes),
    },
    covering: {
      opens: formatLabel(dates.covering.opens),
      closes: formatLabel(dates.covering.closes),
    },
    celebration: {
      opens: formatLabel(dates.celebration.opens),
      closes: formatLabel(dates.celebration.closes),
    },
  };

  const signupsToVoteOptions = ({ song, song_id, youtube_link }: any) => {
    const { artist, title } = song || {};
    // if (!artist || !title) {
    //   throw new Error("artist or title is null");
    // }
    return {
      label: `${title} by ${artist}`,
      field: song_id.toString(),
      link: youtube_link || "",
    };
  };

  const unsortedSignups = await getVoteOptions(roundId, typeOverride);
  const unsortedVoteOptions = unsortedSignups.map((entity) =>
    signupsToVoteOptions(entity)
  );
  const signups = seededShuffle(
    unsortedSignups,
    JSON.stringify(unsortedVoteOptions)
  );
  const voteOptions = seededShuffle(
    unsortedVoteOptions,
    JSON.stringify(unsortedVoteOptions.map(option => option.link))
  );

  return {
    phase,
    roundId,
    song,
    typeOverride,
    dateLabels,
    dates,
    playlistUrl,
    submissions: (await _getSubmissions(roundId)) || [],
    signups,
    areSubmissionsOpen: hasSubmissionsOpened(phase),
    hasRoundStarted: hasRoundStarted(phase),
    hasRoundEnded: hasRoundEnded(phase),
    voteOptions,
  };
};

export const roundProvider = async (currentRoundId?: number) => {
  const round = currentRoundId
    ? await getRoundById(currentRoundId)
    : await getCurrentRound();
  if (!round) {
    throw new Error("Unable to find round in RoundProvider");
  }
  const {
    votingOpens,
    coveringBegins,
    coversDue,
    signupOpens,
    listeningParty,
    roundId,
    song,
    typeOverride,
    playlistUrl,
  } = round;

  const datify = (dateString: string) => {
    const date = new Date(dateString);
    const isValidDate = date instanceof Date && !isNaN(date.getDate());
    if (!isValidDate)
      throw new Error(`${dateString} is an invalid date string`);
    return date;
  };

  return PhaseMgmtService({
    votingOpens: datify(votingOpens),
    coveringBegins: datify(coveringBegins),
    coversDue: datify(coversDue),
    signupOpens: datify(signupOpens),
    listeningParty: datify(listeningParty),
    roundId,
    song,
    typeOverride: typeOverride as "runner_up" | undefined,
    playlistUrl,
  })
};

const phaseOrder: Phase[] = ["signups", "voting", "covering", "celebration"];

const getPhaseOrderPosition = (phase: Phase) => {
  return phaseOrder.indexOf(phase);
};

const hasRoundStarted = (phase: Phase) => {
  return getPhaseOrderPosition(phase) > getPhaseOrderPosition("signups");
};

const hasSubmissionsOpened = (phase: Phase) => {
  return getPhaseOrderPosition(phase) > getPhaseOrderPosition("voting");
};

const hasRoundEnded = (phase: Phase) => {
  return phase === "celebration";
};

const _getSubmissions = async (roundId: number) => {
  const submissions = await getSubmissions(roundId);
  return submissions?.map((submission) => ({
    ...submission,
    roundId: submission.round_id,
    soundcloudUrl: submission.soundcloud_url,
  }));
};

const getVoteOptions = async (roundId: number, typeOverride?: "runner_up") => {
  const resultEntities:
    | {
        round_id: any;
        original_round_id?: any;
        song_id: any;
        youtube_link: string;
        song: {
          title: any;
          artist: any;
        };
      }[]
    | null = [];
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
    (result) => result.song_id && result.song_id !== -1
  );
};
