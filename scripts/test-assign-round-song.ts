/**
 * Test script for the assign-round-song cron job
 * 
 * This script simulates what the cron job does by calling the API endpoint locally
 * 
 * Usage:
 *   bun run scripts/test-assign-round-song.ts
 */

async function testAssignRoundSong() {
  const CRON_SECRET = process.env.CRON_SECRET;
  const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  console.log('🧪 Testing assign-round-song endpoint...\n');

  if (!CRON_SECRET) {
    console.error('❌ Error: CRON_SECRET not found in environment variables');
    console.log('💡 Add CRON_SECRET to your .env.local file\n');
    process.exit(1);
  }

  try {
    console.log(`📡 Calling: ${API_URL}/api/cron/assign-round-song`);
    console.log(`🔑 Using CRON_SECRET: ${CRON_SECRET.substring(0, 8)}...\n`);

    const response = await fetch(`${API_URL}/api/cron/assign-round-song`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📦 Response Body:`);
    console.log(JSON.stringify(data, null, 2));
    console.log('\n');

    if (response.ok) {
      if (data.action === 'assigned') {
        console.log('✅ SUCCESS: Song was assigned!');
        console.log(`🎵 Assigned Song: ${data.assignedSong.title} - ${data.assignedSong.artist}`);
        console.log(`⭐ Average: ${data.assignedSong.average}`);
        console.log(`🗳️  Votes: ${data.assignedSong.votesCount}`);
        console.log(`1️⃣  1-star votes: ${data.assignedSong.oneStarCount}`);
      } else if (data.action === 'none') {
        console.log('ℹ️  No action taken (this is expected in most cases)');
        console.log(`📝 Reason: ${data.message}`);
      }
    } else {
      console.log('❌ ERROR: Request failed');
      console.log(`📝 Error: ${data.error || data.message}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

testAssignRoundSong();
