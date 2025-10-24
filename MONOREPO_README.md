# EPTSS Monorepo

This is a Turborepo-based monorepo for the Everyone Plays The Same Song (EPTSS) project.

## Structure

- `apps/eptss-site`: Main Next.js application
- `packages/ui`: Shared UI components library

## Getting Started

Install dependencies:

```bash
bun install
```

Run the development server:

```bash
bun dev
```

Build all apps and packages:

```bash
bun build
```

## Development

This monorepo uses:

- [Turborepo](https://turbo.build/repo) for build orchestration
- [Bun](https://bun.sh) as the package manager
- [Next.js](https://nextjs.org) for the main application
- [React](https://react.dev) for UI components

## Available Commands

- `bun dev` - Start all apps in development mode
- `bun build` - Build all apps and packages
- `bun lint` - Lint all apps and packages
- `bun test` - Run tests across all packages
- `bun storybook` - Start Storybook for component development
