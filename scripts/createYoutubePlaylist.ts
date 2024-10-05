import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import readline from 'readline';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types'
import { seededShuffle } from '@/utils/seededShuffle';

dotenv.config();

const args = process.argv.slice(2);
const roundId = args[0]

if(!roundId) {
    throw new Error("Round ID argument is required")
}

const clientId = process.env.GOOGLE_API_CLIENT_ID;
const clientSecret = process.env.GOOGLE_API_CLIENT_SECRET;

const redirectUri = 'urn:ietf:wg:oauth:2.0:oob';

const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

const scopes = ['https://www.googleapis.com/auth/youtube.force-ssl'];
const client = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getAccessToken(): Promise<string> {
    return new Promise((resolve) => {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
      });
  
      console.log('Authorize this app by visiting this url:', authUrl);
      console.log('After authorizing, you will get a code. Enter that code here:');
  
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
  
      rl.question('Enter the code from that page here: ', async (code) => {
        rl.close();
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        resolve(tokens.access_token as string);
      });
    });
  }
  
  async function createPlaylist() {

    const {data} = await client.from("sign_ups").select(`*`).filter("round_id", "eq", roundId)
    .order("created_at");
    const unsortedUrls = data?.map(field => field.youtube_link) || [];
    const sortedData = seededShuffle(data || [], JSON.stringify(unsortedUrls));
    const urls = sortedData.map(field => field.youtube_link)
    console.log({sortedData, urls})
    
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
      const title = `Everyone Plays the Same Song - Round ${roundId} Cover Candidates`
    try {
      const playlist = await youtube.playlists.insert({
        part: ['snippet,status'],
        requestBody: {
          snippet: { title, description: 'Created via API' },
          status: { privacyStatus: 'private' }
        }
      });
  
  
      for (const url of urls) {
        console.log({url})
        const videoId = getYouTubeVideoId(url);
        await youtube.playlistItems.insert({
          part: ['snippet'],
          requestBody: {
            snippet: {
              playlistId: playlist.data.id,
              resourceId: { kind: 'youtube#video', videoId }
            }
          }
        });
        console.log(`Added video ${videoId} to playlist`);
      }
  
      console.log('Playlist creation completed.');
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  async function main() {
   await getAccessToken();
    await createPlaylist();
  }
  
  main().catch(console.error);

  function getYouTubeVideoId(url: string) {
    if (typeof url !== 'string') return null;
  
    // Regular expressions for different YouTube URL formats
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/i,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/i,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/i,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i
    ];
  
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
  
    return null;
  }