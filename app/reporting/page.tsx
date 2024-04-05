import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Views } from "@/data-access";
import React from "react";
import { roundProvider } from "@/providers/roundProvider";
import { Reporting } from "./Reporting";

const ReportingPage = async () => {
  const headerCookies = await cookies();
  const supabase = await createClient(headerCookies);
  const { roundId, phase } = await roundProvider();
  const roundIdToRemove = ["signups", "voting"].includes(phase) ? roundId : -1;
  const { data: allSongsData } = await supabase
    .from(Views.VoteResults)
    .select("artist, title, round_id, average, id, round_metadata(song_id)")
    .filter("round_id", "neq", roundIdToRemove);

  return (
    <Reporting
      allSongsData={
        allSongsData?.map((song) => ({
          ...song,
          artist: song.artist || "",
          title: song.title || "",
          round_id: song.round_id || -1,
          average: song.average || 0,
          isWinningSong: !!((song.round_metadata as []) || []).length,
        })) || []
      }
    />
  );
};

export default ReportingPage;
