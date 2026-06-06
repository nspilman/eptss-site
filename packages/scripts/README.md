# @eptss/scripts

Standalone scripts package for EPTSS administrative and maintenance tasks.

## Available Scripts

### Social Media
- **post-song**: Post a song to Bluesky
  ```bash
  bun run post-song
  ```

### ATProto (atjam migration — see `docs/atproto-migration/`)
These scripts create the AT Protocol records that back the EPTSS → atjam migration.

Two identities are at play:

**Admin / project DID** — owns the jam, rounds, and (future) confirmation records.
- `ATPROTO_HANDLE` — e.g. `everyoneplaysthesamesong.com`
- `ATPROTO_APP_PASSWORD` — app password (NOT your main password). Generate at https://bsky.app/settings/app-passwords.

**User DID** — for backfilling user-side records (signup, submission) from your personal account.
- `USER_ATPROTO_HANDLE` — e.g. `nate.bsky.social`
- `USER_ATPROTO_APP_PASSWORD` — app password for that account.

Put all four in `packages/scripts/.env`. The admin scripts read the first pair; user-side backfill scripts read the second pair.

- **atproto:create-jam**: Create the `at.atjam.jam` record for EPTSS on the admin DID. **Run once.** Save the printed URI + CID.
  ```bash
  bun run atproto:create-jam
  ```

- **atproto:create-round**: Create an `at.atjam.round` record on the admin DID from a JSON config. See `src/atproto/round.example.json` for the shape — paste the jam URI/CID into your config first.
  ```bash
  bun run atproto:create-round path/to/round.json
  ```

- **atproto:create-user-signup**: Create an `at.atjam.signup` record on the **user's** PDS, strong-reffing a round. Used to backfill existing EPTSS users into ATProto (Path A — no website integration). Reads `USER_ATPROTO_*` env vars, not the admin ones. See `src/atproto/signup.example.json` for the shape — paste the round URI/CID into your config first.
  ```bash
  bun run atproto:create-user-signup path/to/signup.json
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
