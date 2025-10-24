# EPTSS Admin App

This is the administrative dashboard for Everyone Plays the Same Song (EPTSS).

## Getting Started

### Development

```bash
# From the root of the monorepo
bun install
bun dev
```

The admin app will run on `http://localhost:3001`

### Environment Variables

Copy the `.env.local` file from the web app or create a new one with the required environment variables:

- Database credentials
- Supabase configuration
- Email service configuration
- Any other required API keys

### Features

- Round management (create, update, assign songs)
- User management and statistics
- Submission tracking
- Voting analytics
- Feedback management
- Email testing and notifications

## Tech Stack

- **Framework**: Next.js 15.5
- **UI Components**: Shared `@eptss/ui` package
- **Database**: Drizzle ORM with Turso/LibSQL
- **Authentication**: Supabase
- **Styling**: Tailwind CSS
