import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";
import { withSentry } from "@sentry/nextjs";
import { DataTable } from "components/shared/DataTable";
import { Loading } from "components/shared/Loading";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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

export interface ApiResponse {
  voteSummary: VoteSummary[];
  submissions: {
    round_id: number;
    title: string;
    artist: string;
    soundcloud_url: string;
  }[];
  signups: {
    round_id: number;
    title: string;
    artist: string;
    average: string;
    isWinningSong: string;
  }[];
}

interface Props {
  profileSummary: {
    email: string;
  };
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
  { key: "delta", display: "Delta", sortable: true },
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

export const Profile = ({ profileSummary: { email } }: Props) => {
  const [profileData, setProfileData] = useState<ApiResponse>();
  useEffect(() => {
    const getProfileData = async () => {
      const data = await fetch("/api/profile");
      if (data.ok) {
        setProfileData((await data.json()) as ApiResponse);
      } else {
        new Error("Error occurred fetching Profile");
      }
    };
    getProfileData();
  });
  const router = useRouter();

  const maxHeight = 400;
  if (!profileData) {
    return <Loading />;
  }

  const { signups, voteSummary, submissions } = profileData;

  const hasNoRecords = !signups.length;
  const roundSignupsCount = [
    //@ts-ignore - it doesn't like me spreading the set for some reason
    // this is done cuz early rounds allowed multiple signups, so I'm counting unique round IDs
    ...new Set(signups.map((signup) => signup.round_id)),
  ].length;

  return (
    <Stack
      direction="column"
      spacing="6"
      backgroundColor="bgTransparent"
      p="4"
      borderRadius="md"
    >
      <Heading>{email}</Heading>
      {hasNoRecords ? (
        <Stack p="20" borderRadius="md" alignItems="center">
          <Heading size="md" py="4">
            Welome to Everyone Plays the Same Song!
          </Heading>
          <Text textAlign="center">
            {`We're excited that you're here, and can't wait to hear your music! You'll receive an email when sign ups for the next round are open. In the meantime, check out past rounds!`}
          </Text>
          <Text></Text>
          <Button onClick={() => router.push("/#rounds")}> Rounds </Button>
        </Stack>
      ) : (
        <>
          <TableContainer>
            <DataTable
              title="Your Past Signups"
              rows={signups}
              headers={signupHeaders}
              subtitle={`You signed up for ${roundSignupsCount} rounds`}
              maxHeight={maxHeight}
            />
          </TableContainer>
          <TableContainer>
            <DataTable
              title="Your Vote Summary"
              subtitle={`You have voted on ${voteSummary.length} songs`}
              rows={voteSummary}
              headers={headers}
              maxHeight={maxHeight}
            />
          </TableContainer>
          <TableContainer>
            <DataTable
              title="Your Past Submissions"
              subtitle={`You have submitted on ${submissions.length} covers`}
              rows={submissions}
              headers={submissionHeaders}
              maxHeight={maxHeight}
            />
          </TableContainer>
        </>
      )}
    </Stack>
  );
};
const TableContainer = ({ children }: { children: React.ReactElement }) => (
  <Box borderRadius="md" py="4">
    {children}
  </Box>
);
