import { Box, Heading, Stack } from "@chakra-ui/react";
import { DataTable } from "components/shared/DataTable";

export interface VoteSummary {
  artist: string;
  title: string;
  average: number;
  id: number;
  round_id: number;
  email: string;
  vote: number;
  delta: number;
}

export interface SignUp {
  song: {
    title: string;
    artist: string;
  };
  roundId: number;
  averageVote: number;
}

interface Props {
  voteSummary: VoteSummary[];
  profileSummary: {
    email: string;
  };
  signups: {
    round_id: number;
    title: string;
    artist: string;
    average: string;
    isWinningSong: string;
  }[];
  submissions: {
    round_id: number;
    title: string;
    artist: string;
    soundcloud_url: string;
  }[];
}

const sharedHeaders = [
  { key: "round_id", display: "Round", sortable: true },
  { key: "title", display: "Title", sortable: true },
  {
    key: "artist",
    display: "Artist",
    sortable: true,
  },
] as const;

const headers = [
  ...sharedHeaders,
  { key: "average", display: "Average Vote", sortable: true },
  { key: "vote", display: "Your Vote", sortable: true },
  { key: "delta", display: "Delta from Average", sortable: true },
] as const;

const signupHeaders = [
  ...sharedHeaders,
  { key: "average", display: "Average Vote", sortable: true },
  { key: "isWinningSong", display: "covered?", sortable: true },
] as const;

const submissionHeaders = [
  ...sharedHeaders,
  { key: "soundcloud_url", display: "Soundcloud Link", sortable: true },
] as const;

export const Profile = ({
  voteSummary,
  profileSummary: { email },
  signups,
  submissions,
}: Props) => {
  console.log({ email });
  return (
    <Stack direction="column" spacing="6">
      <Heading>{email}</Heading>

      <Box borderRadius="md">
        <DataTable
          title="Your Past Signups"
          rows={signups}
          headers={signupHeaders}
        />
      </Box>

      <Box borderRadius="md">
        <DataTable
          title="Your Past Submissions"
          rows={submissions}
          headers={submissionHeaders}
        />
      </Box>
      <Box borderRadius="md">
        <DataTable
          title="Your Vote Summary"
          rows={voteSummary}
          headers={headers}
        />
      </Box>
    </Stack>
  );
};
