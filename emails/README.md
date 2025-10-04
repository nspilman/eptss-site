# Email Templates Library

A modern, component-based email template system using React Email and Tailwind CSS.

## Overview

This directory contains all email templates and reusable components for EPTSS. Templates are built with React Email, which provides:

- **React Components**: Write emails using familiar React syntax
- **Tailwind CSS**: Style emails with Tailwind utility classes
- **Type Safety**: Full TypeScript support
- **Preview Mode**: View and test emails in development
- **Automatic HTML Generation**: React components are rendered to email-compatible HTML

## Directory Structure

```
emails/
├── components/          # Reusable email components
│   ├── EmailHeader.tsx  # Gradient header with emoji
│   └── PhaseTimeline.tsx # Timeline component for round phases
├── templates/           # Complete email templates
│   ├── BaseEmailLayout.tsx          # Base layout wrapper
│   └── RoundSignupConfirmation.tsx  # Signup confirmation email
├── index.ts            # Exports all templates and components
└── README.md           # This file
```

## Usage

### Sending an Email

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

### Creating a New Template

1. **Create the template file** in `emails/templates/`:

```tsx
// emails/templates/SubmissionConfirmation.tsx
import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import { EmailHeader } from '../components/EmailHeader';

interface SubmissionConfirmationProps {
  userName?: string;
  roundName: string;
  submissionUrl: string;
}

export const SubmissionConfirmation = ({
  userName,
  roundName,
  submissionUrl,
}: SubmissionConfirmationProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your cover has been submitted! 🎸</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-8 max-w-2xl">
            <EmailHeader title="Submission Received!" emoji="🎸" />
            
            <Section className="rounded-b-lg border border-t-0 border-gray-200 bg-white px-8 py-8">
              <Text className="text-base text-gray-800">
                Hi {userName || 'there'},
              </Text>
              
              <Text className="text-base text-gray-800">
                Your cover for <strong>{roundName}</strong> has been submitted successfully!
              </Text>
              
              <Section className="mt-8 text-center">
                <Button
                  href={submissionUrl}
                  className="rounded-md bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-3 text-base font-semibold text-white no-underline"
                >
                  View Your Submission
                </Button>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SubmissionConfirmation;
```

2. **Export from index.ts**:

```typescript
export { SubmissionConfirmation } from './templates/SubmissionConfirmation';
```

3. **Add to email service** (`services/emailService.ts`):

```typescript
import { SubmissionConfirmation } from '@/emails/templates/SubmissionConfirmation';

export async function sendSubmissionConfirmation(params: {
  to: string;
  userName?: string;
  roundName: string;
  submissionUrl: string;
}): Promise<EmailResult> {
  const html = await render(
    SubmissionConfirmation({
      userName: params.userName,
      roundName: params.roundName,
      submissionUrl: params.submissionUrl,
    })
  );

  return sendEmail({
    to: params.to,
    subject: `Your cover for ${params.roundName} has been submitted!`,
    html,
  });
}
```

## Available Components

### EmailHeader

Reusable gradient header with optional emoji.

```tsx
import { EmailHeader } from '@/emails/components/EmailHeader';

<EmailHeader title="Welcome!" emoji="🎵" />
```

### PhaseTimeline

Display a timeline of round phases.

```tsx
import { PhaseTimeline } from '@/emails/components/PhaseTimeline';

<PhaseTimeline
  phases={[
    {
      title: 'Voting Opens',
      date: 'Jan 15, 2025',
      description: 'Vote for your favorite song',
      color: 'purple-600',
    },
    {
      title: 'Covering Begins',
      date: 'Jan 22, 2025',
      description: 'Start working on your cover',
      color: 'purple-700',
    },
  ]}
/>
```

### BaseEmailLayout

Base wrapper that provides consistent styling.

```tsx
import { BaseEmailLayout } from '@/emails/templates/BaseEmailLayout';

<BaseEmailLayout preview="Your preview text">
  {/* Your email content */}
</BaseEmailLayout>
```

## Styling with Tailwind

React Email supports Tailwind CSS with some limitations for email compatibility:

### Supported Classes

```tsx
// Colors
className="bg-purple-600 text-white"

// Spacing
className="px-8 py-4 mt-4 mb-6"

// Typography
className="text-base font-semibold"

// Layout
className="rounded-lg border border-gray-200"

// Flexbox (limited support)
className="flex items-center"
```

### Not Supported

- `hover:` pseudo-classes (limited email client support)
- `space-*` utilities
- `@tailwindcss/typography` prose classes
- Complex animations

### Best Practices

1. **Use inline styles for critical styling**: Tailwind is converted to inline styles automatically
2. **Test in multiple email clients**: Use services like Litmus or Email on Acid
3. **Keep layouts simple**: Use tables for complex layouts if needed
4. **Avoid external CSS**: All styles should be inline or in `<style>` tags

## Development Workflow

### Preview Emails Locally

React Email provides a development server to preview emails:

```bash
# Add to package.json scripts
"email:dev": "email dev"

# Run the preview server
bun run email:dev
```

This will start a server at `http://localhost:3000` where you can:
- View all email templates
- Test with different props
- See changes in real-time
- Copy HTML output

### Testing

1. **Visual Testing**: Use the preview server to check appearance
2. **Send Test Emails**: Use your email service to send to test addresses
3. **Email Client Testing**: Test in Gmail, Outlook, Apple Mail, etc.

## Email Client Compatibility

Our templates are tested and optimized for:

- ✅ Gmail (Web, iOS, Android)
- ✅ Apple Mail (macOS, iOS)
- ✅ Outlook (Web, Windows, macOS)
- ✅ Yahoo Mail
- ✅ ProtonMail
- ✅ Mobile clients

## Tips for Creating Great Emails

1. **Keep it simple**: Email clients have limited CSS support
2. **Use semantic HTML**: Helps with accessibility and deliverability
3. **Optimize images**: Use compressed images and provide alt text
4. **Test thoroughly**: Different clients render emails differently
5. **Mobile-first**: Most emails are opened on mobile devices
6. **Clear CTAs**: Make buttons and links obvious
7. **Accessible**: Use proper contrast ratios and semantic markup

## Resources

- [React Email Documentation](https://react.email/docs)
- [Tailwind Component Docs](https://react.email/docs/components/tailwind)
- [Email Client CSS Support](https://www.caniemail.com/)
- [Email Design Best Practices](https://www.campaignmonitor.com/dev-resources/guides/coding/)
