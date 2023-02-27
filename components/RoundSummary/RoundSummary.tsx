import { Box, Flex, Heading, Stack } from "@chakra-ui/react";
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
  phase: Phase | "Complete";
  roundId: number;
  metadata: RoundMetadata;
  submissionCount: number;
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

export const RoundSummary = ({
  voteResults,
  signupCount,
  phase,
  roundId,
  metadata: { artist, title, playlistUrl, submitter },
  submissionCount,
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
      submissionCount: `${submissionCount} submissions`,
    },
  ];

  const elementWidthsByBreakpoint = {
    base: "400px",
    sm: "600px",
    md: "800px",
    lg: "1000px",
  };

  return (
    <PageContainer title={`Round ${roundId} Info`}>
      <Stack alignItems="center">
        <Heading as="h1"> Round {roundId} Info</Heading>
        <h2>
          {title} by {artist}
        </h2>
        {phase === "Complete" && <span>Submitted by: {submitter}</span>}
        <DataTable headers={roundSummaryHeaders} rows={roundSummary} />
        <Box
          width={elementWidthsByBreakpoint}
          dangerouslySetInnerHTML={{ __html: playlistUrl }}
        />
        <DataTable
          title={"Voting breakdown"}
          headers={voteResultsHeaders}
          rows={voteResults}
        />
        <Box width={elementWidthsByBreakpoint} overflow="scroll">
          <StackedBarChart
            data={convertVoteBreakdownToBarchartFormat(voteBreakdown)}
          />
        </Box>
        <Stack direction="row" justifyContent="space-between">
          {navigation.previous && (
            <a href={`/round/${navigation.previous}`}>
              <button>Round {navigation.previous}</button>
            </a>
          )}
          {navigation.next && (
            <a href={`/round/${navigation.next}`}>
              <button>Round {navigation.next}</button>
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
