import Link from "next/link";
import { DataTable } from "@/components/DataTable";
import { PageTitle } from "@/components/PageTitle";
import { votesProvider, roundsProvider, roundProvider } from "@/providers";
import { StackedBarChart } from "./StackedBarChart";
import { getVoteBreakdownBySong } from "@/data-access";
import { Metadata } from 'next';

export default async function Round({ params }: { params: { id: string } }) {
  return (
    <>
      <PageTitle title={`Round ${params.id} Overview`} />
      <RoundSummary roundId={JSON.parse(params.id)} />
    </>
  );
}

export interface VoteResults {
  title: string;
  artist: string;
  average: number;
}
[];

export interface SignupData {
  youtube_link: string;
  title: string;
  artist: string;
}

export interface Navigation {
  next?: number;
  previous?: number;
}

export interface RoundMetadata {
  artist: string;
  title: string;
  playlistUrl: string;
  submitter: string;
}
export interface VoteBreakdown {
  title: string;
  artist: string;
  oneCount: number;
  twoCount: number;
  threeCount: number;
  fourCount: number;
  fiveCount: number;
}

interface Props {
  roundId: number;
}

const voteResultsHeaders = [
  {
    key: "title",
    label: "Title",
  },
  { key: "artist", label: "Artist" },
  { key: "average", label: "Average Vote" },
] as const;

const signupsHeaders = [
  {
    key: "title",
    label: "Title",
  },
  { key: "artist", label: "Artist" },
  { key: "youtubeLink", label: "Youtube Link" },
] as const;

const RoundSummary = async ({ roundId }: Props) => {
  "use client"
  const { phase, song, playlistUrl, submissions, signups } =
    await roundProvider(roundId);

  if (phase === "signups") {
    return <></>;
  }
  const { voteResults } = await votesProvider({ roundId });

  const { allRoundIds: roundIds } = await roundsProvider({
    excludeCurrentRound: true,
  });

  const signupCount = signups?.length || 0;
  const voteBreakdown = await getVoteBreakdownBySong(roundId);

  const navigation = {
    previous: roundId !== 0 ? roundId - 1 : undefined,
    next: roundIds?.includes(roundId + 1)
      ? roundId + 1
      : undefined,
  };

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

  const signupDataDisplay = signups.map((signup) => ({
    youtubeLink: signup.youtubeLink || "",
    title: signup.song?.title || "",
    artist: signup.song?.artist || "",
  }));

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
            {/* <span className="text-md font-light font-roboto text-white">
              Submitted by: {submitter}
            </span> */}
            <DataTable headers={roundSummaryHeaders} rows={roundSummary} />
            <div className="p-10">
              <DataTable
                title="Cover Submissions"
                headers={submissionsDisplayHeaders}
                rows={(submissions || []).map(
                  ({ username, soundcloudUrl }) => ({
                    username,
                    // <Link href={`/profile/${username}`},
                    // </Link>
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
            <StackedBarChart
              data={convertVoteBreakdownToBarchartFormat(voteBreakdown)}
              title="Vote Breakdown Bar Chart"
            />
          </div>
        )}
        <div className="flex justify-between w-full">
          {navigation.previous ? (
            <a href={`/round/${navigation.previous}`}>
              <button className="btn-main">Round {navigation.previous}</button>
            </a>
          ): <div/>}
          {navigation.next ? (
            <a href={`/round/${navigation.next}`}>
              <button className="btn-main">Round {navigation.next}</button>
            </a>
          ): <></>}
        </div>
      </div>
    </>
  );
};

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

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const roundId = parseInt(params.id);
  const round = await roundProvider(roundId);
  
  return {
    title: `Round ${roundId} - ${round.song.title} by ${round.song.artist} | Everyone Plays the Same Song`,
    description: `Listen to community covers of "${round.song.title} by ${round.song.artist}" in Round ${roundId} of Everyone Plays the Same Song. Experience unique interpretations from our talented participants.`,
    openGraph: {
      title: `Round ${roundId} - ${round.song.title} by ${round.song.artist} | Everyone Plays the Same Song`,
      description: `Listen to community covers of "${round.song.title} by ${round.song.artist}" in Round ${roundId} of Everyone Plays the Same Song. Experience unique interpretations from our talented participants.`,
    },
  };
}
