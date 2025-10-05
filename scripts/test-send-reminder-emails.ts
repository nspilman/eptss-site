/**
 * Test script for the send-reminder-emails cron job
 * 
 * This script simulates what the cron job does by calling the API endpoint locally
 * 
 * Usage:
 *   bun run scripts/test-send-reminder-emails.ts
 */

async function testSendReminderEmails() {
  const CRON_SECRET = process.env.CRON_SECRET;
  const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  console.log('🧪 Testing send-reminder-emails endpoint...\n');

  if (!CRON_SECRET) {
    console.error('❌ Error: CRON_SECRET not found in environment variables');
    console.log('💡 Add CRON_SECRET to your .env.local file\n');
    process.exit(1);
  }

  try {
    console.log(`📡 Calling: ${API_URL}/api/cron/send-reminder-emails`);
    console.log(`🔑 Using CRON_SECRET: ${CRON_SECRET.substring(0, 8)}...\n`);

    const response = await fetch(`${API_URL}/api/cron/send-reminder-emails`, {
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
      if (data.action === 'sent') {
        console.log('✅ SUCCESS: Reminder emails were sent!');
        console.log(`📧 Total emails sent: ${data.message}`);
        
        if (data.results?.sent) {
          console.log('\n📝 Breakdown by email type:');
          data.results.sent.forEach((result: any) => {
            console.log(`  - ${result.emailType}: ${result.recipientCount} recipient(s)`);
          });
        }
        
        if (data.results?.errors && data.results.errors.length > 0) {
          console.log('\n⚠️  Some errors occurred:');
          data.results.errors.forEach((err: any) => {
            console.log(`  - ${err.emailType}: ${err.error}`);
          });
        }
      } else if (data.action === 'none') {
        console.log('ℹ️  No action taken');
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

testSendReminderEmails();
