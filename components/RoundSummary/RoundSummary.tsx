import { Box, Button, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { DataTable } from "components/shared/DataTable";
import { PageContainer } from "components/shared/PageContainer";
import { StackedBarChart } from "components/shared/StackedBarChart";
import { Phase } from "services/PhaseMgmtService";

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
  next?: null;
  previous?: null;
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
  voteResults: VoteResults[];
  signupCount: number;
  signupData: SignupData[];
  phase: Phase | "Complete";
  roundId: number;
  metadata: RoundMetadata;
  submissions: { username: string; soundcloud_url: string }[];
  voteBreakdown: VoteBreakdown[];
  navigation: Navigation;
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

export const RoundSummary = ({
  voteResults,
  signupCount,
  signupData,
  phase,
  roundId,
  metadata: { artist, title, playlistUrl, submitter },
  submissions,
  voteBreakdown,
  navigation,
}: Props) => {
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
  const roundIsComplete = phase === "Complete";

  if (roundIsComplete) {
    roundSummaryHeaders.push(submissionCountHeader);
  }

  const roundSummary = [
    {
      signupCount: `${signupCount} signups`,
      phase: `Current phase: ${phase}`,
      submissionCount: `${submissions.length} submissions`,
    },
  ];

  const elementWidthsByBreakpoint = {
    base: "400px",
    sm: "600px",
    md: "800px",
    lg: "1000px",
  };

  const signupDataDisplay = signupData.map((signup) => ({
    youtubeLink: signup.youtube_link,
    title: signup.title,
    artist: signup.artist,
  }));

  const isVotingPhase = phase === "voting";
  return (
    <PageContainer title={`Round ${roundId} Info`}>
      <Stack alignItems="center">
        <Heading as="h1"> Round {roundId} Info</Heading>
        {!isVotingPhase && (
          <Heading size="sm">
            {title} by {artist}
          </Heading>
        )}
        <Box
          width={elementWidthsByBreakpoint}
          dangerouslySetInnerHTML={{ __html: playlistUrl }}
        />

        {phase === "Complete" && (
          <Text>
            Submitted by:{" "}
            <Link href={`/profile/${submitter}`}>{submitter}</Link>
          </Text>
        )}
        <DataTable headers={roundSummaryHeaders} rows={roundSummary} />
        <Box px="10">
          <DataTable
            headers={submissionsDisplayHeaders}
            rows={submissions.map(({ username, soundcloud_url }) => ({
              username: <Link href={`/profile/${username}`}>{username}</Link>,
              soundcloud_url: <Link href={soundcloud_url}>Link</Link>,
            }))}
          />
        </Box>

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
          <Box width={elementWidthsByBreakpoint} overflow="scroll">
            <StackedBarChart
              data={convertVoteBreakdownToBarchartFormat(voteBreakdown)}
              title="Vote Breakdown Bar Chart"
            />
          </Box>
        )}
        <Stack direction="row" justifyContent="space-between" width="100%">
          {navigation.previous && (
            <a href={`/round/${navigation.previous}`}>
              <Button size="sm">Round {navigation.previous}</Button>
            </a>
          )}
          {navigation.next && (
            <a href={`/round/${navigation.next}`}>
              <Button size="sm">Round {navigation.next}</Button>
            </a>
          )}
        </Stack>
      </Stack>
    </PageContainer>
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
