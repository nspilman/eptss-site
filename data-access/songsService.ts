"use server";

import { Views } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const getAllSongs = async ({
  roundIdToRemove = -1,
}: {
  roundIdToRemove: number;
}) => {
  const headerCookies = await cookies();
  const supabaseClient = await createClient(headerCookies);
  const { data: allSongsData } = await supabaseClient
    .from(Views.VoteResults)
    .select("artist, title, round_id, average, id, round_metadata(song_id)")
    .filter("round_id", "neq", roundIdToRemove);

  return (
    allSongsData?.map((song) => ({
      ...song,
      artist: song.artist || "",
      title: song.title || "",
      round_id: song.round_id || -1,
      average: song.average || 0,
      isWinningSong: !!((song.round_metadata as []) || []).length,
    })) || []
  );
};
