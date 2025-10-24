/**
 * Test script for the create-future-rounds cron job
 * 
 * This script simulates what the cron job does by calling the API endpoint locally
 * 
 * Usage:
 *   bun run scripts/test-create-future-rounds.ts
 */

async function testCreateFutureRounds() {
  const CRON_SECRET = process.env.CRON_SECRET;
  const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  console.log('🧪 Testing create-future-rounds endpoint...\n');

  if (!CRON_SECRET) {
    console.error('❌ Error: CRON_SECRET not found in environment variables');
    console.log('💡 Add CRON_SECRET to your .env.local file\n');
    process.exit(1);
  }

  try {
    console.log(`📡 Calling: ${API_URL}/api/cron/create-future-rounds`);
    console.log(`🔑 Using CRON_SECRET: ${CRON_SECRET.substring(0, 8)}...\n`);

    const response = await fetch(`${API_URL}/api/cron/create-future-rounds`, {
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
      if (data.action === 'created') {
        console.log('✅ SUCCESS: Future rounds were created!');
        console.log(`📝 Created ${data.createdRounds.length} round(s):`);
        data.createdRounds.forEach((round: any) => {
          console.log(`  - ${round.slug} (ID: ${round.id})`);
          console.log(`    Signup opens: ${round.signupOpens}`);
          console.log(`    Voting opens: ${round.votingOpens}`);
        });
        
        if (data.errors && data.errors.length > 0) {
          console.log('\n⚠️  Some errors occurred:');
          data.errors.forEach((err: any) => {
            console.log(`  - ${err.slug}: ${err.error}`);
          });
        }
      } else if (data.action === 'none') {
        console.log('ℹ️  No action taken (this is expected if 2 future rounds already exist)');
        console.log(`📝 Reason: ${data.message}`);
        
        if (data.existingFutureRounds) {
          console.log('\n📅 Existing future rounds:');
          data.existingFutureRounds.forEach((round: any) => {
            console.log(`  - ${round.slug} (ID: ${round.id})`);
          });
        }
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

testCreateFutureRounds();
