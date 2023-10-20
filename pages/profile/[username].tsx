import { Heading } from "@chakra-ui/react";
import { TableContainer } from "@chakra-ui/table";
import { sharedHeaders } from "components/Profile/ProfileDisplay";
import { DataTable } from "components/shared/DataTable";
import { PageContainer } from "components/shared/PageContainer";
import { STATIC_REGEN_INTERVAL_SECONDS } from "consts";
import { Views } from "queries";
import { getSupabaseClient } from "utils/getSupabaseClient";

const dbClient = getSupabaseClient();

export async function getStaticPaths() {
  const { data } = await dbClient.from(Views.PublicSignups).select("username");

  const payload = {
    paths: data?.map(({ username }) => ({
      params: { username },
    })),
    fallback: false, // can also be true or 'blocking'
  };
  return payload;
}

// `getStaticPaths` requires using `getStaticProps`
export async function getStaticProps({
  params: { username },
}: {
  params: { username: string };
}) {
  const { data } = await dbClient
    .from(Views.PublicSubmissions)
    .select("*")
    .filter("username", "eq", username);

  return {
    // Passed to the page component as props
    props: {
      username,
      data,
    },
    revalidate: STATIC_REGEN_INTERVAL_SECONDS,
  };
}

export default function Profile(props: { username: string; data: any }) {
  const submissionHeaders = [
    ...sharedHeaders,
    { key: "soundcloud_url", display: "Soundcloud Link", sortable: true },
  ] as const;

  return (
    <PageContainer title={`${props.username}'s Profile`}>
      {props.data.length ? (
        <TableContainer>
          <DataTable
            title="Your Past Submissions"
            subtitle={`You have submitted on ${props.data.length} covers`}
            rows={props.data}
            headers={submissionHeaders}
          />
        </TableContainer>
      ) : (
        <Heading>This participant has yet to submit. Maybe next round!</Heading>
      )}
    </PageContainer>
  );
}
