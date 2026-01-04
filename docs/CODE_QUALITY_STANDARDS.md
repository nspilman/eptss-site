# Code Quality Standards

## Overview

This document establishes code quality standards for the EPTSS codebase to ensure consistency, maintainability, and production readiness.

## 1. Logging Standards

### ✅ Use the Logger Framework

**DO:** Use `@eptss/logger` for all logging

```typescript
// Server-side
import { logger } from '@eptss/logger/server';

logger.debug('Debug information', { context: 'data' });
logger.info('Informational message', { userId });
logger.warn('Warning message', { issue: 'description' });
logger.error('Error occurred', { error: err.message });
```

```typescript
// Client-side
import { logger } from '@eptss/logger/client';

logger.debug('User clicked button', { buttonId: 'submit' });
logger.info('Page loaded', { path: window.location.pathname });
logger.warn('Slow network detected', { latency: 5000 });
logger.error('Request failed', { error: err.message, endpoint: '/api/data' });
```

**DON'T:** Use console.log/warn/error directly

```typescript
// ❌ BAD
console.log('[Component] Some debug info:', data);
console.error('Error:', error);

// ✅ GOOD
logger.debug('Debug info', { component: 'Component', data });
logger.error('Error occurred', { error: error.message, component: 'Component' });
```

### Logger Benefits

1. **Environment-Aware**
   - Debug logs automatically disabled in production
   - Structured JSON in production for CloudWatch/log aggregation
   - Pretty printing in development

2. **Integration**
   - Automatically sends errors to Sentry
   - Sends events to PostHog for analytics
   - Includes request context (requestId, userId)

3. **Type-Safe**
   - Strong typing for log data
   - Consistent structure across codebase

### Fixed Instances

**Server-Side (bucket-storage/storageService.ts):**
- ✅ Replaced `console.log('[storageService] uploadFile called...')` with `logger.debug()`
- ✅ Replaced `console.error('Upload error:...')` with `logger.error()`
- ✅ Added structured data to all logs

**Client-Side (media-upload):**
- ✅ Removed debug `console.log` statements from MediaUploader.tsx
- ✅ Replaced `console.error('[AudioPreview] WaveSurfer error')` with `logger.error()`

## 2. Null vs Undefined Handling

### The Problem

Inconsistent use of `null` and `undefined` makes code harder to reason about:

```typescript
// Inconsistent patterns
coverImageUrl: coverImageUrl || null     // Returns null for falsy values
coverImageUrl: results[0].url           // Could be undefined
coverImageUrl: results[0]?.url ?? null  // Explicitly null
```

### Standard: Prefer Undefined

**Rationale:**
1. TypeScript optional properties use `undefined`
2. Function parameters default to `undefined`
3. Destructuring uses `undefined`
4. Less explicit checks needed

**DO:** Use `undefined` for optional/missing values

```typescript
// ✅ GOOD - TypeScript interface
interface Submission {
  audioFileUrl: string;
  coverImageUrl?: string;  // undefined when not provided
}

// ✅ GOOD - Optional parameter
function upload(file: File, metadata?: Record<string, unknown>) {
  // metadata is undefined if not provided
}

// ✅ GOOD - Nullish coalescing
const imageUrl = data.coverImageUrl ?? undefined;

// ✅ GOOD - Optional chaining
const url = results[0]?.url;  // undefined if results[0] doesn't exist
```

**WHEN TO USE NULL:**

Use `null` only when explicitly representing "no value" vs "not set":

```typescript
// ✅ Use null for database fields that can be explicitly empty
interface DBSubmission {
  id: number;
  audioFileUrl: string;
  coverImageUrl: string | null;  // null = user chose not to provide, vs column doesn't exist
}

// ✅ Use null for API responses matching external contracts
interface APIResponse {
  data: Data | null;  // null = no data, vs request failed
  error: Error | null;  // null = no error, vs success
}
```

### Migration Strategy

**Phase 1: New Code (Immediate)**
- All new code uses `undefined` for optional values
- Use `null` only for explicit database/API contracts

**Phase 2: Existing Code (Gradual)**
- Fix on touch: when modifying code, standardize to `undefined`
- Document any remaining `null` usage with comments

### Examples

**Before (Inconsistent):**
```typescript
// submission Service.ts
coverImageUrl: coverImageUrl || null,  // Could be null or undefined
coverImagePath: coverImagePath || null,

// uploadQueue.ts
const result = await uploadFile(item);  // Returns UploadResult | null
if (result) uploadResults.push(result);
```

**After (Consistent):**
```typescript
// submissionService.ts
coverImageUrl: coverImageUrl ?? undefined,
coverImagePath: coverImagePath ?? undefined,

// uploadQueue.ts
const result = await uploadFile(item);  // Returns UploadResult | undefined
if (result) uploadResults.push(result);
```

## 3. Component Prop Validation

### The Problem

Optional props without validation can cause runtime errors:

```typescript
interface AudioPreviewProps {
  file?: File;
  src?: string;
  // Neither required, but at least one should be!
}
```

### Standard: Validate Mutually Exclusive Props

**DO:** Add runtime validation for prop requirements

```typescript
export const AudioPreview: React.FC<AudioPreviewProps> = ({
  file,
  src,
  ...props
}) => {
  // Validate props at runtime
  if (!file && !src) {
    logger.error('AudioPreview requires either file or src prop');
    throw new Error('AudioPreview: Either file or src prop is required');
  }

  // Rest of component...
};
```

**Alternative: Use TypeScript Union Types**

```typescript
// Make props mutually exclusive at type level
type AudioPreviewProps =
  | { file: File; src?: never }
  | { file?: never; src: string };

// TypeScript will enforce: must provide exactly one
<AudioPreview file={file} />       // ✓
<AudioPreview src={url} />         // ✓
<AudioPreview file={file} src={url} />  // ✗ Type error
<AudioPreview />                   // ✗ Type error
```

### Fixed Instances

**AudioPreview Component:**
- ✅ Added runtime validation for `file` or `src` props
- ✅ Logs error before throwing for debugging
- ✅ Provides clear error message

## 4. Error Handling Standards

### Structured Error Information

**DO:** Include context in error logs

```typescript
try {
  await uploadFile(bucket, path, file);
} catch (error) {
  logger.error('Upload failed', {
    bucket,
    path,
    fileSize: file.size,
    fileName: file.name,
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  throw error;
}
```

**DON'T:** Log errors without context

```typescript
// ❌ BAD
catch (error) {
  console.error('Error:', error);
}
```

### Error Boundaries

For React components that might error, use Error Boundaries:

```typescript
class AudioPreviewErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('AudioPreview crashed', {
      error: error.message,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return <div>Audio preview failed to load</div>;
    }
    return this.props.children;
  }
}
```

## 5. Development vs Production Code

### Feature Flags for Debug Code

**DO:** Use environment checks for debug code

```typescript
if (process.env.NODE_ENV === 'development') {
  logger.debug('Detailed debug info', { complexData });
}
```

**DON'T:** Leave debug code in production

```typescript
// ❌ BAD - always runs
console.log('Debug:', data);

// ✅ GOOD - auto-filtered by logger
logger.debug('Debug info', { data });
```

### Source Maps

Ensure source maps are:
- ✅ Enabled in development for debugging
- ✅ Uploaded to Sentry in production for error tracking
- ❌ Not served publicly in production (security)

## Checklist for Code Quality

Before committing code, verify:

- [ ] No `console.log/warn/error` statements (use logger)
- [ ] Consistent use of `undefined` (not `null`) for optional values
- [ ] Runtime validation for complex prop requirements
- [ ] Structured error logging with context
- [ ] Debug code behind environment checks
- [ ] TypeScript strict mode enabled
- [ ] No `any` types (use `unknown` if needed)
- [ ] Error boundaries for components that might fail

## Tools

### ESLint Rules

Add to `.eslintrc`:

```json
{
  "rules": {
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "@typescript-  strict-null-checks": "error",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

### Pre-commit Hooks

```bash
# Check for console.log
git diff --cached | grep -i 'console\.log' && echo "❌ Remove console.log" && exit 1

# Run type check
npm run type-check || exit 1
```

## Related Documentation

- [Logging Framework](../packages/logger/README.md)
- [Schema Validation Standards](./SCHEMA_VALIDATION_STANDARDS.md)
- [Audio Duration Storage](./AUDIO_DURATION_STORAGE.md)
- [Orphan File Cleanup](./ORPHAN_FILE_CLEANUP.md)
- [File Security Standards](./FILE_SECURITY_STANDARDS.md)
