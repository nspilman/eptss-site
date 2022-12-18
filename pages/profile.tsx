import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Profile, VoteSummary } from "components/Profile";
import { PageContainer } from "components/shared/PageContainer";
import { getSupabaseClient } from "utils/getSupabaseClient";

function ProfilePage({
  voteSummary,
  profileSummary,
}: {
  voteSummary: VoteSummary[];
  profileSummary: { email: string };
}) {
  return (
    <PageContainer title="Profile">
      <Profile voteSummary={voteSummary} profileSummary={profileSummary} />
    </PageContainer>
  );
}

export async function getServerSideProps(ctx) {
  // Create authenticated Supabase Client
  const authClient = createServerSupabaseClient(ctx);
  const dbClient = getSupabaseClient();
  // Check if we have a session
  const {
    data: { session },
  } = await authClient.auth.getSession();

  const { email } = session?.user || {};

  const { data } = await dbClient
    .from("votes_diff_with_average")
    .select("*")
    .filter("email", "eq", email);

  const voteSummary = data?.map((vote) => {
    return {
      ...vote,
      average: vote.average.toPrecision(3),
      delta: (vote.vote - vote.average).toPrecision(2),
    };
  });
  return {
    props: {
      voteSummary,
      profileSummary: { email },
      notFound: process.env.NODE_ENV === "production",
    }, // will be passed to the page component as props
  };
}

export default ProfilePage;
