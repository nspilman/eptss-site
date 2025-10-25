# @eptss/scripts

Standalone scripts package for EPTSS administrative and maintenance tasks.

## Available Scripts

### Social Media
- **post-song**: Post a song to Bluesky
  ```bash
  bun run post-song
  ```

### Playlist Management
- **create-spotify-playlist**: Create a Spotify playlist for a round
  ```bash
  bun run create-spotify-playlist <round-id>
  ```

- **create-youtube-playlist**: Create a YouTube playlist for a round
  ```bash
  bun run create-youtube-playlist <round-id>
  ```

### Database Maintenance
- **populate-round-slugs**: Populate slug field for existing rounds
  ```bash
  bun run populate-round-slugs
  ```

### Testing/Development
- **test-assign-round-song**: Test the assign-round-song cron job
  ```bash
  bun run test-assign-round-song
  ```

- **test-create-future-rounds**: Test the create-future-rounds cron job
  ```bash
  bun run test-create-future-rounds
  ```

- **test-send-reminder-emails**: Test the send-reminder-emails cron job
  ```bash
  bun run test-send-reminder-emails
  ```

- **test-voting-email-render**: Test email template rendering
  ```bash
  bun run test-voting-email-render
  ```

## Running from the Root

From the monorepo root, you can run scripts using:

```bash
cd packages/scripts && bun run <script-name>
```

## Dependencies

This package depends on:
- `@eptss/data-access` - Database access layer
- `@eptss/email` - Email templates
- `@eptss/shared` - Shared utilities

These dependencies are independent of the web app, making scripts fully standalone.
