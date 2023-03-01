import {
  Navigation,
  RoundMetadata,
  RoundSummary,
  VoteBreakdown,
  VoteResults,
} from "components/RoundSummary/RoundSummary";
import { PageContainer } from "components/shared/PageContainer";
import { Tables, Views } from "queries";
import { Phase, PhaseMgmtService } from "services/PhaseMgmtService";
import { getSupabaseClient } from "utils/getSupabaseClient";

const dbClient = getSupabaseClient();

export async function getStaticPaths() {
  const { data: roundIds } = await dbClient
    .from(Tables.RoundMetadata)
    .select("id");
  const { roundId: currentRoundId, phase: currentPhase } =
    await PhaseMgmtService.build();
  const payload = {
    paths: roundIds
      ?.filter(({ id }) => {
        return !(id === currentRoundId && currentPhase === "signups");
      })
      .map(({ id }) => ({
        params: { id: id.toString() },
      })),
    fallback: false, // can also be true or 'blocking'
  };
  return payload;
}

// `getStaticPaths` requires using `getStaticProps`
export async function getStaticProps({
  params: { id: idString },
}: {
  params: { id: string };
}) {
  const id = parseInt(idString);
  const voteResults = await getVoteResults(id);
  const signupCount = await getSignupCount(id);
  const { roundId: currentRoundId, phase: currentPhase } =
    await PhaseMgmtService.build();
  const metadata = await getRoundMetadata(id);
  const submissionCount = await getSubmissionCount(id);
  const voteBreakdown = await getVoteBreakdownBySong(id);

  const navigation = {
    previous: id !== 0 ? id - 1 : null,
    next: id !== currentRoundId ? id + 1 : null,
  };

  return {
    // Passed to the page component as props
    props: {
      id,
      voteResults,
      signupCount,
      phase: currentRoundId === id ? currentPhase : "Complete",
      metadata,
      submissionCount,
      voteBreakdown,
      navigation,
    },
  };
}

export default function Post({
  voteResults,
  id,
  signupCount,
  phase,
  metadata,
  submissionCount,
  voteBreakdown,
  navigation,
}: {
  id: number;
  signupCount: number;
  voteResults: VoteResults[];
  phase: Phase | "Complete";
  metadata: RoundMetadata;
  submissionCount: number;
  voteBreakdown: VoteBreakdown[];
  navigation: Navigation;
}) {
  return (
    <PageContainer title={`Round ${id} Overview`}>
      <RoundSummary
        voteResults={voteResults}
        signupCount={signupCount}
        phase={phase}
        roundId={id}
        metadata={metadata}
        submissionCount={submissionCount}
        voteBreakdown={voteBreakdown}
        navigation={navigation}
      />
    </PageContainer>
  );
}

const getVoteResults = async (id: number) => {
  const { data: voteResults } = await dbClient
    .from(Views.VoteResults)
    .select("title, artist, average")
    .filter("round_id", "eq", id);

  return voteResults?.map((result) => ({
    ...result,
    average: result.average.toPrecision(3),
  }));
};

const getSignupCount = async (id: number) => {
  const { data } = await dbClient
    .from(Tables.SignUps)
    .select("email")
    .filter("round_id", "eq", id);
  return data?.reduce((prev: string[], curr) => {
    return prev.includes(curr.email) ? prev : [...prev, curr.email];
  }, []).length;
};

const getRoundMetadata = async (id: number) => {
  const { data } = (await dbClient
    .from(Tables.RoundMetadata)
    .select(
      `playlist_url,
        id,
        song_id, 
        song:songs(artist, title)`
    )
    .filter("id", "eq", id)) as {
    data: {
      playlist_url: string;
      song_id: number;
      id: number;
      song: {
        title: string;
        artist: string;
      };
    }[];
  };

  const roundInfo = data[0];
  const { data: submitterInfo } = (await dbClient
    .from(Tables.SignUps)
    .select("name")
    .filter("song_id", "eq", roundInfo.song_id)
    .filter("round_id", "eq", roundInfo.id)) as {
    data: {
      name: string;
    }[];
  };
  return {
    playlistUrl: roundInfo.playlist_url,
    title: roundInfo.song?.title || "",
    artist: roundInfo.song?.artist || "",
    submitter: submitterInfo ? submitterInfo[0].name : "",
  };
};

const getSubmissionCount = async (id: number) => {
  const { data } = await dbClient
    .from(Views.Submissions)
    .select("*")
    .filter("round_id", "eq", id);
  return data?.length || 0;
};

const getVoteBreakdownBySong = async (id: number) => {
  const { data } = (await dbClient
    .from(Views.VoteBreakdownBySong)
    .select()
    .filter("round_id", "eq", id)) as {
    data: {
      title: string;
      artist: string;
      one_count: string;
      two_count: string;
      three_count: string;
      four_count: string;
      five_count: string;
    }[];
  };

  return data?.map(
    ({
      title,
      artist,
      one_count,
      two_count,
      three_count,
      four_count,
      five_count,
    }) => ({
      title,
      artist,
      oneCount: one_count,
      twoCount: two_count,
      threeCount: three_count,
      fourCount: four_count,
      fiveCount: five_count,
    })
  );
};
