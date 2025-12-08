# @eptss/project-config

Zod-based project configuration system for managing per-project settings, feature flags, and static content.

## Overview

The `@eptss/project-config` package provides:
- **Type-safe configuration** using Zod schemas
- **Server-side validation** with runtime type checking
- **Client-side typed access** without bundling validation code
- **Centralized management** of project settings
- **Automatic defaults** for missing or invalid config

## Installation

This package is part of the EPTSS monorepo and uses workspace dependencies:

```json
{
  "dependencies": {
    "@eptss/project-config": "workspace:*"
  }
}
```

## Configuration Structure

Project configurations are stored in the `projects.config` JSONB column in the database. The schema includes:

### 1. Feature Flags (`features`)
Enable/disable functionality per project:
```typescript
{
  enableVoting: boolean,
  enableSubmissions: boolean,
  enableReflections: boolean,
  enableDiscussions: boolean,
  enableInvites: boolean,
  enableSocialSharing: boolean,
}
```

### 2. UI Configuration (`ui`)
Customize appearance per project:
```typescript
{
  primaryColor: string,      // hex color
  accentColor: string,        // hex color
  logoUrl?: string,           // URL to logo
  favicon?: string,           // URL to favicon
  theme: 'light' | 'dark' | 'auto',
}
```

### 3. Business Rules (`businessRules`)
Configure operational constraints:
```typescript
{
  maxSubmissionsPerRound: number,
  maxVotesPerUser: number,
  requireEmailVerification: boolean,
  minVotingDurationDays: number,
  maxVotingDurationDays: number,
  defaultRoundDurationWeeks: number,
  allowLateSubmissions: boolean,
  lateSubmissionGracePeriodHours: number,
}
```

### 4. Email Templates (`email`)
Customize email content:
```typescript
{
  fromName: string,
  replyToEmail?: string,
  templates: {
    signupConfirmation: { subject, greeting },
    votingOpened: { subject, greeting },
    submissionReminder: { subject, greeting },
  }
}
```

### 5. Static Content (`content`)
Page copy and FAQ:
```typescript
{
  pages: {
    home: { hero: { title, subtitle, cta }, description },
    dashboard: { title, welcomeMessage },
    voting: { title, description, instructions },
    submit: { title, description, instructions },
  },
  faq: {
    general: [{ question, answer }],
    voting: [{ question, answer }],
    submissions: [{ question, answer }],
  }
}
```

## Usage

### Server Components

Fetch configuration in Server Components using the provided utilities:

```tsx
// app/my-page/page.tsx
import {
  getProjectConfig,
  getPageContent,
  getProjectFeatures,
} from '@eptss/project-config';

export default async function MyPage() {
  // Fetch full config
  const config = await getProjectConfig('cover');

  // Or fetch specific parts
  const pageContent = await getPageContent('cover', 'home');
  const features = await getProjectFeatures('cover');

  return (
    <ClientComponent
      pageContent={pageContent}
      features={features}
    />
  );
}
```

### Client Components

Receive config as props from Server Components:

```tsx
// components/MyComponent.tsx
'use client';

import type { PageContent, FeatureFlags } from '@eptss/project-config';

interface Props {
  pageContent: PageContent['home'];
  features: FeatureFlags;
}

export function MyComponent({ pageContent, features }: Props) {
  return (
    <div>
      <h1>{pageContent.hero.title}</h1>

      {/* Conditional rendering based on features */}
      {features.enableVoting && <VotingSection />}
    </div>
  );
}
```

### Server Actions / API Routes

```typescript
// app/api/my-action/route.ts
import {
  getProjectBusinessRules,
  isFeatureEnabled,
} from '@eptss/project-config';

export async function POST(request: Request) {
  // Check feature flag
  const votingEnabled = await isFeatureEnabled('cover', 'enableVoting');
  if (!votingEnabled) {
    return Response.json({ error: 'Voting is disabled' }, { status: 403 });
  }

  // Get business rules
  const rules = await getProjectBusinessRules('cover');
  if (voteCount > rules.maxVotesPerUser) {
    return Response.json({ error: 'Too many votes' }, { status: 400 });
  }

  // ... rest of logic
}
```

### Updating Configuration (Admin Only)

```typescript
import { updateProjectConfig } from '@eptss/project-config';

// Update specific features
await updateProjectConfig('cover', {
  features: {
    enableVoting: true,
  },
  content: {
    pages: {
      home: {
        hero: {
          title: 'Welcome to Cover Project',
          subtitle: 'Create amazing covers together',
        },
      },
    },
  },
});

// Cache will be automatically cleared
```

## Database Setup

To set initial config for a project:

```sql
UPDATE projects
SET config = jsonb_build_object(
  'features', jsonb_build_object(
    'enableVoting', true,
    'enableSubmissions', true,
    'enableReflections', true
  ),
  'ui', jsonb_build_object(
    'primaryColor', '#3b82f6',
    'theme', 'auto'
  ),
  'businessRules', jsonb_build_object(
    'maxVotesPerUser', 3,
    'defaultRoundDurationWeeks', 4
  ),
  'content', jsonb_build_object(
    'pages', jsonb_build_object(
      'home', jsonb_build_object(
        'hero', jsonb_build_object(
          'title', 'Welcome to Cover Project',
          'subtitle', 'Create amazing covers together'
        )
      )
    )
  )
)
WHERE slug = 'cover';
```

## Best Practices

1. **Always fetch config on the server** - Use Server Components or Server Actions to fetch config
2. **Pass config as props** - Send validated config to Client Components as props
3. **Use feature flags** - Check feature flags before rendering or executing feature-specific code
4. **Provide fallbacks** - Always have sensible defaults in your UI code
5. **Cache awareness** - Config is cached for 5 minutes; use `clearProjectConfigCache()` after updates
6. **Type safety** - Leverage TypeScript types for compile-time safety

## Architecture

- **Zod for validation**: Runtime type safety and validation with excellent TypeScript integration
- **Server-side only validation**: Keeps client bundles small by validating only on server
- **JSONB storage**: Flexible schema-less storage with PostgreSQL JSONB indexing
- **Automatic defaults**: Missing or invalid config automatically uses sensible defaults
- **Caching**: In-memory cache with TTL to reduce database queries

## Example Implementation

For a complete example implementation, see how config is used in various page components throughout the application.

## API Reference

### Services

- `getProjectConfig(slug)` - Get full project configuration
- `getProjectFeatures(slug)` - Get feature flags
- `isFeatureEnabled(slug, feature)` - Check if a feature is enabled
- `getProjectUIConfig(slug)` - Get UI configuration
- `getProjectBusinessRules(slug)` - Get business rules
- `getProjectEmailConfig(slug)` - Get email configuration
- `getProjectPageContent(slug)` - Get all page content
- `getProjectFAQContent(slug)` - Get FAQ content
- `getPageContent(slug, page)` - Get content for a specific page
- `updateProjectConfig(slug, config)` - Update project configuration (admin)
- `clearProjectConfigCache(projectId?)` - Clear configuration cache

### Types

- `ProjectConfig` - Complete configuration object
- `FeatureFlags` - Feature flag configuration
- `UIConfig` - UI customization configuration
- `BusinessRules` - Business rules configuration
- `EmailConfig` - Email template configuration
- `PageContent` - Page content configuration
- `FAQContent` - FAQ content configuration
