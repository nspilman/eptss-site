// pages/api/playlist.ts

import { NextApiRequest, NextApiResponse } from "next";
import { Tables } from "queries";
import { getCurrentRound } from "services/PhaseMgmtService";
import SpotifyWebApi from "spotify-web-api-node";
import { getSupabaseClient } from "utils/getSupabaseClient";

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_SECRET;
// const userId = "your-spotify-user-id";
const playlistName = "My New Playlist";

console.log({ clientId, clientSecret });

const spotifyApi = new SpotifyWebApi({
  clientId,
  clientSecret,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body["access_token"]);
    console.log({ data, spotifyApi });

    const currentRound = await getCurrentRound();
    const supabase = getSupabaseClient();

    const { data: songs } = (await supabase
      .from(Tables.SignUps)
      .select("songs(title, artist)")
      .filter("round_id", "eq", currentRound.roundId)) as unknown as {
      data: {
        songs: { title: string; artist: string };
      }[];
    };

    const songsWithArtists = songs?.map(({ songs }) => ({
      song: songs?.title,
      artist: songs?.artist,
    }));

    const playlist = await spotifyApi.createPlaylist(playlistName, {
      public: true,
    });

    const trackIds: string[] = [];

    for (const { song, artist } of songsWithArtists) {
      const result = await spotifyApi.searchTracks(
        `track:${song} artist:${artist}`
      );
      const items = result.body.tracks?.items;
      if (items?.length) {
        trackIds.push(items[0].uri);
      }
    }

    await spotifyApi.addTracksToPlaylist(playlist.body.id, trackIds);

    return res.status(200).json({ success: true, data: playlist.body });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}
