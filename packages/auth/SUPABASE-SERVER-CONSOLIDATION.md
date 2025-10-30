# Supabase Server Utilities Consolidation

## Problem

The same Supabase server utilities (`createClient`, `getAuthUser`, `getHeaders`) were duplicated across three locations:
1. `apps/web/utils/supabase/server.ts`
2. `packages/data-access/src/utils/supabase/server.ts`
3. `packages/auth/src/utils/getAuthUser.ts`

This led to:
- Code duplication
- Maintenance burden (changes needed in 3 places)
- Risk of inconsistencies
- Larger bundle sizes

## Solution

Centralized all Supabase server utilities in the `@eptss/auth` package, which is the logical home for authentication-related code.

### New Structure

```
packages/auth/src/utils/
├── supabase-server.ts    # ✨ NEW: Centralized implementation
├── getAuthUser.ts        # Re-exports from supabase-server
└── isAdmin.ts
```

### New Export Path

The auth package now exports a `/server` path:

```typescript
import { createClient, getAuthUser, getHeaders } from '@eptss/auth/server';
```

## Implementation

### 1. Created Centralized Module
**File**: `packages/auth/src/utils/supabase-server.ts`

Contains the single source of truth for:
- `createClient<DB>()` - Creates Supabase server client with cookie handling
- `getAuthUser()` - Gets authenticated user from Supabase
- `getHeaders()` - Gets all request headers

### 2. Updated Package Exports
**File**: `packages/auth/package.json`

Added new export path:
```json
"./server": {
  "import": "./src/utils/supabase-server.ts",
  "types": "./src/utils/supabase-server.ts"
}
```

### 3. Updated Consumers

All three locations now re-export from the centralized module:

#### `packages/auth/src/utils/getAuthUser.ts`
```typescript
export { getAuthUser } from './supabase-server';
```

#### `packages/data-access/src/utils/supabase/server.ts`
```typescript
import { createClient as createAuthClient, getAuthUser, getHeaders } from '@eptss/auth/server';
import type { Database } from '../../types/database';

export async function createClient() {
  return createAuthClient<Database>();
}

export { getAuthUser, getHeaders };
```

#### `apps/web/utils/supabase/server.ts`
```typescript
import { createClient as createAuthClient, getAuthUser, getHeaders } from '@eptss/auth/server';
import type { Database } from '@/types/database';

export async function createClient() {
  return createAuthClient<Database>();
}

export { getAuthUser, getHeaders };
```

## Benefits

1. **Single Source of Truth**: Implementation exists in one place only
2. **Type Safety**: Each consumer can provide their own Database type
3. **Backward Compatible**: Existing imports still work
4. **Easier Maintenance**: Changes only needed in one file
5. **Reduced Duplication**: ~100 lines of code eliminated
6. **Better Organization**: Auth utilities live in auth package

## Usage

### Direct Import (Recommended for new code)
```typescript
import { createClient, getAuthUser } from '@eptss/auth/server';

const user = await getAuthUser();
const supabase = await createClient();
```

### Via Existing Paths (Backward compatible)
```typescript
// Still works - re-exports from @eptss/auth/server
import { getAuthUser } from '@eptss/data-access/utils/supabase/server';
import { createClient } from '@/utils/supabase/server';
```

## Type Safety

Each location can still provide its own Database type:

```typescript
// In data-access package
const client = await createClient(); // Returns SupabaseClient<DataAccessDatabase>

// In web app
const client = await createClient(); // Returns SupabaseClient<WebAppDatabase>
```

The centralized `createClient` accepts a generic type parameter, allowing each consumer to specify their schema.

## Migration Guide

### For New Code
Use the centralized import:
```typescript
import { createClient, getAuthUser } from '@eptss/auth/server';
```

### For Existing Code
No changes needed! All existing imports continue to work through re-exports.

### If You Need Custom Database Type
```typescript
import { createClient } from '@eptss/auth/server';
import type { MyDatabase } from './types';

const client = await createClient<MyDatabase>();
```

## Files Changed

- ✨ **Created**: `packages/auth/src/utils/supabase-server.ts`
- 📝 **Updated**: `packages/auth/package.json` (added `/server` export)
- 📝 **Updated**: `packages/auth/src/utils/getAuthUser.ts` (now re-exports)
- 📝 **Updated**: `packages/data-access/src/utils/supabase/server.ts` (now re-exports)
- 📝 **Updated**: `apps/web/utils/supabase/server.ts` (now re-exports)

## Testing

All existing functionality should work exactly as before. Test:
1. Authentication flows
2. Data fetching with Supabase
3. Server components using `getAuthUser()`
4. Any code importing from the old paths

## Future Enhancements

Potential improvements:
- Add session management utilities
- Add auth state helpers
- Add role-based access control utilities
- Add token refresh utilities

All can be added to the centralized `@eptss/auth/server` module.
