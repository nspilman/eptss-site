import { google } from 'googleapis';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// OAuth2 configuration
const OAUTH_CONFIG = {
  clientId: process.env.GMAIL_CLIENT_ID!,
  clientSecret: process.env.GMAIL_CLIENT_SECRET!,
  redirectUri: 'http://localhost:3000/oauth2callback',
  user: 'eptss7777test@gmail.com',
  refreshToken: process.env.GMAIL_REFRESH_TOKEN
};

// Validate required environment variables
if (!OAUTH_CONFIG.clientId || !OAUTH_CONFIG.clientSecret) {
  console.error('Error: GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET must be set in .env');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  OAUTH_CONFIG.clientId,
  OAUTH_CONFIG.clientSecret,
  OAUTH_CONFIG.redirectUri
);

// If we have a refresh token, set it up
if (OAUTH_CONFIG.refreshToken) {
  oauth2Client.setCredentials({
    refresh_token: OAUTH_CONFIG.refreshToken
  });
}

// Function to encode email to base64
function createEmail(to: string, subject: string, message: string) {
  const email = [
    'Content-Type: text/html; charset="UTF-8"\n',
    'MIME-Version: 1.0\n',
    'Content-Transfer-Encoding: 7bit\n',
    'To: ', to, '\n',
    'From: ', OAUTH_CONFIG.user, '\n',
    'Subject: ', subject, '\n\n',
    message
  ].join('');

  return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Function to decode base64 URL-safe string
function decodeBase64UrlSafe(base64: string) {
  const base64Decoded = base64.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64Decoded, 'base64').toString('utf-8');
}

// Function to send a test email
async function sendTestEmail() {
  if (!OAUTH_CONFIG.refreshToken) {
    throw new Error('No refresh token found. Run this script with --get-token to get one.');
  }

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  const emailContent = createEmail(
    OAUTH_CONFIG.user,
    'Test Magic Link',
    '<p>Here is your magic link: <a href="http://localhost:3000/auth?token=test123">Click here</a></p>'
  );

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: emailContent
    }
  });

  console.log('Message sent:', res.data.id);
  return res.data;
}

// Function to read emails
async function readEmails() {
  if (!OAUTH_CONFIG.refreshToken) {
    throw new Error('No refresh token found. Run this script with --get-token to get one.');
  }

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  console.log('Searching for recent test emails...');
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: 'subject:"Test Magic Link"',
    maxResults: 1
  });

  if (!response.data.messages?.length) {
    console.log('No messages found');
    return null;
  }

  console.log('Found email, fetching content...');
  const message = await gmail.users.messages.get({
    userId: 'me',
    id: response.data.messages[0].id!,
    format: 'full'
  });

  // Extract headers
  const headers = message.data.payload?.headers || [];
  const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value;
  const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value;
  const to = headers.find(h => h.name?.toLowerCase() === 'to')?.value;
  const date = headers.find(h => h.name?.toLowerCase() === 'date')?.value;

  // Extract body content
  let body = '';
  const payload = message.data.payload;
  
  if (payload?.body?.data) {
    // Single part email
    body = decodeBase64UrlSafe(payload.body.data);
  } else if (payload?.parts) {
    // Multipart email - look for HTML and text parts
    const htmlPart = payload.parts.find(part => part.mimeType === 'text/html');
    const textPart = payload.parts.find(part => part.mimeType === 'text/plain');
    
    if (htmlPart?.body?.data) {
      body = decodeBase64UrlSafe(htmlPart.body.data);
    } else if (textPart?.body?.data) {
      body = decodeBase64UrlSafe(textPart.body.data);
    }
  }

  // Extract magic link
  const magicLinkMatch = body.match(/http:\/\/localhost:3000\/auth\?token=[^\s<]*/);

  console.log('\nEmail Details:');
  console.log('-------------');
  console.log('From:', from);
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Date:', date);
  console.log('\nContent:');
  console.log('-------------');
  console.log(body);
  
  if (magicLinkMatch) {
    console.log('\nMagic Link:');
    console.log('-------------');
    console.log(magicLinkMatch[0]);
  }

  return {
    id: message.data.id,
    subject,
    from,
    to,
    date,
    body,
    magicLink: magicLinkMatch ? magicLinkMatch[0] : null
  };
}

// Function to get initial refresh token (one-time setup)
async function getInitialToken() {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.send'
    ],
    prompt: 'consent'
  });

  console.log('\nNo refresh token found in environment. Follow these steps:');
  console.log('\n1. Visit this URL to get the authorization code:');
  console.log(url);
  console.log('\n2. After authorizing, copy the "code" parameter from the redirect URL');
  console.log('\n3. Run this script again with the code:');
  console.log('   bun run scripts/manipulate-email.ts YOUR_AUTH_CODE');
  console.log('\n4. Save the refresh token in your environment as GMAIL_REFRESH_TOKEN');
}

async function main() {
  const authCode = process.argv[2];

  try {
    // If we don't have a refresh token and no auth code provided, start OAuth flow
    if (!OAUTH_CONFIG.refreshToken && !authCode) {
      await getInitialToken();
      return;
    }

    // If we have an auth code, get the refresh token
    if (authCode) {
      try {
        const { tokens } = await oauth2Client.getToken(authCode);
        if (!tokens.refresh_token) {
          console.error('\nError: No refresh token received. Please try the authorization flow again with consent:');
          await getInitialToken();
          return;
        }
        console.log('\nHere is your refresh token. Save this as GMAIL_REFRESH_TOKEN in your .env:');
        console.log(tokens.refresh_token);
        return;
      } catch (error) {
        console.error('\nError exchanging auth code for tokens:', 
          error instanceof Error ? error.message : 'An unknown error occurred');
        console.log('\nPlease try the authorization flow again:');
        await getInitialToken();
        return;
      }
    }

    // Test the refresh token before trying to use it
    try {
      console.log('Testing OAuth credentials...');
      await oauth2Client.getAccessToken();
      console.log('OAuth credentials are valid!\n');
    } catch (error) {
      console.error('\nError: Invalid or expired refresh token. Please get a new one:');
      await getInitialToken();
      return;
    }

    // Normal operation - send and read emails
    console.log('Sending test email...');
    await sendTestEmail();
    
    console.log('\nWaiting for email to arrive...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\nReading emails...');
    const email = await readEmails();
    if (email?.magicLink) {
      console.log('\nFound magic link:', email.magicLink);
    }
    
  } catch (error) {
    console.error('Error:',error instanceof Error ? error.message : 'An unknown error occurred');
    if (error instanceof Error && error.message.includes('invalid_grant')) {
      console.log('\nPlease try the authorization flow again to get a new refresh token:');
      await getInitialToken();
    }
  }
}

main();