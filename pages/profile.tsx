import {
  createBrowserSupabaseClient,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import { getSupabaseClient } from "utils/getSupabaseClient";

function ProfilePage({ pioneer }: { pioneer: string }) {
  return <div>{pioneer}</div>;
}

export async function getServerSideProps(ctx) {
  // Create authenticated Supabase Client
  const authClient = createServerSupabaseClient(ctx);
  const dbClient = getSupabaseClient();
  // Check if we have a session
  const {
    data: { session },
  } = await authClient.auth.getSession();

  const { data } = await dbClient
    .from("song_selection_votes")
    .select(
      `vote, round_id, song:vote_results (
        average,
        id
    )
    `
    )
    .filter("submitter_email", "eq", session?.user.email);

  console.log({ data });
  return {
    props: {
      pioneer: JSON.stringify(data, null, 4),
      notFound: process.env.NODE_ENV === "production",
    }, // will be passed to the page component as props
  };
}

export default ProfilePage;
