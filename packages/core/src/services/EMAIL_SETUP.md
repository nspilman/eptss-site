# Email Service Setup Guide

This guide explains how to set up and use the email service for EPTSS.

## Overview

The email service is built using [Resend](https://resend.com), a modern email API for developers. It provides a clean, abstracted interface for sending emails throughout the application.

## Setup Instructions

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com) and sign up for an account
2. Verify your email address

### 2. Get Your API Key

1. Navigate to [API Keys](https://resend.com/api-keys) in your Resend dashboard
2. Click "Create API Key"
3. Give it a name (e.g., "EPTSS Production" or "EPTSS Development")
4. Copy the API key (it will only be shown once)

### 3. Verify Your Domain

For production use, you'll need to verify your domain:

1. Go to [Domains](https://resend.com/domains) in your Resend dashboard
2. Click "Add Domain"
3. Enter your domain (e.g., `eptss.com`)
4. Follow the instructions to add DNS records
5. Wait for verification (usually takes a few minutes)

**For development/testing:** You can use Resend's test domain (`onboarding@resend.dev`) without verification.

### 4. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Resend API Key
RESEND_API_KEY=re_your_api_key_here

# Email sender address (use your verified domain)
EMAIL_FROM="EPTSS <noreply@eptss.com>"

# Base URL for email links
NEXT_PUBLIC_BASE_URL=https://eptss.com
```

**For development:**
```bash
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM="EPTSS <onboarding@resend.dev>"
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Architecture

### Core Email Service (`services/emailService.ts`)

The email service provides a clean abstraction with two main functions:

#### 1. `sendEmail(params: SendEmailParams)`
The base email sending function that all other email functions use.

```typescript
interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}
```

#### 2. `sendRoundSignupConfirmation(params: RoundSignupConfirmationParams)`
Sends a beautifully formatted confirmation email when a user signs up for a round.

```typescript
interface RoundSignupConfirmationParams {
  to: string;
  userName?: string;
  roundName: string;
  songTitle: string;
  artist: string;
  youtubeLink: string;
  roundSlug: string;
  phaseDates: {
    votingOpens: string;
    coveringBegins: string;
    coversDue: string;
    listeningParty: string;
  };
}
```

## Usage Examples

### Sending a Round Signup Confirmation

```typescript
import { sendRoundSignupConfirmation } from '@/services/emailService';

await sendRoundSignupConfirmation({
  to: 'user@example.com',
  userName: 'John',
  roundName: 'Round 42',
  songTitle: 'Bohemian Rhapsody',
  artist: 'Queen',
  youtubeLink: 'https://youtube.com/watch?v=...',
  roundSlug: 'round-42',
  phaseDates: {
    votingOpens: 'Jan 15, 2025',
    coveringBegins: 'Jan 22, 2025',
    coversDue: 'Feb 5, 2025',
    listeningParty: 'Feb 8, 2025',
  },
});
```

### Sending a Custom Email

```typescript
import { sendEmail } from '@/services/emailService';

const result = await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to EPTSS!',
  html: '<h1>Welcome!</h1><p>Thanks for joining us.</p>',
  replyTo: 'support@eptss.com', // optional
});

if (result.success) {
  console.log('Email sent!', result.messageId);
} else {
  console.error('Failed to send email:', result.error);
}
```

## Adding New Email Types

To add a new email type (e.g., submission confirmation, voting reminder):

1. **Define the parameters interface** in `services/emailService.ts`:
```typescript
export interface SubmissionConfirmationParams {
  to: string;
  userName?: string;
  roundName: string;
  submissionUrl: string;
  // ... other params
}
```

2. **Create the email function**:
```typescript
export async function sendSubmissionConfirmation(
  params: SubmissionConfirmationParams
): Promise<EmailResult> {
  const { to, userName, roundName, submissionUrl } = params;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Submission Confirmed</title>
      </head>
      <body>
        <!-- Your email HTML here -->
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Your cover for ${roundName} has been submitted!`,
    html,
  });
}
```

3. **Use it in your application**:
```typescript
import { sendSubmissionConfirmation } from '@/services/emailService';

await sendSubmissionConfirmation({
  to: user.email,
  userName: user.name,
  roundName: 'Round 42',
  submissionUrl: 'https://eptss.com/submissions/123',
});
```

## Current Implementation

The email service is currently integrated into the signup flow:

- **`verifySignupByEmail()`** - Sends confirmation email when a user verifies their email and completes signup
- **`signup()`** - Sends confirmation email when an authenticated user signs up for a round

Both functions use the helper `sendSignupConfirmationEmail()` to avoid code duplication.

## Email Design

The confirmation email includes:
- Gradient header with emoji
- User's song choice details
- YouTube link to their selected song
- Timeline of all round phases with formatted dates
- Call-to-action button to view round details
- Responsive design that works on mobile and desktop

## Error Handling

The email service is designed to fail gracefully:
- Errors are logged but don't break the signup flow
- Returns `EmailResult` with `success` boolean and optional `error` message
- Helper function `sendSignupConfirmationEmail()` catches errors to prevent signup failures

## Testing

### Development Testing
1. Use Resend's test domain for development
2. Check the Resend dashboard for sent emails
3. Test emails will appear in the "Emails" section

### Production Testing
1. Verify your domain first
2. Send test emails to your own address
3. Check spam folders if emails don't arrive
4. Monitor the Resend dashboard for delivery status

## Troubleshooting

### Emails not sending
- Check that `RESEND_API_KEY` is set correctly
- Verify the API key is active in Resend dashboard
- Check server logs for error messages

### Emails going to spam
- Verify your domain with Resend
- Add SPF, DKIM, and DMARC records
- Avoid spam trigger words in subject lines

### HTML not rendering correctly
- Test in multiple email clients
- Use inline CSS (avoid external stylesheets)
- Keep HTML simple and table-based for best compatibility

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Node.js SDK](https://resend.com/docs/send-with-nodejs)
- [Email HTML Best Practices](https://www.campaignmonitor.com/dev-resources/guides/coding/)
