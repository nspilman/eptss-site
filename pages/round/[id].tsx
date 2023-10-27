import {
  Navigation,
  RoundMetadata,
  RoundSummary,
  SignupData,
  VoteBreakdown,
  VoteResults,
} from "components/RoundSummary";
import { PageContainer } from "components/shared/PageContainer";
import { STATIC_REGEN_INTERVAL_SECONDS } from "consts";
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
  const roundId = parseInt(idString);
  const voteResults = await getVoteResults(roundId);
  const signupData = await getSignupData(roundId);
  const signupCount = signupData?.length || 0;
  const { roundId: currentRoundId, phase: currentPhase } =
    await PhaseMgmtService.build();
  const metadata = await getRoundMetadata(roundId);
  const submissions = await getSubmissions(roundId);
  const voteBreakdown = await getVoteBreakdownBySong(roundId);

  const navigation = {
    previous: roundId !== 0 ? roundId - 1 : null,
    next: roundId !== currentRoundId ? roundId + 1 : null,
  };

  return {
    // Passed to the page component as props
    props: {
      roundId,
      voteResults,
      signupCount,
      signupData,
      phase: currentRoundId === roundId ? currentPhase : "Complete",
      metadata,
      submissions,
      voteBreakdown,
      navigation,
    },
    revalidate: STATIC_REGEN_INTERVAL_SECONDS,
  };
}

export default function Post(props: {
  roundId: number;
  signupCount: number;
  voteResults: VoteResults[];
  signupData: SignupData[];
  phase: Phase | "Complete";
  metadata: RoundMetadata;
  submissions: { username: string; soundcloud_url: string }[];
  voteBreakdown: VoteBreakdown[];
  navigation: Navigation;
}) {
  return (
    <PageContainer title={`Round ${props.roundId} Overview`}>
      <RoundSummary {...props} />
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

const getSignupData = async (id: number) => {
  const { data } = await dbClient
    .from(Views.Signups)
    .select(
      `youtube_link,
      title,
      artist`
    )
    .filter("round_id", "eq", id);
  return data;
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
    .from(Views.Signups)
    .select("username")
    .filter("title", "eq", roundInfo.song.title)
    .filter("artist", "eq", roundInfo.song.artist)
    .filter("round_id", "eq", roundInfo.id)) as {
    data: {
      username: string;
    }[];
  };

  return {
    playlistUrl: roundInfo.playlist_url,
    title: roundInfo.song?.title || "",
    artist: roundInfo.song?.artist || "",
    submitter: submitterInfo ? submitterInfo[0].username : "",
  };
};

const getSubmissions = async (id: number) => {
  const { data } = await dbClient
    .from(Views.PublicSubmissions)
    .select("*")
    .filter("round_id", "eq", id);
  return data;
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
