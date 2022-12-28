import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { PostgrestResponse } from "@supabase/supabase-js";
import { Profile, VoteSummary } from "components/Profile";
import { PageContainer } from "components/shared/PageContainer";
import { SignInGate } from "components/SignInGate/SignInGate";
import { GetServerSidePropsContext } from "next";
import { Tables, Views } from "queries";
import { getSupabaseClient } from "utils/getSupabaseClient";

function ProfilePage({
  voteSummary,
  profileSummary,
  signups,
  submissions,
}: {
  voteSummary: VoteSummary[];
  profileSummary: { email: string };
  submissions: {
    round_id: number;
    title: string;
    artist: string;
    soundcloud_url: string;
  }[];
  signups: {
    roundId: number;
    title: string;
    artist: string;
    isWinningSong: string;
  }[];
}) {
  return (
    <PageContainer title="Profile">
      <SignInGate>
        <Profile
          voteSummary={voteSummary}
          profileSummary={profileSummary}
          signups={signups}
          submissions={submissions}
        />
      </SignInGate>
    </PageContainer>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  // Create authenticated Supabase Client
  const authClient = createServerSupabaseClient(ctx);
  // Check if we have a session
  const {
    data: { session },
  } = await authClient.auth.getSession();

  const { email } = session?.user || { email: null };
  const signups = await getSignups(email || "");
  const voteSummary = await getVotes(email || "");
  const submissions = await getSubmissions(email || "");
  return {
    props: {
      voteSummary,
      profileSummary: { email },
      signups,
      submissions,
    }, // will be passed to the page component as props
    notFound: process.env.NODE_ENV === "production",
  };
}

export default ProfilePage;

// Queries
const dbClient = getSupabaseClient();
const getWinningSongs = async () => {
  const { data } = await dbClient.from(Tables.RoundMetadata).select("song_id");
  return data;
};

const getSignups = async (email: string) => {
  const { data } = (await dbClient
    .from(Tables.SignUps)
    .select(
      `song_id, 
            round_id, 
            song:songs(
                title, 
                artist
            )`
    )
    .filter("email", "eq", email)) as PostgrestResponse<{
    round_id: number;
    song_id: number;
    song: {
      title: string;
      artist: string;
    };
  }>;

  const winningSongs = await getWinningSongs();
  return data?.map(({ round_id, song_id, song: { title, artist } }) => ({
    roundId: round_id,
    title,
    artist,
    isWinningSong: winningSongs
      ?.map((song) => song.song_id)
      .includes(song_id)
      .toString(),
  }));
};

const getVotes = async (email: string) => {
  const { data } = await dbClient
    .from(Views.VotesDiffsWithAverage)
    .select("*")
    .filter("email", "eq", email);

  return data?.map((vote) => {
    return {
      ...vote,
      average: vote.average.toPrecision(3),
      delta: JSON.parse((vote.vote - vote.average).toPrecision(2)),
    };
  });
};

const getSubmissions = async (email: string) => {
  const { data } = await dbClient
    .from(Views.Submissions)
    .select("*")
    .filter("email", "eq", email);
  return data;
};
