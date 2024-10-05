import SpotifyWebApi from 'spotify-web-api-node';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types';
import readline from 'readline';

dotenv.config();

const args = process.argv.slice(2);
const roundId = args[0];

if (!roundId) {
  throw new Error("Round ID argument is required");
}

const clientId = process.env.SPOTIFY_API_CLIENT_ID
const clientSecret = process.env.SPOTIFY_API_CLIENT_SECRET;
const redirectUri = 'http://localhost:3000/callback';

const spotifyApi = new SpotifyWebApi({
  clientId,
  clientSecret,
  redirectUri,
});

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const scopes = [
    'playlist-modify-private',
    'playlist-modify-public',
    'user-read-private',
    'user-read-email'
  ];

const getAccessToken = async() => {
      const authUrl = spotifyApi.createAuthorizeURL(scopes, 'state');
  
      console.log('Authorize this app by visiting this url:', authUrl);
      console.log('After authorizing, you will get a code. Enter that code here:');
  
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      let wait = true;
      rl.question('Enter the code from that page here: ', async (code) => {
        rl.close();
        const data = await spotifyApi.authorizationCodeGrant(code as string);
        const { access_token, refresh_token } = data.body;
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);
        createPlaylist(spotifyApi)
      });
  }

  async function searchTrack(artistName: string, trackName: string) {
    try {
      const searchQuery = `track:${trackName} artist:${artistName}`;
      const response = await spotifyApi.searchTracks(searchQuery, { limit: 1 });
  
      if (response?.body?.tracks?.items?.length) {
        const track = response.body.tracks.items[0];
        return track.id;
      } else {
        console.log('No tracks found matching the search criteria.');
      }
    } catch (error) {
      console.error('Error occurred while searching for the track:', error);
      
      // If the error is due to an expired token, try refreshing it
      if (error.statusCode === 401) {
        console.log('Access token has expired. Attempting to refresh...');
        try {
          const data = await spotifyApi.refreshAccessToken();
          console.log('Access token has been refreshed.');
          spotifyApi.setAccessToken(data.body['access_token']);
          
          // Retry the search with the new token
          await searchTrack(artistName, trackName);
        } catch (refreshError) {
          console.error('Could not refresh access token:', refreshError);
        }
      }
    }
  }

async function createPlaylist(client: SpotifyWebApi) {
  const { data } = await supabase
    .from("sign_ups")
    .select(`song:songs(title, artist)`)
    .filter("round_id", "eq", roundId);

  const songs = await data?.map((field) =>  field.song) || [];
  const spotifyUrls = await Promise.all(songs.map((song) => searchTrack(song?.artist || "", song?.title || "")));
//   const playlistName = `Everyone Plays the Same Song - Round ${roundId} Cover Candidates`;
const playlistName = "WE OUT HERE";

  try {
    const me = await client.getMe();
    const userId = me.body.id;

    const playlist = await client.createPlaylist(playlistName, { public: false });
    const playlistId = playlist.body.id;

    for (const trackId of spotifyUrls) {
        
      console.log({trackId})
      if (await trackId) {
        await spotifyApi.addTracksToPlaylist(playlistId, [`spotify:track:${trackId}`]);
        console.log(`Added track ${trackId} to playlist`);
      }
    }

    console.log('Playlist creation completed.');
  } catch (error) {
    console.error('Error:', error);
  }
}

function getSpotifyTrackId(url: string): string | null {
  const match = url.match(/\/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

async function main() {
  const client = await getAccessToken();
//   await createPlaylist(client);
}

main().catch(console.error);