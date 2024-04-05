import { Tables, Views } from "@/data-access";
import { roundProvider } from "@/providers/roundProvider";
import Link from "next/link";
import { DataTable } from "@/components/DataTable";
import { PageTitle } from "@/components/PageTitle";
import { StackedBarChart } from "@/app/round/[id]/StackedBarChart";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { roundService } from "@/data-access/roundService";

const getDbClient = async () => {
  const headerCookies = await cookies();
  return await createClient(headerCookies);
};

export default async function Round({ params }: { params: { id: string } }) {
  return (
    <>
      <PageTitle title={`Round ${params.id} Overview`} />
      <RoundSummary roundId={JSON.parse(params.id)} />
    </>
  );
}

const getVoteResults = async (id: number) => {
  const dbClient = await getDbClient();

  const { data: voteResults } = await dbClient
    .from(Views.VoteResults)
    .select("title, artist, average")
    .filter("round_id", "eq", id);

  return (
    voteResults?.map((result) => ({
      title: result.title || "",
      artist: result.artist || "",
      average: JSON.parse(result.average?.toPrecision(3) || "0"),
    })) || []
  );
};

const getSignupData = async (id: number) => {
  const dbClient = await getDbClient();

  const { data } = await dbClient
    .from(Views.Signups)
    .select(
      `youtube_link,
      title,
      artist`
    )
    .filter("round_id", "eq", id);
  return data?.map((val) => ({
    youtube_link: val.youtube_link || "",
    artist: val.artist || "",
    title: val.title || "",
  }));
};

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
    display: "Title",
  },
  { key: "artist", display: "Artist" },
  { key: "average", display: "Average Vote" },
] as const;

const signupsHeaders = [
  {
    key: "title",
    display: "Title",
  },
  { key: "artist", display: "Artist" },
  { key: "youtubeLink", display: "Youtube Link" },
] as const;

const RoundSummary = async ({ roundId }: Props) => {
  const voteResults = await getVoteResults(roundId);
  const signupData = (await getSignupData(roundId)) || [];
  const round = await roundService.getRoundById(roundId);
  const { phase } = await roundProvider(round);

  const signupCount = signupData?.length || 0;
  const submissions = await roundService.getSubmissions(roundId);
  const voteBreakdown = await roundService.getVoteBreakdownBySong(roundId);

  const dbClient = await getDbClient();

  const { data: roundIds } = await dbClient
    .from(Tables.RoundMetadata)
    .select("id")
    .lt("covering_begins", new Date().toDateString());

  const navigation = {
    previous: roundId !== 0 ? roundId - 1 : undefined,
    next: roundIds?.map((val) => val.id).includes(roundId + 1)
      ? roundId + 1
      : undefined,
  };

  const props = {
    voteResults,
    signupCount,
    signupData,
    phase,
    roundId,
    voteBreakdown,
    navigation,
    submissions,
  };

  const { song, playlistUrl } = round || {};

  const roundSummaryHeaders: {
    display: string;
    key: "phase" | "signupCount" | "submissionCount";
  }[] = [
    {
      display: "Current Phase",
      key: "phase" as const,
    },
    {
      display: "Signup Count",
      key: "signupCount" as const,
    },
  ];

  const submissionsDisplayHeaders: {
    display: string;
    key: "soundcloud_url" | "username";
  }[] = [
    {
      display: "Username",
      key: "username",
    },
    {
      display: "Submission",
      key: "soundcloud_url",
    },
  ];

  const submissionCountHeader = {
    display: "Submission Count",
    key: "submissionCount" as const,
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

  const signupDataDisplay = signupData.map((signup) => ({
    youtubeLink: signup.youtube_link,
    title: signup.title,
    artist: signup.artist,
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
                  ({ username, soundcloud_url }) => ({
                    username,
                    // <Link href={`/profile/${username}`},
                    // </Link>
                    soundcloud_url: <Link href={soundcloud_url}>Link</Link>,
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
            {/* <StackedBarChart
              data={convertVoteBreakdownToBarchartFormat(voteBreakdown)}
              title="Vote Breakdown Bar Chart"
            /> */}
          </div>
        )}
        <div className="flex justify-between w-full">
          {navigation.previous && (
            <a href={`/round/${navigation.previous}`}>
              <button className="btn-main">Round {navigation.previous}</button>
            </a>
          )}
          {navigation.next && (
            <a href={`/round/${navigation.next}`}>
              <button className="btn-main">Round {navigation.next}</button>
            </a>
          )}
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
