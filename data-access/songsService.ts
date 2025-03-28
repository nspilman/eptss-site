"use server";

import { db } from "@/db";
import { songs, roundMetadata, songSelectionVotes } from "@/db/schema";
import { sql } from "drizzle-orm";

export const getAllSongs = async ({
  roundIdToRemove = -1,
}: {
  roundIdToRemove: number;
}) => {
  const allSongsData = await db
    .select({
      id: songs.id,
      artist: songs.artist,
      title: songs.title,
      round_id: songSelectionVotes.roundId,
      average: sql<number>`avg(${songSelectionVotes.vote})`.as('average'),
      round_metadata: sql<boolean>`
        case when ${roundMetadata.songId} is not null then true else false end
      `.as('is_winning_song'),
    })
    .from(songs)
    .leftJoin(
      songSelectionVotes,
      sql`${songSelectionVotes.songId} = ${songs.id}`
    )
    .leftJoin(
      roundMetadata,
      sql`${roundMetadata.songId} = ${songs.id}`
    )
    .where(sql`${songSelectionVotes.roundId} != ${roundIdToRemove}`)
    .groupBy(songs.id, songs.artist, songs.title, songSelectionVotes.roundId, roundMetadata.songId);

  return allSongsData.map((song) => ({
    ...song,
    artist: song.artist || "",
    title: song.title || "",
    round_id: song.round_id || -1,
    average: song.average || 0,
    isWinningSong: song.round_metadata || false,
  }));
};
