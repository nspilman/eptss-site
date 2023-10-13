import { TableContainer } from "@chakra-ui/table";
import { DataTable } from "components/shared/DataTable";
import { PageContainer } from "components/shared/PageContainer";
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
  };
}

export default function Profile(props: { username: string; data: any }) {
  const sharedHeaders = [
    { key: "round_id", display: "Round", sortable: true },
    { key: "title", display: "Title", sortable: true },
    {
      key: "artist",
      display: "Artist",
      sortable: true,
    },
  ] as const;

  const submissionHeaders = [
    ...sharedHeaders,
    { key: "soundcloud_url", display: "Soundcloud Link", sortable: true },
  ] as const;

  return (
    <PageContainer title={`${props.username}'s Profile`}>
      <TableContainer>
        <DataTable
          title="Your Past Submissions"
          subtitle={`You have submitted on ${props.data.length} covers`}
          rows={props.data}
          headers={submissionHeaders}
          //   maxHeight={maxHeight}
        />
      </TableContainer>
    </PageContainer>
  );
}
