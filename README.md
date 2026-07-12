# Everyone Plays The Same Song

The EPTSS monorepo: a community covers project — each round, everyone signs up,
votes on a song, records their own cover of the winner, and celebrates at a
listening party. Rounds, signups, and submissions are published to the
[AT Protocol](https://atproto.com) network as the members' own records; private
data (nominated songs, ballots, emails) stays in Postgres.

## Layout

- `apps/web` — the Next.js 15 site ([its README](apps/web/README.md))
- `packages/` — 26 workspace packages. The load-bearing ones:
  - **Domain**: `core` (services), `rounds` (round lifecycle + network publisher),
    `db` (Drizzle schema/client), `actions` (server actions), `voting`, `admin`
  - **AT Protocol**: `atproto` — the zero-dependency client (public reads, record
    building, admin-voiced writes); user-voiced writes live in `apps/web/lib/atproto`
  - **Platform**: `ui`, `forms`, `auth`, `email`, `logger`, `routing`,
    `project-config`, `shared`
  - **Tooling**: `scripts` (operational CLIs — backfills, migrations, resets)

## Getting started

```bash
bun install
bun dev            # all apps in dev mode
bun run build      # build everything (turbo)
bun run check-types
bun test
```

Environment setup for the web app: [apps/web/docs/ENV_SETUP.md](apps/web/docs/ENV_SETUP.md).

## Stack

[Turborepo](https://turbo.build/repo) · [Bun](https://bun.sh) ·
[Next.js](https://nextjs.org) · [Drizzle](https://orm.drizzle.team) over
Supabase Postgres · [AT Protocol](https://atproto.com) · plyr.fm for audio

## Documentation

The docs index is [docs/README.md](docs/README.md) — cross-cutting standards,
active plans, the AT Protocol migration series, and an archive of completed
plans and audits. App-specific guides live in
[apps/web/docs/](apps/web/docs/README.md); each package documents itself in its
own README.
