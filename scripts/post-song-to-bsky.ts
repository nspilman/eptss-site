import { Database, Tables, Views } from '@/types';
import { createClient } from '@/utils/supabase/server';
import { BskyAgent, RichText } from '@atproto/api';
import * as dotenv from 'dotenv';
import * as process from 'process';

dotenv.config();

interface ApiResponse {
    // Define your expected response type here
    data: any; // Replace 'any' with your specific data structure
}

function handleError(error: Error, context?: string) {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] ${context ? `${context}: ` : ''}${error.message}`;

    // Log to console (you might want to replace this with proper logging)
    console.error(errorMessage);
}

    // Create a Bluesky Agent 
    const agent = new BskyAgent({
        service: 'https://bsky.social',
    })

    let runTimes = 0;

    interface DateRange {
        opens: string;
        closes: string;
    }

    interface Song {
        title: string;
        artist: string;
    }

    interface Signup {
        round_id: number;
        song_id: number;
        youtube_link: string;
        song: Song;
    }

    interface VoteOption {
        label: string;
        field: string;
        link: string;
    }

    interface CoverRoundResponse {
        phase: 'signups' | 'voting' | 'covering' | 'celebration';
        roundId: number;
        song: Song;
        dateLabels: {
            signups: DateRange;
            voting: DateRange;
            covering: DateRange;
            celebration: DateRange;
        };
        dates: {
            signups: DateRange;
            voting: DateRange;
            covering: DateRange;
            celebration: DateRange;
        };
        playlistUrl: string;
        submissions: any[]; // Define submission type if needed
        signups: Signup[];
        areSubmissionsOpen: boolean;
        hasRoundStarted: boolean;
        hasRoundEnded: boolean;
        voteOptions: VoteOption[];
    }

    async function fetchCoverRoundData(url: string): Promise<CoverRoundResponse> {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data: CoverRoundResponse = await response.json();
            return data;
        } catch (error) {
            handleError(error as Error, 'Cover Round API Fetch Error');
            throw new Error('Failed to fetch cover round data');
        }
    }

    function getCurrentPhase(dates: CoverRoundResponse['dates']): 'signups' | 'voting' | 'covering' | 'celebration' | 'inactive' {
        const now = new Date();

        // Helper function to check if current date is within a range
        function isWithinRange(range: DateRange): boolean {
            const openDate = new Date(range.opens);
            const closeDate = new Date(range.closes);
            return now >= openDate && now <= closeDate;
        }

        // Check each phase in chronological order
        if (isWithinRange(dates.signups)) {
            return 'signups';
        } else if (isWithinRange(dates.voting)) {
            return 'voting';
        } else if (isWithinRange(dates.covering)) {
            return 'covering';
        } else if (isWithinRange(dates.celebration)) {
            return 'celebration';
        }

        return 'inactive';
    }

    async function loginToBluesky(agent: BskyAgent) {
        await agent.login({
            identifier: process.env.BLUESKY_USERNAME!,
            password: process.env.BLUESKY_PASSWORD!
        });
    }

    function formatPhaseEndDate(date: string): string {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    function constructStatusMessage(
        currentPhase: string,
        currentSong: string,
        phaseEndDate?: string
    ): string {
        let message = `🎵 Cover Round Update 🎵\n`;
        message += `Current Phase: ${currentPhase}\n`;
        message += `Song: ${currentSong}\n`;

        if (currentPhase !== 'inactive' && phaseEndDate) {
            message += `Phase ends: ${phaseEndDate}`;
        }

        return message;
    }

    async function postUpdate(agent: BskyAgent, message: string) {
        await agent.post({ text: message });
        console.log("Just posted!");
    }

    function constructCountdownMessage(dueDate: string): string {
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return '⏰ Time\'s up! Phase has ended';
        }

        if (diffDays === 0) {
            return '⚡️ Last chance! Cover is due TODAY!';
        }

        if (diffDays === 1) {
            return '😱 Only 1 day left until the cover is due!';
        }

        if (diffDays <= 3) {
            return `⚠️ Just ${diffDays} days until the cover is due! Time to finish up!`;
        }

        if (diffDays <= 7) {
            return `🎵 ${diffDays} days until the cover is due! How's it coming along?`;
        }

        return `📅 ${diffDays} days until the cover is due! Plenty of time to make something amazing!`;
    }

    async function initializeRoundData() {
        await loginToBluesky(agent);
        const roundData = await fetchCoverRoundData("https://everyoneplaysthesamesong.com/api/round-info");
        const currentPhase = getCurrentPhase(roundData.dates);
        const currentSong = `${roundData.song.title} by ${roundData.song.artist}`;
        const phaseEndDate = currentPhase !== 'inactive'
            ? formatPhaseEndDate(roundData.dates[currentPhase].closes)
            : undefined;

        return {
            roundData,
            currentPhase,
            currentSong,
            phaseEndDate
        };
    }

    async function postStatusUpdate() {
        try {
            console.log("postStatusUpdate")
            const { currentPhase, currentSong, phaseEndDate } = await initializeRoundData();
            const message = constructStatusMessage(currentPhase, currentSong, phaseEndDate);
            await postUpdate(agent, message);
            console.log("postStatusUpdate posted")
        } catch (error) {
            handleError(error as Error, 'Status Update Error');
        }
    }

    async function postCountdownUpdate() {
        try {
            console.log("postCountdownUpdate")
            const { roundData, currentPhase } = await initializeRoundData();
            if (currentPhase !== 'inactive') {
                const message = constructCountdownMessage(roundData.dates[currentPhase].closes);
                await postUpdate(agent, message);
                console.log("postCountdownUpdate posted")

            }
        } catch (error) {
            handleError(error as Error, 'Countdown Update Error');
        }
    }

    const postEveryThirtySeconds = async () => {
        await loginToBluesky(agent);
        postUpdate(agent, "My deployed cron job didn't run, so I'm posting every 30 seconds until it stops")
    }


    // const statusJob = new CronJob(scheduleExpressionMinute, postStatusUpdate); // change to scheduleExpression for prod
    // const countdownJob = new CronJob(twoAmDaily, postCountdownUpdate); // change to scheduleExpression for prod
    // const countdownJob = new CronJob(twoAmDaily, postEveryThirtySeconds)
    // const alertJob = new CronJob(every30Sections, () => console.log("I'M AWAKE!"))
    // change to scheduleExpression for prod
    // 

    // countdownJob.start();
    // alertJob.start();

    // Initial run

console.log("HELLO")
    interface ShareableSubmission {
        artist: string;
        created_at: string;
        round_id: number;
        soundcloud_url: string;
        title: string;
    }

    async function fetchShareableSubmissions(): Promise<ShareableSubmission[]> {
        console.log("FETCHING FROM JSON")
        
        try {
            const songsToPost = require('./songs-to-post.json');
            return songsToPost.map((song: any) => ({
                round_id: song.round_id,
                soundcloud_url: song.soundcloud_url,
                created_at: new Date(song.created_at),
                title: song.title,
                artist: song.artist
            }));
        } catch (error) {
            handleError(error as Error, 'JSON File Read Error');
            throw new Error('Failed to fetch submissions from JSON');
        }
    }

    async function createRandomSongPost(submissions: ShareableSubmission[]): Promise<{
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

    async function postToBsky(agent: BskyAgent) {
        await loginToBluesky(agent);
        const submissions = await fetchShareableSubmissions();
        const post = await createRandomSongPost(submissions);
        
        await agent.post({
            text: post.text,
            embed: post.embed
        });
    }

    async function main() {
        await postToBsky(agent);
        process.exit(0);
    }

    main();

    // main().catch(error => {
    //     handleError(error as Error, 'Main Process Error');
    //     process.exit(1);
    // })}