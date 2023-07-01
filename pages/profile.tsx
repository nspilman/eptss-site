import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Profile } from "components/Profile";
import { PageContainer } from "components/shared/PageContainer";
import { SignInGate } from "components/shared/SignInGate/SignInGate";
import { GetServerSidePropsContext } from "next";

function ProfilePage({
  profileSummary,
}: {
  profileSummary: { email: string; id: string };
}) {
  return (
    <PageContainer title="Profile">
      <SignInGate>
        <Profile profileSummary={profileSummary} />
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
  return {
    props: {
      profileSummary: { email },
    },
  };
}

export default ProfilePage;
