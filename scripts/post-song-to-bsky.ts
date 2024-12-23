import { BskyAgent } from '@atproto/api';

async function createRandomSongPost(submissions: any[]): Promise<{
    text: string,
    embed: {
        $type: string,
        external: {
            uri: string,
            title: string,
            description: string
        }
    }
}> {
    if (!submissions.length) {
        throw new Error('No submissions available');
    }

    const randomIndex = Math.floor(Math.random() * submissions.length);
    const song = submissions[randomIndex];

    const text = [
        `🎵 Check out this cover of "${song.title}" by ${song.artist}!`,
        '',
        `It's from Round ${song.round_id} of Everyone Plays the Same Song, where musicians around the world cover the same track.`,
        '',
        '#EveryonePlaysTheSameSong #MusicCover'
    ].join('\n');

    return {
        text,
        embed: {
            $type: 'app.bsky.embed.external',
            external: {
                uri: song.soundcloud_url,
                title: `${song.title} (Cover)`,
                description: `A cover of ${song.artist}'s "${song.title}" for Everyone Plays the Same Song Round ${song.round_id}`
            }
        }
    };
}

async function main() {
    console.log({env: process.env})
    if (!process.env.BLUESKY_USERNAME || !process.env.BLUESKY_PASSWORD) {
        throw new Error('Missing Bluesky credentials in environment variables');
    }

    const agent = new BskyAgent({
        service: 'https://bsky.social'
    });

    try {
        // Login to Bluesky
        await agent.login({
            identifier: process.env.BLUESKY_USERNAME,
            password: process.env.BLUESKY_PASSWORD
        });

        console.log('Successfully logged in to Bluesky');

        // Get songs from JSON
        const songsToPost = require('./songs-to-post.json');
        
        // Create and post the update
        const post = await createRandomSongPost(songsToPost);
        await agent.post(post);
        
        console.log('Successfully posted to Bluesky!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});