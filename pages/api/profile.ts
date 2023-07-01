import { PostgrestResponse } from "@supabase/supabase-js";
import { ApiResponse } from "components/Profile";
import type { NextApiRequest, NextApiResponse } from "next";
import { Tables, Views } from "queries";
import { PhaseMgmtService } from "services/PhaseMgmtService";
import { getSupabaseClient } from "utils/getSupabaseClient";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse | { errorMessage: string }>
) {
  const supabase = createServerSupabaseClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const id = session?.user?.id;
  if (!id) {
    res.status(401);
    return;
  }
  try {
    const voteSummary = await getVotes(id);
    const signups = (await getSignups(id)) || [];
    const submissions = await getSubmissions(id);
    res.status(200).send({
      voteSummary,
      signups,
      submissions,
    });
  } catch (e) {
    res.status(500).json({ errorMessage: (e as Error).message });
  }
}

const dbClient = getSupabaseClient();
const getWinningSongs = async () => {
  const { data } = await dbClient.from(Tables.RoundMetadata).select("song_id");
  return data;
};

const getSignups = async (id: string) => {
  const phaseMgmtService = await PhaseMgmtService.build();
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
    .filter("user_id", "eq", id)
    .order("round_id", { ascending: false })) as PostgrestResponse<{
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
  return data
    ?.filter((song) => {
      if (
        phaseMgmtService.phase == "signups" ||
        phaseMgmtService.phase === "voting"
      ) {
        return song.round_id !== phaseMgmtService.roundId;
      }
      return true;
    })
    .map(({ round_id, song_id, song: { title, artist }, average }) => ({
      round_id,
      title,
      artist,
      average: average?.average || "0",
      isWinningSong:
        winningSongs
          ?.map((song) => song.song_id)
          .includes(song_id)
          .toString() || "false",
    }));
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
