"use server";

import { db } from "../db";
import { songs, roundMetadata, songSelectionVotes } from "../db/schema";
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
      average: sql<number>`round(avg(${songSelectionVotes.vote}), 2)`.as('average'),
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

/**
 * Get multiple songs by their IDs
 * Used for retrieving voted songs in voting confirmation
 */
export const getSongsByIds = async (songIds: number[]) => {
  if (songIds.length === 0) return [];
  
  const result = await db
    .select({ 
      id: songs.id, 
      title: songs.title, 
      artist: songs.artist 
    })
    .from(songs)
    .where(sql`${songs.id} IN (${sql.join(songIds.map(id => sql`${id}`), sql`, `)})`)
    .execute();

  return result;
};

/**
 * Find a song by title and artist
 * Used for assigning winning songs to rounds
 */
export const getSongByTitleAndArtist = async (title: string, artist: string) => {
  const result = await db
    .select({ id: songs.id })
    .from(songs)
    .where(sql`${songs.title} = ${title} AND ${songs.artist} = ${artist}`)
    .limit(1);
  
  return result.length > 0 ? result[0].id : null;
};
