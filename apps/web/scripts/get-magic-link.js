const { google } = require('googleapis');
require('dotenv').config();

const OAUTH_CONFIG = {
  clientId: process.env.GMAIL_CLIENT_ID,
  clientSecret: process.env.GMAIL_CLIENT_SECRET,
  redirectUri: process.env.GMAIL_REDIRECT_URI,
  refreshToken: process.env.GMAIL_REFRESH_TOKEN,
};

console.log({OAUTH_CONFIG})

async function getMagicLink() {
  const oauth2Client = new google.auth.OAuth2(
    OAUTH_CONFIG.clientId,
    OAUTH_CONFIG.clientSecret,
    OAUTH_CONFIG.redirectUri
  );

  oauth2Client.setCredentials({
    refresh_token: OAUTH_CONFIG.refreshToken,
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  try {
    console.log('Fetching most recent email...');
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 1,
      orderBy: 'internalDate desc'
    });

    if (!response.data.messages?.length) {
      console.log('No messages found');
      return null;
    }

    console.log('Found message, fetching content...');
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: response.data.messages[0].id,
      format: 'full'
    });

    // Log message headers for debugging
    const headers = message.data.payload?.headers || [];
    const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value;
    const date = headers.find(h => h.name?.toLowerCase() === 'date')?.value;
    console.log('Message details:', { subject, date });

    // Check if we have parts (multipart email) or just a body
    const payload = message.data.payload;
    console.log('Message structure:', {
      hasBody: !!payload.body?.data,
      hasParts: !!payload.parts,
      numParts: payload.parts?.length,
      partTypes: payload.parts?.map(p => p.mimeType)
    });

    let body;
    if (payload.parts) {
      // Find HTML part first, fall back to text
      const htmlPart = payload.parts.find(p => p.mimeType === 'text/html');
      const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
      body = (htmlPart || textPart)?.body?.data;
    } else {
      body = payload.body?.data;
    }

    if (!body) {
      console.log('No message body found');
      return null;
    }

    const decodedBody = Buffer.from(body, 'base64').toString('utf-8');
    
    // Look specifically for the sign in link
    const signInLinkMatch = decodedBody.match(/href="([^"]*token_hash[^"]*?)"/);
    
    if (signInLinkMatch) {
      let link = signInLinkMatch[1]
        .replace(/&amp;/g, '&') // Convert HTML entities back to characters
        .replace(/\s+/g, ''); // Remove any whitespace
      
      // Parse and properly encode the URL
      try {
        const url = new URL(link.startsWith('http') ? link : `https://${link}`);
        // Ensure each query parameter is properly encoded
        const params = new URLSearchParams(url.search);
        url.search = params.toString();
        
        console.log('Found sign in link:', url.toString());
        return url.toString();
      } catch (e) {
        console.error('Error parsing URL:', e);
        return null;
      }
    }

    console.log('No sign in link found in message body');
    return null;
  } catch (error) {
    console.error('Error in getMagicLink:', error);
    return null;
  }
}

// If script is run directly
if (require.main === module) {
  getMagicLink().then(link => {
    if (link) {
      console.log(`MAGIC_LINK=${link}`);
      process.exit(0);
    } else {
      console.error('No magic link found');
      process.exit(1);
    }
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = { getMagicLink };
