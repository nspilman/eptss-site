import { VoteBreakdown, VoteResults } from "../types";
import { RoundInfo } from "@eptss/data-access/types/round";
import { RoundInfoHeader } from "./RoundInfoHeader";
import { PlaylistEmbed } from "./PlaylistEmbed";
import { VotingAveragesTable } from "./VotingAveragesTable";
import { CelebrationTables } from "./CelebrationTables";
import { VotingResultsSection } from "./VotingResultsSection";
import { SignupsTable } from "./SignupsTable";
import { RoundNavigationWrapper } from "./RoundNavigationWrapper";
import { CoveringPhaseSignup } from "./CoveringPhaseSignup";
import { RoundReflections } from "./RoundReflections";
import { getAuthUser } from "@eptss/data-access/utils/supabase/server";

// Inline the chart utility function to avoid import issues
const convertVoteBreakdownToBarchartFormat = (
  voteBreakdown: VoteBreakdown[]
) => {
  const labels = voteBreakdown?.map(
    ({ artist, title }) => `${title} by ${artist}`
  );
  
  const oneVoteDataset = {
    label: "One Votes",
    data: voteBreakdown.map((breakdown) => breakdown.oneCount),
    backgroundColor: "rgb(120,100,100)",
  };
  
  const twoVoteDataset = {
    label: "Two Votes",
    data: voteBreakdown.map((breakdown) => breakdown.twoCount),
    backgroundColor: "rgb(180, 160, 145)",
  };

  const threeVoteDataset = {
    label: "Three Votes",
    data: voteBreakdown.map((breakdown) => breakdown.threeCount),
    backgroundColor: "rgb(200,190, 100)",
  };
  
  const fourVoteDataset = {
    label: "Four Votes",
    data: voteBreakdown.map((breakdown) => breakdown.fourCount),
    backgroundColor: "rgb(100, 100, 240",
  };
  
  const fiveVoteDataset = {
    label: "Five Votes",
    data: voteBreakdown.map((breakdown) => breakdown.fiveCount),
    backgroundColor: "rgb(75, 255, 75)",
  };

  return {
    labels,
    datasets: [
      oneVoteDataset,
      twoVoteDataset,
      threeVoteDataset,
      fourVoteDataset,
      fiveVoteDataset,
    ],
  };
};

interface Props {
  roundId: number;
  roundData: RoundInfo;
  voteResults?: VoteResults[];
  outstandingVoters?: string[];
  roundIds?: string[];
  voteBreakdown?: VoteBreakdown[];
  allRounds?: {
    title: string;
    artist: string;
    roundId: number;
    slug: string;
    playlistUrl: string;
    signupCount?: number;
    submissionCount?: number;
    startDate?: string;
    listeningPartyDate?: string;
    endDate?: string;
  }[];
  hasVoted?: boolean;
} 

const voteResultsHeaders = [
  { key: "title", label: "Title" },
  { key: "artist", label: "Artist" },
  { key: "average", label: "Average" },
] as const;

const signupsHeaders = [
  { key: "title", label: "Title" },
  { key: "artist", label: "Artist" },
  { key: "youtubeLink", label: "Youtube Link" },
] as const;


// --- Main Component ---
export const RoundSummary = async ({ roundId, roundData, voteResults = [], outstandingVoters = [], voteBreakdown = [], allRounds = [], hasVoted = false }: Props) => {
  try {
    const { phase, song, playlistUrl, submissions, signups, dateLabels } = roundData;
    
    // Check if the current user is signed up for this round
    const { userId } = await getAuthUser();
    const isUserSignedUp = userId ? signups.some(signup => signup.userId === userId) : false;
    let previousRound;
    let nextRound;
    if (allRounds && allRounds.length > 0) {
      const roundsWithListeningParty = allRounds.filter(round => round.listeningPartyDate);
      const sortedRounds = [...roundsWithListeningParty].sort((a, b) => {
        if (!a.listeningPartyDate) return 1;
        if (!b.listeningPartyDate) return -1;
        return new Date(b.listeningPartyDate).getTime() - new Date(a.listeningPartyDate).getTime();
      });
      const currentRoundIndex = sortedRounds.findIndex(round => round.roundId === roundId);
      if (currentRoundIndex !== -1) {
        previousRound = sortedRounds[currentRoundIndex + 1];
        nextRound = currentRoundIndex > 0 ? sortedRounds[currentRoundIndex - 1] : undefined;
      }
    }
    const navigation = {
      previousSlug: previousRound?.slug,
      nextSlug: nextRound?.slug,
    };

    const shouldShowVotingResultsSection = phase !== "voting" && phase !== "signups";

    const signupCount = signups?.length || 0;
    const signupDataDisplay = signups.map((signup) => ({
      youtubeLink: signup.youtubeLink || "",
      title: signup.song?.title || "",
      artist: signup.song?.artist || "",
    }));

    const chartData = convertVoteBreakdownToBarchartFormat(voteBreakdown);
    const roundSummaryHeaders = [
      { key: "phase", label: "Current Phase" },
      { key: "signupCount", label: "Signup Count" },
      { key: "submissionCount", label: "Submission Count" },
    ];
    const roundSummary = [
      {
        signupCount: `${signupCount} signups`,
        phase: `Current phase: ${phase}`,
        submissionCount: `${submissions?.length || 0} submissions`,
      },
    ];
    const submissionsDisplayHeaders = [
      {
        label: "Username",
        key: "username",
      },
      {
        label: "Submission",
        key: "soundcloudUrl",
      },
    ];

    return (
      <div className="flex flex-col items-center">
        <RoundInfoHeader roundId={roundId} song={song} phase={phase} showVotingResults={phase === "voting" && hasVoted} />
        <PlaylistEmbed playlistUrl={playlistUrl || ""} />
        {phase === "voting" && (
          <>
          {
            hasVoted ? (
              <VotingAveragesTable voteResults={voteResults} outstandingVoters={outstandingVoters} voteResultsHeaders={voteResultsHeaders} />
            ) : (
              <SignupsTable signupsHeaders={signupsHeaders} signupDataDisplay={signupDataDisplay} />
            )
          }
          </>
        )}
        {phase === "covering" && (
          <CoveringPhaseSignup roundId={roundId} isSignedUp={isUserSignedUp} />
        )}
        {phase === "celebration" && (
          <CelebrationTables roundSummaryHeaders={roundSummaryHeaders} roundSummary={roundSummary} submissionsDisplayHeaders={submissionsDisplayHeaders} submissions={submissions} />
        )}
        {shouldShowVotingResultsSection && (
          <VotingResultsSection
            voteResults={voteResults}
            voteResultsHeaders={voteResultsHeaders as any}
            chartData={chartData}
          />
        )}
        <RoundReflections roundId={roundId} />
        <RoundNavigationWrapper navigation={navigation} />
      </div>
    );
  } catch (error) {
    console.error('Error in RoundSummary:', error);
    return (
      <div className="flex flex-col items-center p-8">
        <h1 className="text-2xl font-bold text-red-500">Error Loading Round</h1>
        <p className="text-white mt-4">There was a problem loading this round&apos;s data. Please try again later.</p>
      </div>
    );
  }
};
