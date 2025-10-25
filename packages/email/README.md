# @eptss/email

Email package for EPTSS (Everyone Plays the Same Song) containing email templates, components, and services.

## Structure

```
src/
├── components/       # Reusable email components
├── templates/        # Email templates (React Email)
├── services/         # Email sending services
└── index.ts          # Package exports
```

## Usage

### Using Email Templates

```typescript
import { RoundSignupConfirmation } from '@eptss/email';
import { render } from '@react-email/render';

const html = await render(
  React.createElement(RoundSignupConfirmation, {
    userName: 'John',
    roundName: 'Winter 2025',
    // ... other props
  })
);
```

### Using Email Service

```typescript
import { sendEmail } from '@eptss/email';

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: emailHtml,
});
```

## Available Templates

- `RoundSignupConfirmation` - Sent when a user signs up for a round
- `VotingConfirmation` - Sent when a user submits votes
- `SubmissionConfirmation` - Sent when a user submits a cover
- `AdminSignupNotification` - Admin notification for new signups
- `AdminVotingNotification` - Admin notification for new votes
- `AdminSubmissionNotification` - Admin notification for new submissions
- `AdminSongAssignmentNotification` - Admin notification when song is auto-assigned
- `VotingClosesTomorrow` - Reminder that voting closes tomorrow
- `CoveringHalfway` - Reminder at halfway point of covering phase
- `CoveringOneMonthLeft` - Reminder one month before covers due
- `CoveringLastWeek` - Reminder in last week before covers due
- `CoversDueTomorrow` - Reminder that covers are due tomorrow

## Development

This package uses:
- [React Email](https://react.email/) for email templates
- [Resend](https://resend.com/) for email sending
- TypeScript for type safety
