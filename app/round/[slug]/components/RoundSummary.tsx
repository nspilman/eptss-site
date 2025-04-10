import Link from "next/link";
import { DataTable } from "@/components/DataTable";
import { PageTitle } from "@/components/PageTitle";
import { VoteBreakdown, VoteResults } from "../types";
import { StackedBarChart } from "../StackedBarChart";
import { RoundNavigation } from "./RoundNavigation";
import { RoundInfo } from "@/types/round";

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

// Create a client component for the stacked bar chart
const ClientStackedBarChart = ({ data, title }: { data: any, title: string }) => {
  "use client";
  return (
    <StackedBarChart data={data} title={title} />
  );
};

export const RoundSummary = async ({ roundId, roundData, voteResults = [], voteBreakdown = [], allRounds = [] }: Props) => {
  try {
    // Extract data from props instead of fetching
    const { phase, song, playlistUrl, submissions, signups, dateLabels } = roundData;
    
    // Find the most recent round where the listening party has happened
    let previousRound;
    let nextRound;
    
    if (allRounds && allRounds.length > 0) {
      // Filter rounds that have a listening party date
      const roundsWithListeningParty = allRounds.filter(round => round.listeningPartyDate);
      
      // Sort rounds by listening party date in descending order (most recent first)
      const sortedRounds = [...roundsWithListeningParty].sort((a, b) => {
        if (!a.listeningPartyDate) return 1;
        if (!b.listeningPartyDate) return -1;
        return new Date(b.listeningPartyDate).getTime() - new Date(a.listeningPartyDate).getTime();
      });
      
      // Find the current round index
      const currentRoundIndex = sortedRounds.findIndex(round => round.roundId === roundId);
      
      if (currentRoundIndex !== -1) {
        // Find the previous round (the next one in the sorted array since we're sorting by date in descending order)
        previousRound = sortedRounds[currentRoundIndex + 1];
        
        // Find the next round (the previous one in the sorted array)
        nextRound = currentRoundIndex > 0 ? sortedRounds[currentRoundIndex - 1] : undefined;
      }
    }
    
    const navigation = {
      previous: previousRound?.roundId,
      next: nextRound?.roundId,
      // Include slug information for navigation
      previousSlug: previousRound?.slug,
      nextSlug: nextRound?.slug,
    };
    
    const signupCount = signups?.length || 0;
    const signupDataDisplay = signups.map((signup) => ({
      youtubeLink: signup.youtubeLink || "",
      title: signup.song?.title || "",
      artist: signup.song?.artist || "",
    }));
    
    // Handle signup phase
    if (phase === "signups") {
      // Get the signup deadline from dateLabels
      const signupDeadline = dateLabels?.signups?.closes ? new Date(dateLabels.signups.closes).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'TBD';
      
      return (
        <>
          <PageTitle title={`Round ${roundId} Signups`} />
          <div className="flex flex-col items-center">
            <div className="pb-8 text-center">
              <h1 className="font-fraunces text-primary font-bold text-3xl">
                Round {roundId} Signups
              </h1>
            </div>
            
            <div className="w-full max-w-2xl p-8 my-6 rounded-xl bg-background-secondary shadow-lg">
              <h3 className="font-fraunces text-primary text-2xl mb-6 text-center">Signup Information</h3>
              
              <div className="space-y-8">
                <div className="flex flex-col items-center p-4 bg-background-primary rounded-lg">
                  <p className="text-primary font-medium mb-2">Current Signups</p>
                  <p className="text-primary text-3xl font-bold">{signupCount} participants</p>
                </div>
                
                <div className="flex flex-col items-center p-4 bg-background-primary rounded-lg">
                  <p className="text-primary font-medium mb-2">Signup Deadline</p>
                  <p className="text-primary text-2xl font-bold">{signupDeadline}</p>
                </div>
                
                <div className="mt-8 flex justify-center">
                  <Link 
                    href="/signup" 
                    className="btn-main text-lg"
                  >
                    Sign Up for This Round
                  </Link>
                </div>
              </div>
            </div>
            
            <RoundNavigation navigation={navigation} />
          </div>
        </>
      );
    }
    
    const chartData = convertVoteBreakdownToBarchartFormat(voteBreakdown);

    const roundSummaryHeaders: {
      key: string;
      label: string;
    }[] = [
      {
        key: "phase",
        label: "Current Phase",
      },
      {
        key: "signupCount",
        label: "Signup Count",
      },
    ];

    const submissionsDisplayHeaders: {
      label: string;
      key: "soundcloudUrl" | "username";
    }[] = [
      {
        label: "Username",
        key: "username",
      },
      {
        label: "Submission",
        key: "soundcloudUrl",
      },
    ];

    const submissionCountHeader = {
      key: "submissionCount",
      label: "Submission Count",
    };
    const roundIsComplete = phase === "celebration";

    if (roundIsComplete) {
      roundSummaryHeaders.push(submissionCountHeader);
    }

    const roundSummary = [
      {
        signupCount: `${signupCount} signups`,
        phase: `Current phase: ${phase}`,
        submissionCount: `${submissions?.length || 0} submissions`,
      },
    ];

    // Only need to create this once since we already defined it above
    const isVotingPhase = phase === "voting";
  
    return (
      <>
        <PageTitle title={`Round ${roundId} Info`} />
        <div className="flex flex-col items-center">
          <div className="pb-4 text-center">
            <h1 className="font-fraunces text-white font-semibold text-lg pb-1">
              Round {roundId} Info
            </h1>
            {!isVotingPhase && (
              <h2 className="font-fraunces text-white font-bold text-xl">
                {song?.title || ""} by {song?.artist || ""}
              </h2>
            )}
          </div>
          <div
            className={`w-[400px] sm:w-[600px] md:w-[800px] lg:w-[1000px]`}
            dangerouslySetInnerHTML={{ __html: playlistUrl || "" }}
          />

          {phase === "celebration" && (
            <>
              <DataTable headers={roundSummaryHeaders} rows={roundSummary} />
              <div className="p-10">
                <DataTable
                  title="Cover Submissions"
                  headers={submissionsDisplayHeaders}
                  rows={(submissions || []).map(
                    ({ username, soundcloudUrl }) => ({
                      username,
                      soundcloudUrl: <Link href={soundcloudUrl}>Link</Link>,
                    })
                  )}
                />
              </div>
            </>
          )}

          {isVotingPhase ? (
            <DataTable
              title={"Songs in play to Cover"}
              headers={signupsHeaders}
              rows={signupDataDisplay}
            />
          ) : (
            <DataTable
              title={"Voting Breakdown"}
              headers={voteResultsHeaders}
              rows={voteResults}
            />
          )}

          {!isVotingPhase && (
            <div
              className={`w-[400px] sm:w-[600px] md:w-[800px] lg:w-[1000px] overflow-scroll`}
            >
              <ClientStackedBarChart
                data={chartData}
                title="Vote Breakdown Bar Chart"
              />
            </div>
          )}
          
          <RoundNavigation navigation={navigation} />
        </div>
      </>
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
