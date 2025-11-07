# @eptss/logger

Centralized logging package for the EPTSS monorepo with both server-side and client-side support.

## Features

- 🔍 **Structured logging** with 4 levels (debug, info, warn, error)
- 🌍 **Environment-aware** - Different behavior in dev vs production
- 🔗 **Integrated monitoring** - Sentry for errors, PostHog for analytics
- 🚀 **Fire-and-forget** - Non-blocking async logging
- 📦 **Context tracking** - Automatic request/user context (server-side)
- 🎨 **Pretty console** - Emoji-enhanced logs in development
- ☁️ **CloudWatch ready** - JSON output in production

## Installation

```bash
bun add @eptss/logger
```

## Setup

### PostHog Initialization (Client-Side)

Before using the client logger, initialize PostHog in your Next.js app:

```typescript
// apps/web/instrumentation-client.ts
import { initPostHog } from '@eptss/logger/client';

initPostHog();
```

This automatically:
- Initializes PostHog with your API key
- Enables auto-capture of pageviews and clicks
- Sets up session tracking
- Configures optimal defaults for Next.js

You can also manually access the PostHog client:

```typescript
import { getPostHog } from '@eptss/logger/client';

const posthog = getPostHog();
posthog.identify('user-123', { email: 'user@example.com' });
```

## Usage

### Server-Side Logging

Use in server actions, API routes, and any server-side code:

```typescript
import { logger } from '@eptss/logger/server';

export async function myServerAction(formData: FormData) {
  try {
    logger.info('Processing request', { userId: 'user123' });

    // Your logic here

    logger.info('Request completed successfully');
    return { status: 'Success' };
  } catch (error) {
    logger.error('Request failed', { error });
    return { status: 'Error', message: 'Something went wrong' };
  }
}
```

### Client-Side Logging

Use in React components and client-side code:

```typescript
'use client';

import { logger } from '@eptss/logger/client';

export function MyComponent() {
  const handleClick = () => {
    logger.interaction('button_clicked', {
      buttonName: 'submit',
      timestamp: Date.now()
    });
  };

  useEffect(() => {
    logger.pageView('/dashboard');
  }, []);

  return <button onClick={handleClick}>Submit</button>;
}
```

## API Reference

### Server Logger

#### Methods

- **`logger.debug(message, data?)`** - Debug logs (dev only)
- **`logger.info(message, data?)`** - Informational logs
- **`logger.warn(message, data?)`** - Warning logs
- **`logger.error(message, data?)`** - Error logs
- **`logger.action(actionName, status, data?)`** - Server action tracking

#### Context Management

```typescript
import { setContext, generateRequestId } from '@eptss/logger/server';

// Set context for the current request
setContext({
  requestId: generateRequestId(),
  userId: 'user123',
  metadata: { route: '/api/users' }
});

// All subsequent logs in this async context will include this data
logger.info('Processing request'); // Will include requestId and userId
```

### Client Logger

#### Methods

- **`logger.debug(message, data?)`** - Debug logs (dev only)
- **`logger.info(message, data?)`** - Informational logs
- **`logger.warn(message, data?)`** - Warning logs
- **`logger.error(message, data?)`** - Error logs
- **`logger.interaction(action, data?)`** - User interaction tracking
- **`logger.pageView(path, data?)`** - Page view tracking

#### Context Management

```typescript
import { logger } from '@eptss/logger/client';

// Set user context
logger.setContext({
  userId: 'user123',
  email: 'user@example.com'
});

// All subsequent logs will include this context
logger.info('User logged in');

// Clear context (e.g., on logout)
logger.clearContext();
```

## Examples

### Server Action with Logging

```typescript
'use server';

import { logger } from '@eptss/logger/server';
import { revalidatePath } from 'next/cache';

export async function signupForRound(formData: FormData) {
  const userId = formData.get('userId');
  const roundId = formData.get('roundId');

  logger.action('signupForRound', 'started', { userId, roundId });

  try {
    // Validate input
    if (!userId || !roundId) {
      logger.warn('Invalid signup attempt', { userId, roundId });
      return { status: 'Error', message: 'Invalid input' };
    }

    // Perform signup
    await db.insert(signups).values({ userId, roundId });

    logger.action('signupForRound', 'completed', { userId, roundId });

    revalidatePath('/rounds');
    return { status: 'Success' };
  } catch (error) {
    logger.action('signupForRound', 'failed', {
      userId,
      roundId,
      error
    });
    return { status: 'Error', message: 'Signup failed' };
  }
}
```

### API Route with Context

```typescript
import { logger, setContext, generateRequestId } from '@eptss/logger/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Set request context
  setContext({
    requestId: generateRequestId(),
    metadata: {
      path: request.nextUrl.pathname,
      method: request.method
    }
  });

  logger.info('API request received');

  try {
    const data = await fetchData();
    logger.info('API request completed');
    return NextResponse.json(data);
  } catch (error) {
    logger.error('API request failed', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Client Component with Error Boundary

```typescript
'use client';

import { logger } from '@eptss/logger/client';
import { useEffect } from 'react';

export function ErrorBoundary({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to monitoring services
    logger.error('Component error boundary triggered', {
      error: error.message,
      stack: error.stack,
      componentStack: error.stack
    });
  }, [error]);

  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Form Submission with Logging

```typescript
'use client';

import { logger } from '@eptss/logger/client';
import { useState } from 'react';

export function SignupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    logger.interaction('form_submit_started', { form: 'signup' });
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await signupAction(formData);

      if (result.status === 'Success') {
        logger.info('Signup successful');
      } else {
        logger.warn('Signup failed', { reason: result.message });
      }
    } catch (error) {
      logger.error('Signup error', { error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

## Environment Variables

The logger automatically uses these environment variables if available:

### Required for All Environments
- `NODE_ENV` - Determines dev vs production behavior

### Client-Side (Browser)
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog **client-side** API key (starts with `phx_`)
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host (defaults to `https://us.posthog.com`)

### Server-Side (Production Only)
- `POSTHOG_SERVER_API_KEY` - PostHog **server-side** API key (different from client key!)
  - **Important**: This is a DIFFERENT key than `NEXT_PUBLIC_POSTHOG_KEY`
  - Only used in production for server-side event tracking
  - Optional - if not set, server events won't be sent to PostHog (Sentry will still work)

### Sentry
Sentry is auto-configured by Next.js (`@sentry/nextjs`) - no additional env vars needed.

## How It Works

### Development Mode
- Logs are pretty-printed to console with emojis
- Debug logs are visible
- No external service calls

### Production Mode
- **Server**: JSON logs to console (CloudWatch), events to Sentry + PostHog
- **Client**: Warnings/errors to console, all events to Sentry + PostHog
- Debug logs are suppressed

## Best Practices

### ✅ DO

```typescript
// Use structured data
logger.info('User signed up', { userId, email, timestamp });

// Include error objects
logger.error('Database error', { error });

// Use appropriate log levels
logger.debug('Detailed debug info');  // Dev only
logger.info('Normal operation');      // Important events
logger.warn('Recoverable issue');     // Potential problems
logger.error('Critical failure');     // Must investigate

// Set context at request boundaries
setContext({ requestId, userId });
```

### ❌ DON'T

```typescript
// Don't use console.log directly
console.log('User signed up'); // ❌

// Don't log sensitive data
logger.info('User logged in', { password: '...' }); // ❌

// Don't log everything
logger.info('Incrementing counter'); // ❌ Too noisy

// Don't block on logging
await logger.info('...'); // ❌ Logger is fire-and-forget
```

## Migration Guide

### From Console Logs

```typescript
// Before
console.log('User signed up', userId);
console.error('Error:', error);

// After
import { logger } from '@eptss/logger/server';
logger.info('User signed up', { userId });
logger.error('Operation failed', { error });
```

### From Old Data-Access Logger

```typescript
// Before
import { logger } from '@eptss/data-access/utils/logger';

// After
import { logger } from '@eptss/logger/server';
// API is the same, just new import path
```

## Troubleshooting

### PostHog 401 Errors

**Problem**: Getting 401 Unauthorized errors when PostHog tries to send events.

**Cause**: Using the wrong API key for server-side PostHog.

**Solution**:
- **Client-side** uses `NEXT_PUBLIC_POSTHOG_KEY` (public key, starts with `phx_`)
- **Server-side** needs `POSTHOG_SERVER_API_KEY` (private key, different from client key)

**To fix**:
1. Get your server-side API key from PostHog dashboard (Project Settings → API Keys)
2. Add to your production environment: `POSTHOG_SERVER_API_KEY=your_server_key`
3. **Or** disable server-side PostHog by not setting this variable (Sentry will still work)

**In Development**:
- Server logger doesn't send to PostHog in dev mode anyway (only logs to console)
- So you won't see this error in development

### Logs Not Appearing in Production

1. Check environment variables are set correctly
2. Verify Sentry/PostHog are initialized
3. Check CloudWatch logs (server) or browser console (client)

### TypeScript Errors

Make sure you're importing from the correct path:
- Server: `@eptss/logger/server`
- Client: `@eptss/logger/client`
- Types: `@eptss/logger/types`

### PostHog Not Tracking (Client-Side)

Ensure PostHog is initialized in your app. The logger package provides an initialization helper:

**Option 1: Use Next.js instrumentation (Recommended)**
```typescript
// apps/web/instrumentation-client.ts
import { initPostHog } from '@eptss/logger/client';

initPostHog();
```

**Option 2: Initialize in root layout**
```typescript
// app/layout.tsx
'use client';
import { initPostHog } from '@eptss/logger/client';
import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <html>{children}</html>;
}
```

## Contributing

See the main [EPTSS monorepo documentation](../../README.md) for contribution guidelines.

## License

Private - EPTSS Project
