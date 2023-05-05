import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { PostgrestResponse } from "@supabase/supabase-js";
import { Profile, VoteSummary } from "components/Profile";
import { PageContainer } from "components/shared/PageContainer";
import { SignInGate } from "components/shared/SignInGate/SignInGate";
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
    round_id: number;
    title: string;
    artist: string;
    average: string;
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

  const { id, email } = session?.user || { id: null, email: null };
  const signups = (await getSignups(id || "")) || [];
  const voteSummary = (await getVotes(id || "")) || [];
  const submissions = (await getSubmissions(id || "")) || [];
  return {
    props: {
      voteSummary,
      profileSummary: { email },
      signups,
      submissions,
    }, // will be passed to the page component as props
  };
}

export default ProfilePage;

// Queries
const dbClient = getSupabaseClient();
const getWinningSongs = async () => {
  const { data } = await dbClient.from(Tables.RoundMetadata).select("song_id");
  return data;
};

const getSignups = async (id: string) => {
  const { data } = (await dbClient
    .from(Tables.SignUps)
    .select(
      `song_id, 
        round_id, 
         average:vote_results(
           average
         ),
        song:songs(
              title, 
              artist
            )`
    )
    .filter("user_id", "eq", id)) as PostgrestResponse<{
    round_id: number;
    song_id: number;
    song: {
      title: string;
      artist: string;
    };
    average: {
      average: string;
    };
  }>;

  const winningSongs = await getWinningSongs();
  return data?.map(
    ({ round_id, song_id, song: { title, artist }, average: { average } }) => ({
      round_id,
      title,
      artist,
      average,
      isWinningSong: winningSongs
        ?.map((song) => song.song_id)
        .includes(song_id)
        .toString(),
    })
  );
};

const getVotes = async (id: string) => {
  const { data } = await dbClient
    .from(Views.VotesDiffsWithAverage)
    .select("*")
    .filter("user_id", "eq", id);

  return (data || []).map((vote) => {
    return {
      ...vote,
      average: vote.average.toPrecision(3),
      delta: JSON.parse((vote.vote - vote.average).toPrecision(2)),
    };
  });
};

const getSubmissions = async (id: string) => {
  const { data } = await dbClient
    .from(Views.Submissions)
    .select("*")
    .filter("user_id", "eq", id);
  return data || [];
};
