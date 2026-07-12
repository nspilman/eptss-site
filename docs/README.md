# Docs

What lives where:

- **This folder** — cross-cutting standards and feature references that describe
  the system *as it is*. If one of these contradicts the code, fix the doc.
- **[atproto-migration/](atproto-migration/README.md)** — the AT Protocol
  migration series: the North Star, the build plan, and the resolved
  sub-problems (claiming submissions, plyr tracks).
- **[plans/](plans/README.md)** — agreed direction, not yet (fully) built.
- **[archive/](archive/README.md)** — completed plans and point-in-time audits.
  History, not truth.
- App-specific guides: [apps/web/docs/](../apps/web/docs/README.md).
  Package references: each package's own README.

## Standards

| Doc | Covers |
|---|---|
| [CODE_QUALITY_STANDARDS.md](CODE_QUALITY_STANDARDS.md) | Logging, error handling, code hygiene |
| [SCHEMA_VALIDATION_STANDARDS.md](SCHEMA_VALIDATION_STANDARDS.md) | Zod schema patterns and shared schema home |
| [FILE_SECURITY_STANDARDS.md](FILE_SECURITY_STANDARDS.md) | Upload validation, signed vs public URLs |
| [DATETIME_HANDLING.md](DATETIME_HANDLING.md) | UTC storage, formatting, timezone rules |

## Feature references

| Doc | Covers |
|---|---|
| [AUDIO_DURATION_STORAGE.md](AUDIO_DURATION_STORAGE.md) | The `audio_duration` column and its utilities |
| [ORPHAN_FILE_CLEANUP.md](ORPHAN_FILE_CLEANUP.md) | The pending-uploads GC cron and cleanup service |
