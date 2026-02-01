# CPU Optimization Plan

## Overview

This document outlines the plan to reduce high Vercel CPU usage in the EPTSS Next.js application. Despite having only ~10 users, the application exhibits unexpectedly high CPU consumption due to inefficient patterns in polling, database queries, SSR, and middleware.

**Estimated Total CPU Reduction:** 50-70%

---

## Implementation Status

**Last Updated:** Week 1-3 Complete

### ✅ Completed (Week 1 + Week 2 + Week 3)

| Task | File(s) | Impact |
|------|---------|--------|
| Increase notification poll interval (30s → 5min) | `NotificationBell.tsx` | HIGH |
| Add visibility-based polling (pause when tab hidden) | `NotificationBell.tsx` | HIGH |
| Add focus-based refresh (fetch on tab focus) | `NotificationBell.tsx` | MEDIUM |
| Fix `getUnreadCount` to use SQL COUNT | `notificationService.ts` | MEDIUM |
| Fix `getAllNotificationsCount` to use SQL COUNT | `notificationService.ts` | LOW |
| Add cache headers to notification APIs (30s cache) | `/api/notifications/*` | MEDIUM |
| Add cache headers to round APIs (60s/300s cache) | `/api/round*` routes | MEDIUM |
| Remove `isDashboard` from middleware | `middleware.ts` | MEDIUM |
| Remove debug console.logs from hot paths | `data-fetchers.ts`, wrappers, dashboard | LOW |
| Add React cache() to `getAuthUser` | `supabase-server.ts` | MEDIUM |
| Add React cache() to `getCurrentUsername` | `supabase-server.ts` | LOW |
| Add React cache() to `getUserProfileForHeader` | `supabase-server.ts` | MEDIUM |
| Deduplicate auth calls in getUserProfileForHeader | `supabase-server.ts` | MEDIUM |
| Create combined `getLayoutUserData` function | `supabase-server.ts` | HIGH |
| Update root layout to use `getLayoutUserData` | `layout.tsx` | HIGH |
| Parallelize profile + projects fetch | `supabase-server.ts` | MEDIUM |

### ⚠️ Deferred (Requires Larger Refactor)

| Task | File(s) | Notes |
|------|---------|-------|
| Dashboard ISR configuration | Dashboard pages | User-specific data mixed throughout; needs Suspense boundaries |
| Implement partial prerendering | Dashboard pages | Next.js 14+ feature |

### 📋 Pending (Week 4 - Optional)

| Task | Priority | Notes |
|------|----------|-------|
| Supabase Realtime for notifications | MEDIUM | Eliminates polling entirely |

---

## Issue 1: Notification Polling Every 30 Seconds

### What Is Expensive

**Location:** `apps/web/components/notifications/NotificationBell.tsx:118-124`

```typescript
useEffect(() => {
  fetchNotifications();
  fetchUnreadCount();
  const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
  return () => clearInterval(interval);
}, []);
```

**Cost Breakdown:**

Each poll triggers this chain:
1. **Client:** Fetches `/api/notifications/unread-count`
2. **API Route:** Calls `getAuthUser()` which:
   - Creates a new Supabase server client
   - Calls `supabase.auth.getUser()` (network call to Supabase to validate JWT)
3. **API Route:** Calls `getUnreadCount(userId)` which:
   - Opens a database connection from the pool
   - Executes a SELECT query fetching ALL columns
   - Returns rows to Node.js where `.length` is computed

**CPU Impact Calculation:**
- 10 users × 1 browser tab each × 2 polls/minute = **20 API invocations/minute**
- If users have multiple tabs: 10 users × 3 tabs × 2 polls/minute = **60 API invocations/minute**
- Each invocation: ~50-100ms of CPU time
- **Result:** 3-6 seconds of CPU time per minute just for notification polling

**Additional Problems:**
- Polling continues even when the browser tab is in the background
- Polling continues even when the notification dropdown is closed
- No exponential backoff on errors

### Detailed Fix Plan

#### Step 1: Increase Poll Interval to 5 Minutes

```typescript
// apps/web/components/notifications/NotificationBell.tsx

// Change from:
const interval = setInterval(fetchUnreadCount, 30000);

// Change to:
const interval = setInterval(fetchUnreadCount, 300000); // 5 minutes
```

#### Step 2: Add Visibility-Based Polling

Only poll when the user is actively viewing the tab:

```typescript
useEffect(() => {
  // Initial fetch
  fetchNotifications();
  fetchUnreadCount();

  // Visibility-aware polling
  let interval: NodeJS.Timeout | null = null;

  const startPolling = () => {
    if (!interval) {
      interval = setInterval(fetchUnreadCount, 300000); // 5 minutes
    }
  };

  const stopPolling = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // Fetch immediately when tab becomes visible
      fetchUnreadCount();
      startPolling();
    } else {
      stopPolling();
    }
  };

  // Start polling if tab is visible
  if (document.visibilityState === 'visible') {
    startPolling();
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    stopPolling();
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);
```

#### Step 3: Add Focus-Based Immediate Refresh

Refresh when user returns to the tab after being away:

```typescript
const handleFocus = () => {
  fetchUnreadCount();
};

window.addEventListener('focus', handleFocus);
// Add to cleanup
```

### Ensuring No Breakage

1. **Manual Testing:**
   - Verify notification badge updates when new notifications arrive
   - Verify badge count is accurate after 5 minutes
   - Verify immediate update when switching back to tab
   - Test with notification dropdown open/closed

2. **Behavior Verification:**
   - Open DevTools Network tab
   - Confirm `/api/notifications/unread-count` is NOT called every 30 seconds
   - Confirm it IS called when switching tabs back
   - Confirm it IS called every 5 minutes when tab is active

3. **Edge Cases to Test:**
   - Multiple browser tabs open
   - Background tab behavior
   - Network disconnection and reconnection
   - User receives notification while viewing the page

### Phase 2: Upgrade to Supabase Realtime (Future Enhancement)

After implementing the quick polling fix, consider upgrading to Supabase Realtime for instant notifications without additional infrastructure costs.

#### Why Supabase Realtime?

| Option | Pros | Cons |
|--------|------|------|
| **Polling (current fix)** | Simple, no new infrastructure | Up to 5 min delay |
| **Supabase Realtime** | Instant, already using Supabase | Slightly more complex |
| **Third-party (Pusher/Ably)** | Feature-rich | Additional cost ($25-50/mo), new service |
| **Self-hosted WebSocket** | Full control | Vercel incompatible, needs separate hosting |

Supabase Realtime is the sweet spot: real-time updates using infrastructure you already pay for.

#### Prerequisites

1. **Enable Realtime on the notifications table:**

```sql
-- Run this migration or execute in Supabase SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

2. **Verify RLS policies allow subscriptions:**

Your existing RLS policies should work. Users can only subscribe to their own notifications because the filter includes `user_id=eq.${userId}`.

3. **Check Supabase plan limits:**
   - Free tier: 200 concurrent realtime connections
   - Pro tier: 500 concurrent realtime connections
   - For ~10 users with multiple tabs, you're well within limits

#### Implementation Plan

##### Step 1: Create Supabase Client-Side Hook

```typescript
// apps/web/hooks/useNotificationSubscription.ts
"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseNotificationSubscriptionProps {
  userId: string;
  onNewNotification: () => void;
  onNotificationRead: () => void;
}

export function useNotificationSubscription({
  userId,
  onNewNotification,
  onNotificationRead,
}: UseNotificationSubscriptionProps) {
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log("New notification received:", payload.new);
            onNewNotification();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            // Check if notification was marked as read
            if (payload.new.is_read && !payload.old.is_read) {
              onNotificationRead();
            }
          }
        )
        .subscribe((status) => {
          console.log("Notification subscription status:", status);
        });
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, onNewNotification, onNotificationRead]);
}
```

##### Step 2: Update NotificationBell Component

```typescript
// apps/web/components/notifications/NotificationBell.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button, Popover, PopoverTrigger, PopoverContent, Badge } from "@eptss/ui";
import { NotificationDropdown } from "./NotificationDropdown";
import { useNotificationSubscription } from "@/hooks/useNotificationSubscription";
import type { Notification } from "@eptss/db";

interface NotificationBellProps {
  userId: string; // Pass from server component
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/unread-count");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notifications?limit=10");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to realtime updates
  useNotificationSubscription({
    userId,
    onNewNotification: () => {
      // Optimistically increment count, then fetch accurate data
      setUnreadCount((prev) => prev + 1);
      // Optionally fetch full notification list if dropdown is open
      if (isOpen) {
        fetchNotifications();
      }
    },
    onNotificationRead: () => {
      // Refetch count when a notification is marked as read
      fetchUnreadCount();
    },
  });

  // Initial fetch on mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // ... rest of component (markAsRead, markAllAsRead, deleteNotification, render)
}
```

##### Step 3: Pass userId from Server Component

```typescript
// apps/web/app/layouts/DashboardLayout.tsx (or wherever NotificationBell is rendered)

import { getAuthUser } from "@eptss/auth/server";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export default async function DashboardLayout({ children }) {
  const { userId } = await getAuthUser();

  return (
    <div>
      <header>
        {userId && <NotificationBell userId={userId} />}
      </header>
      {children}
    </div>
  );
}
```

#### Handling Edge Cases

##### Reconnection Logic

Supabase Realtime handles reconnection automatically, but you can add explicit handling:

```typescript
.subscribe((status, err) => {
  if (status === "SUBSCRIBED") {
    console.log("Connected to notification updates");
  }
  if (status === "CHANNEL_ERROR") {
    console.error("Subscription error:", err);
    // Fallback to polling temporarily
    setTimeout(fetchUnreadCount, 5000);
  }
  if (status === "TIMED_OUT") {
    console.warn("Subscription timed out, reconnecting...");
  }
});
```

##### Fallback for Connection Issues

Keep a lightweight fallback poll for reliability:

```typescript
useEffect(() => {
  // Fallback: poll every 5 minutes in case realtime connection drops
  const fallbackInterval = setInterval(() => {
    fetchUnreadCount();
  }, 300000);

  return () => clearInterval(fallbackInterval);
}, [fetchUnreadCount]);
```

##### Tab Visibility Optimization

Pause subscription when tab is hidden to save resources:

```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      // Could pause subscription here if needed
      // For Supabase, the connection is lightweight enough to keep alive
    } else {
      // Refetch on tab focus to catch any missed updates
      fetchUnreadCount();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
}, [fetchUnreadCount]);
```

#### Ensuring No Breakage

1. **Realtime Connection Testing:**
   - Open browser DevTools → Network → WS tab
   - Verify WebSocket connection to Supabase is established
   - Check for `realtime` connection in Supabase dashboard

2. **Notification Delivery Testing:**
   - Open two browser windows (same user)
   - Trigger a notification (e.g., have another user comment)
   - Verify both windows update instantly
   - Verify badge count is accurate

3. **Subscription Filter Testing:**
   - Login as User A, open notifications
   - Trigger notification for User B
   - Verify User A does NOT receive User B's notification

4. **Reconnection Testing:**
   - Disconnect network briefly
   - Reconnect
   - Verify subscription resumes
   - Trigger a notification, verify it's received

5. **Performance Verification:**
   - Check Vercel function logs
   - `/api/notifications/unread-count` should only be called on initial load
   - No polling requests every 30 seconds

#### Migration Path

| Week | Action |
|------|--------|
| Week 1 | Implement polling fix (Steps 1-3 above) - immediate CPU relief |
| Week 2 | Add Supabase Realtime migration, enable on notifications table |
| Week 2 | Implement `useNotificationSubscription` hook |
| Week 3 | Update NotificationBell to use realtime + fallback polling |
| Week 3 | Test thoroughly, remove aggressive polling |
| Week 4 | Monitor, remove fallback polling if stable |

#### Estimated Effort

- **Database migration:** 15 minutes
- **Hook implementation:** 1-2 hours
- **Component updates:** 1-2 hours
- **Testing:** 2-3 hours
- **Total:** 4-6 hours

#### Cost Impact

- **No additional cost** - Supabase Realtime is included in your plan
- **Reduced Vercel costs** - Eliminates polling API calls entirely
- **Better UX** - Instant notification delivery

---

## Issue 2: Inefficient `getUnreadCount()` Database Query

### What Is Expensive

**Location:** `packages/core/src/services/notificationService.ts:200-217`

```typescript
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const unreadNotifications = await db
      .select()  // Fetches ALL columns: id, userId, type, title, message, metadata, isRead, isDeleted, createdAt, readAt
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
          eq(notifications.isDeleted, false)
        )
      );

    return unreadNotifications.length;  // Counting in JavaScript, not SQL
  } catch (error) {
    // ...
  }
}
```

**Cost Breakdown:**

1. **Network Transfer:** Each notification row contains:
   - `id`: UUID (36 bytes)
   - `userId`: UUID (36 bytes)
   - `type`: enum string (~20 bytes)
   - `title`: string (~50-100 bytes)
   - `message`: string (~200-500 bytes)
   - `metadata`: JSON string (~100-1000 bytes)
   - `isRead`, `isDeleted`: booleans
   - `createdAt`, `readAt`: timestamps

   **Per row:** ~500-1700 bytes transferred from DB to application

2. **Memory Allocation:** Node.js allocates memory for each row object

3. **CPU for Parsing:** PostgreSQL results are parsed into JavaScript objects

4. **Wasted Computation:** We only need a single integer (the count), but we're:
   - Fetching entire rows
   - Parsing JSON metadata
   - Building JavaScript objects
   - Then throwing it all away and just returning `.length`

**Example:** User with 50 unread notifications:
- Current: Fetch 50 rows × ~1KB = 50KB data transfer + object parsing
- Optimal: Fetch 1 integer = 8 bytes

### Detailed Fix Plan

#### Step 1: Use SQL COUNT Aggregation

```typescript
// packages/core/src/services/notificationService.ts

import { count } from 'drizzle-orm';

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
          eq(notifications.isDeleted, false)
        )
      );

    return result[0]?.count ?? 0;
  } catch (error) {
    logger.error("Failed to get unread count", { error, userId });
    return 0;
  }
}
```

#### Step 2: Verify Index Exists

The migration `0055_curious_sway.sql` already creates the optimal index:

```sql
CREATE INDEX "notifications_user_read_idx" ON "notifications"
  USING btree ("user_id", "is_deleted", "is_read");
```

This composite index perfectly matches our WHERE clause. Verify it's applied in production.

### Ensuring No Breakage

1. **Unit Test:**
```typescript
describe('getUnreadCount', () => {
  it('returns correct count for user with unread notifications', async () => {
    // Create 5 unread notifications for test user
    const count = await getUnreadCount(testUserId);
    expect(count).toBe(5);
  });

  it('returns 0 for user with no unread notifications', async () => {
    const count = await getUnreadCount(userWithNoNotifications);
    expect(count).toBe(0);
  });

  it('excludes deleted notifications', async () => {
    // Create notification then soft-delete it
    const count = await getUnreadCount(testUserId);
    expect(count).toBe(0);
  });

  it('excludes read notifications', async () => {
    // Create notification then mark as read
    const count = await getUnreadCount(testUserId);
    expect(count).toBe(0);
  });
});
```

2. **Manual Verification:**
   - Query the database directly: `SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = false AND is_deleted = false`
   - Compare with the API response
   - Verify the notification badge shows the correct number

3. **Performance Verification:**
   - Check Vercel function logs for reduced execution time
   - Expected reduction: 50-80% faster for this specific query

---

## Issue 3: Root Layout Auth + Database Calls on Every Page

### What Is Expensive

**Location:** `apps/web/app/layout.tsx:45-53`

```typescript
export default async function RootLayout({ children }) {
  const { userId } = await getAuthUser();           // Call 1: Supabase auth
  const userIsAdmin = userId ? await isAdmin() : false;  // Call 2: DB query
  const userProfile = userId ? await getUserProfileForHeader() : null;  // Call 3: Supabase auth + DB query
  const userProjects = userId ? await getUserProjects(userId) : [];  // Call 4: DB query
  // ...
}
```

**Cost Breakdown:**

The root layout executes on **every page navigation** in the application. For an authenticated user, each page load triggers:

| Call | Operation | Network Calls | DB Queries |
|------|-----------|---------------|------------|
| `getAuthUser()` | Validate JWT with Supabase | 1 | 0 |
| `isAdmin()` | Check admin status | 0 | 1 |
| `getUserProfileForHeader()` | Get user profile | 1 (redundant getUser) | 1 |
| `getUserProjects()` | Get user's projects | 0 | 1 |
| **Total** | | **2 Supabase calls** | **3 DB queries** |

**Redundancy Issue:**
`getUserProfileForHeader()` calls `supabase.auth.getUser()` internally, duplicating the work already done by `getAuthUser()`.

**Cascade Effect:**
- User navigates to `/dashboard` → Layout executes → 5 async operations
- User clicks to `/dashboard/profile` → Layout executes again → 5 more async operations
- User clicks to `/projects/cover/dashboard` → Layout executes again → 5 more async operations

Each navigation = ~200-400ms of server-side CPU time just for auth/user data that rarely changes.

### Detailed Fix Plan

#### Phase 1: Request-Level Deduplication with React `cache()`

Prevent redundant calls within the same request:

```typescript
// packages/auth/src/utils/supabase-server.ts

import { cache } from 'react';

// Wrap getAuthUser with cache for request deduplication
const getAuthUserInternal = async () => {
  const testUser = await getTestUserFromCookies();
  if (testUser) {
    return { userId: testUser.id, email: testUser.email };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return {
    userId: user?.id || '',
    email: user?.email || ''
  };
};

export const getAuthUser = cache(getAuthUserInternal);
```

```typescript
// packages/auth/src/utils/supabase-server.ts

// Update getUserProfileForHeader to reuse cached auth
export async function getUserProfileForHeader(): Promise<HeaderUserProfile | null> {
  const { userId, email } = await getAuthUser(); // Now uses cached value

  if (!userId) {
    return null;
  }

  const supabase = await createClient();
  const { data: userData } = await supabase
    .from('users')
    .select('username, profile_picture_url')
    .eq('userid', userId)
    .single();

  return {
    userId,
    email,
    username: userData?.username || null,
    profilePictureUrl: userData?.profile_picture_url || null,
  };
}
```

#### Phase 2: Combine Database Queries

Fetch all user data in a single query:

```typescript
// packages/auth/src/utils/supabase-server.ts

export interface LayoutUserData {
  userId: string;
  email: string;
  isAdmin: boolean;
  profile: {
    username: string | null;
    profilePictureUrl: string | null;
  } | null;
  projects: Array<{ id: string; slug: string; name: string }>;
}

export const getLayoutUserData = cache(async (): Promise<LayoutUserData | null> => {
  const { userId, email } = await getAuthUser();

  if (!userId) {
    return null;
  }

  const supabase = await createClient();

  // Single query with joins instead of 3 separate queries
  const { data } = await supabase
    .from('users')
    .select(`
      username,
      profile_picture_url,
      email,
      project_members (
        project:projects (
          id,
          slug,
          name
        )
      )
    `)
    .eq('userid', userId)
    .single();

  const isAdmin = email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return {
    userId,
    email,
    isAdmin,
    profile: data ? {
      username: data.username,
      profilePictureUrl: data.profile_picture_url,
    } : null,
    projects: data?.project_members?.map(pm => pm.project).filter(Boolean) || [],
  };
});
```

#### Phase 3: Update Root Layout

```typescript
// apps/web/app/layout.tsx

import { getLayoutUserData } from "@eptss/auth/server";

export default async function RootLayout({ children }) {
  const userData = await getLayoutUserData();

  return (
    <html lang="en">
      <body>
        <AuthStateListener>
          {userData ? (
            <DashboardLayout
              isAdmin={userData.isAdmin}
              userProfile={userData.profile}
              userProjects={userData.projects}
            >
              {children}
            </DashboardLayout>
          ) : (
            // Non-authenticated layout
          )}
        </AuthStateListener>
      </body>
    </html>
  );
}
```

### Ensuring No Breakage

1. **Component Props Verification:**
   - Verify `DashboardLayout` receives the same data shape
   - Verify `Header` component renders correctly
   - Verify admin routes still show/hide correctly

2. **Test Scenarios:**
   - Login flow: User logs in → redirected to dashboard → layout renders correctly
   - Admin access: Admin user sees admin links in sidebar
   - Project switching: User with multiple projects can switch between them
   - Profile display: Username and avatar appear in header

3. **Performance Verification:**
   - Add timing logs temporarily:
   ```typescript
   const start = Date.now();
   const userData = await getLayoutUserData();
   console.log(`Layout data fetched in ${Date.now() - start}ms`);
   ```
   - Compare before/after metrics in Vercel dashboard

4. **Rollback Plan:**
   - Keep old functions intact but deprecated
   - Feature flag to switch between old and new implementations

---

## Issue 4: API Routes Missing Cache Headers

### What Is Expensive

**Locations:**
- `apps/web/app/api/round-info/route.ts`
- `apps/web/app/api/round/current/route.ts`
- `apps/web/app/api/rounds/route.ts`

**Current Implementation:**
```typescript
export async function GET(request: NextRequest) {
  const round = await roundProvider({ projectId: COVER_PROJECT_ID });
  return NextResponse.json(round);  // No cache headers
}
```

**Cost Breakdown:**

These endpoints are called:
1. By the homepage (static page calls API during revalidation)
2. By client components that need round data
3. Potentially by crawlers/bots

Without cache headers:
- Every request hits the serverless function
- Every request executes `roundProvider()` which makes 3+ database queries
- Vercel edge network cannot cache responses

**What `roundProvider` does on each call:**
1. `getCurrentRound()` or `getRoundBySlug()` - DB query
2. `getProjectBySlug()` - DB query
3. `getVoteOptions()` - DB query
4. `getSubmissions()` - DB query
5. `getSignupsByRound()` - DB query

**Total:** 5 database queries per uncached API call

### Detailed Fix Plan

#### Step 1: Add Cache Headers to Round Info Route

```typescript
// apps/web/app/api/round-info/route.ts

import { roundProvider, COVER_PROJECT_ID } from "@eptss/core";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slugParam = searchParams.get('slug');

    const round = slugParam
      ? await roundProvider({ slug: slugParam, projectId: COVER_PROJECT_ID })
      : await roundProvider({ projectId: COVER_PROJECT_ID });

    return NextResponse.json(round, {
      headers: {
        // Cache for 60 seconds, allow stale for 5 minutes while revalidating
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching round info:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
```

#### Step 2: Add Cache Headers to Current Round Route

```typescript
// apps/web/app/api/round/current/route.ts

import { roundProvider, COVER_PROJECT_ID } from "@eptss/core";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const round = await roundProvider({ projectId: COVER_PROJECT_ID });

    return NextResponse.json(round, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching current round:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
```

#### Step 3: Add Cache Headers to Rounds List Route

```typescript
// apps/web/app/api/rounds/route.ts

import { COVER_PROJECT_ID } from "@eptss/core";
import { getCurrentAndPastRounds } from "@eptss/rounds/services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeCurrentRound = searchParams.get('excludeCurrentRound') === 'true';
    const projectId = searchParams.get('projectId') || COVER_PROJECT_ID;

    const roundsResult = await getCurrentAndPastRounds(projectId);

    if (roundsResult.status !== 'success') {
      return NextResponse.json(
        { error: 'Failed to fetch rounds' },
        { status: 500 }
      );
    }

    let rounds = roundsResult.data;
    if (excludeCurrentRound && rounds.length > 0) {
      rounds = rounds.slice(1);
    }

    const formattedRounds = rounds.map((round) => ({
      ...round,
      title: round.song?.title,
      artist: round.song?.artist,
    }));

    return NextResponse.json(
      { roundContent: formattedRounds },
      {
        headers: {
          // Rounds list changes less frequently, cache for 5 minutes
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching rounds:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
```

### Ensuring No Breakage

1. **Cache Behavior Verification:**
   ```bash
   # Check response headers
   curl -I https://your-site.vercel.app/api/round/current
   # Should see: Cache-Control: public, s-maxage=60, stale-while-revalidate=300
   ```

2. **Data Freshness Testing:**
   - Make a change to round data in admin
   - Verify the change appears within 60 seconds (cache TTL)
   - Verify stale data is served while revalidating

3. **Edge Cases:**
   - Phase transitions (signups → voting): Data should update within cache window
   - New round creation: API should return new round within 60 seconds

4. **Monitoring:**
   - Check Vercel Analytics for cache hit ratio
   - Target: >80% cache hits for these endpoints

---

## Issue 5: Dashboard Pages Force-Dynamic

### What Is Expensive

**Locations:**
- `apps/web/app/dashboard/page.tsx:9-10`
- `apps/web/app/projects/[projectSlug]/dashboard/page.tsx:15-16`

```typescript
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
```

**Cost Breakdown:**

These directives tell Next.js:
1. Never cache this page at build time
2. Never cache fetch requests made by this page
3. Execute full server-side rendering on every request

For the project dashboard, each request triggers `fetchHeroData()` which calls:
```typescript
const [currentRound, { roundDetails }, terminology, businessRules, project, projectConfig] = await Promise.all([
  roundProvider({ projectId }),           // 5 DB queries
  userParticipationProvider({ projectId }), // 2-3 DB queries
  getProjectTerminology(projectSlug),      // Config lookup
  getProjectBusinessRules(projectSlug),    // Config lookup
  getProjectBySlug(projectSlug),           // 1 DB query
  getProjectConfig(projectSlug),           // Config lookup
]);
```

**Total:** ~8-10 database queries per dashboard page load, with zero caching.

### Detailed Fix Plan

#### Phase 1: Identify What Actually Needs to Be Dynamic

| Data | Changes When | Can Be Cached |
|------|--------------|---------------|
| `currentRound` | Round phase changes | Yes (1-5 min) |
| `roundDetails` (user participation) | User signs up/votes/submits | No (user-specific) |
| `terminology` | Never (config) | Yes (indefinitely) |
| `businessRules` | Never (config) | Yes (indefinitely) |
| `project` | Rarely (admin changes) | Yes (5-10 min) |
| `projectConfig` | Rarely (admin changes) | Yes (5-10 min) |

#### Phase 2: Separate Static and Dynamic Data

```typescript
// apps/web/app/projects/[projectSlug]/dashboard/page.tsx

// Remove these:
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';

// Add ISR with reasonable revalidation:
export const revalidate = 60; // Revalidate every minute

export default async function ProjectDashboardPage({ params }) {
  const { projectSlug: slug } = await params;

  // Auth check - must be dynamic
  const { userId } = await getAuthUser();
  if (!userId) {
    redirect(`/login?redirect=/project/${slug}/dashboard`);
  }

  // Static/cacheable data - fetched with ISR
  const [heroData, participantsData] = await Promise.all([
    fetchHeroData(projectId, slug),
    fetchParticipantsData(projectId),
  ]);

  // User-specific data - fetched dynamically
  const userData = await getUserById(userId);

  // ...
}
```

#### Phase 3: Use Partial Prerendering (Next.js 14+)

If using Next.js 14+, leverage PPR to combine static and dynamic:

```typescript
import { Suspense } from 'react';

export default async function ProjectDashboardPage({ params }) {
  const { projectSlug: slug } = await params;

  // This part can be statically generated
  const [heroData, participantsData] = await Promise.all([
    fetchHeroData(projectId, slug),
    fetchParticipantsData(projectId),
  ]);

  return (
    <>
      {/* Static shell */}
      <DashboardShell heroData={heroData} participantsData={participantsData}>
        {/* Dynamic user-specific content */}
        <Suspense fallback={<UserDataSkeleton />}>
          <UserSpecificContent projectSlug={slug} />
        </Suspense>
      </DashboardShell>
    </>
  );
}

// This component is dynamically rendered
async function UserSpecificContent({ projectSlug }) {
  const { userId } = await getAuthUser();
  const userData = await getUserById(userId);
  // ...
}
```

### Ensuring No Breakage

1. **User-Specific Data Verification:**
   - Login as User A, check dashboard shows User A's data
   - Login as User B in incognito, verify User B's data (not cached User A data)
   - Verify "has signed up", "has voted", "has submitted" states are accurate per user

2. **Real-Time Data Testing:**
   - Sign up for a round, verify dashboard updates within 60 seconds
   - Submit a cover, verify status changes
   - Another user signs up, verify participant count updates

3. **Cache Isolation:**
   - Verify authenticated users don't see each other's cached data
   - Verify unauthenticated requests don't leak user data

4. **Performance Measurement:**
   - Measure TTFB (Time to First Byte) before and after
   - Target: 50%+ reduction in TTFB for dashboard pages

---

## Issue 6: `ensureUserExists` Called Excessively in Middleware

### What Is Expensive

**Location:** `packages/core/src/utils/supabase/middleware.ts:41-65`

```typescript
if (user) {
  const isAuthCallback = request.nextUrl.pathname.includes('/auth/callback');
  const isDashboard = request.nextUrl.pathname.includes('/dashboard');

  if (isAuthCallback || isDashboard || request.cookies.get('just_authenticated')) {
    console.log('Middleware: Ensuring user exists in database');
    const result = await ensureUserExists(user);
    // ...
  }
}
```

**Cost Breakdown:**

`ensureUserExists` is designed to create the user record on first login. However, it's currently called on:
1. Auth callback (correct - first login)
2. Every dashboard page visit (incorrect - user already exists)
3. When `just_authenticated` cookie is present (correct - immediate post-login)

The `isDashboard` condition causes a database query on every dashboard navigation for authenticated users.

**What `ensureUserExists` does:**
1. Query database to check if user exists
2. If not, insert new user record
3. Return success/failure

For existing users, this is a wasted SELECT query on every dashboard request.

### Detailed Fix Plan

#### Step 1: Remove `isDashboard` Condition

```typescript
// packages/core/src/utils/supabase/middleware.ts

if (user) {
  const isAuthCallback = request.nextUrl.pathname.includes('/auth/callback');

  // Only ensure user exists on auth callback or immediately after authentication
  // Remove isDashboard - users should already exist after auth callback
  if (isAuthCallback || request.cookies.get('just_authenticated')) {
    console.log('Middleware: Ensuring user exists in database');
    const result = await ensureUserExists(user);

    if (result.success) {
      if (isAuthCallback) {
        supabaseResponse.cookies.set('just_authenticated', 'true', {
          path: '/',
          maxAge: 10,
          httpOnly: true,
          secure: true,
          sameSite: 'lax'
        });
      }
    } else {
      console.error('Middleware: Failed to ensure user exists:', result.error);
    }
  }

  // Clear the just_authenticated cookie after it's been used
  if (request.cookies.get('just_authenticated') && !isAuthCallback) {
    supabaseResponse.cookies.delete('just_authenticated');
  }

  // ... rest of cookie setting
}
```

#### Step 2: Add Safety Net in Dashboard

Add a fallback check in the dashboard page itself (runs only if user somehow doesn't exist):

```typescript
// apps/web/app/projects/[projectSlug]/dashboard/page.tsx

const userData = await getUserById(userId);

if (!userData) {
  // Edge case: user authenticated but not in database
  // This should rarely happen with proper auth flow
  console.warn('User authenticated but not found in database, redirecting to complete profile');
  redirect('/auth/complete-profile');
}
```

### Ensuring No Breakage

1. **New User Registration Flow:**
   - Create a new account
   - Verify user record is created in database
   - Verify dashboard loads correctly
   - Verify user data (username, etc.) is persisted

2. **Existing User Login:**
   - Login with existing account
   - Verify no errors in console
   - Verify dashboard loads without the "Ensuring user exists" log message

3. **OAuth Flow Testing:**
   - Test Google OAuth login for new user
   - Test Google OAuth login for existing user
   - Verify user records are created correctly

4. **Monitoring:**
   - Add temporary logging to track how often `ensureUserExists` is called
   - After fix, should only see logs on auth callbacks

---

## Issue 7: Excessive Console Logging in Production

### What Is Expensive

**Found:** 143 `console.log`/`console.error` occurrences across 45 files in `apps/web/app/`

**Notable Locations:**
- `apps/web/app/dashboard/data-fetchers.ts` - 9 log statements
- `apps/web/app/projects/[projectSlug]/dashboard/page.tsx` - 6 log statements
- Various API routes

**Cost Breakdown:**

Each `console.log` in a serverless function:
1. Serializes the logged object to a string
2. Writes to stdout (I/O operation)
3. Vercel captures and stores the log (billable)
4. Adds latency to the request

**Example from data-fetchers.ts:**
```typescript
console.log('[fetchHeroData] Called with projectId:', projectId, 'projectSlug:', projectSlug);
// ... data fetching ...
console.log('[fetchHeroData] Fetched terminology:', JSON.stringify(terminology, null, 2));
// ... more code ...
console.log('[fetchHeroData] Returning heroData:', JSON.stringify(heroData, null, 2));
```

`JSON.stringify()` with pretty-printing is particularly expensive for large objects.

### Detailed Fix Plan

#### Step 1: Create a Logger Utility

```typescript
// packages/core/src/utils/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel as LogLevel];
}

export const logger = {
  debug: (...args: any[]) => {
    if (shouldLog('debug')) console.log('[DEBUG]', ...args);
  },
  info: (...args: any[]) => {
    if (shouldLog('info')) console.log('[INFO]', ...args);
  },
  warn: (...args: any[]) => {
    if (shouldLog('warn')) console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    if (shouldLog('error')) console.error('[ERROR]', ...args);
  },
};
```

#### Step 2: Replace Console Logs in Critical Paths

```typescript
// apps/web/app/dashboard/data-fetchers.ts

import { logger } from '@eptss/core/utils/logger';

export async function fetchHeroData(projectId: string, projectSlug: string) {
  logger.debug('[fetchHeroData] Called with projectId:', projectId);

  const [currentRound, ...] = await Promise.all([...]);

  logger.debug('[fetchHeroData] Fetched terminology:', terminology);

  // Remove verbose JSON.stringify in production
  if (process.env.NODE_ENV === 'development') {
    logger.debug('[fetchHeroData] Returning heroData:', JSON.stringify(heroData, null, 2));
  }

  return heroData;
}
```

#### Step 3: Batch Update Across Codebase

Use find/replace to update logging patterns:

```bash
# Find all console.log statements
grep -r "console.log" apps/web/app --include="*.ts" --include="*.tsx"

# Replace with logger calls (manual review required)
```

### Ensuring No Breakage

1. **Development Experience:**
   - Verify logs still appear in development
   - Verify helpful debugging info is available when needed

2. **Production Monitoring:**
   - Verify critical errors still get logged
   - Verify Vercel function logs show warnings and errors

3. **Error Tracking:**
   - Ensure error boundaries and catch blocks still log errors
   - Consider integrating with error tracking service (Sentry, etc.)

---

## Implementation Priority & Timeline

### Week 1: Quick Wins ✅ COMPLETED

| Task | File(s) | Time | Impact | Status |
|------|---------|------|--------|--------|
| Increase notification poll interval | `NotificationBell.tsx` | 30 min | HIGH | ✅ |
| Add visibility-based polling | `NotificationBell.tsx` | 1 hr | HIGH | ✅ |
| Fix `getUnreadCount` to use COUNT | `notificationService.ts` | 30 min | MEDIUM | ✅ |
| Add cache headers to round APIs | 3 route files | 1 hr | MEDIUM | ✅ |
| Add cache headers to notification APIs | 2 route files | 30 min | MEDIUM | ✅ |
| Remove `isDashboard` from middleware | `middleware.ts` | 30 min | LOW | ✅ |
| Remove debug console.logs from hot paths | `data-fetchers.ts`, wrappers | 1 hr | LOW | ✅ |

### Week 2: Medium Effort (Est. 8-12 hours)

| Task | File(s) | Time | Impact | Status |
|------|---------|------|--------|--------|
| Add React cache() to auth functions | `supabase-server.ts` | 2 hr | MEDIUM | ✅ |
| Remove debug console.logs from dashboard | Dashboard page.tsx | 30 min | LOW | ✅ |
| Dashboard ISR configuration | Dashboard pages | 4 hr | MEDIUM | ⚠️ Complex |
| Create logger utility | New file + updates | 2 hr | LOW | Deferred |

**Note on Dashboard ISR:** The dashboard pages contain user-specific data throughout (has signed up, has voted, has submitted). Converting to ISR requires restructuring with Suspense boundaries to separate static and dynamic content. The React cache() optimizations provide most of the benefit with less risk. Full ISR conversion deferred to Week 3.

### Week 3: Larger Refactor ✅ COMPLETED

| Task | File(s) | Time | Impact | Status |
|------|---------|------|--------|--------|
| Create `getLayoutUserData` combined query | `supabase-server.ts` | 4 hr | HIGH | ✅ |
| Update root layout to use new function | `layout.tsx` | 2 hr | HIGH | ✅ |
| Parallelize profile + projects fetch | `supabase-server.ts` | 1 hr | MEDIUM | ✅ |
| Implement partial prerendering | Dashboard pages | 4 hr | MEDIUM | ⚠️ Deferred |

**Note on Partial Prerendering:** Deferred along with Dashboard ISR. The `getLayoutUserData` optimization with parallel fetching and React cache() provides the primary benefit.

### Week 4: Supabase Realtime Upgrade (Est. 4-6 hours) - Optional

| Task | File(s) | Time | Impact | Status |
|------|---------|------|--------|--------|
| Enable Realtime on notifications table | SQL migration | 15 min | N/A | 📋 |
| Create `useNotificationSubscription` hook | New hook file | 1.5 hr | HIGH | 📋 |
| Update NotificationBell for realtime | `NotificationBell.tsx` | 1.5 hr | HIGH | 📋 |
| Add fallback polling + reconnection logic | `NotificationBell.tsx` | 1 hr | MEDIUM | 📋 |
| Testing + edge case handling | N/A | 2 hr | N/A | 📋 |

**Outcome:** Eliminates notification polling entirely. Instant notification delivery with zero recurring API calls.

### Legend
- ✅ = Completed
- 🔄 = In Progress
- 📋 = Pending

---

## Success Metrics

### Before Optimization
- Capture baseline metrics from Vercel dashboard:
  - Average function execution time
  - Total function invocations per day
  - CPU time billed

### After Optimization (Weeks 1-3)
Target improvements:
- **Function invocations:** 50% reduction (from reduced polling)
- **Average execution time:** 30% reduction (from caching + query optimization)
- **CPU time billed:** 50-70% reduction overall

### After Supabase Realtime (Week 4)
Additional improvements:
- **Notification API calls:** 95%+ reduction (only initial load, no polling)
- **User experience:** Instant notification delivery (<1 second vs up to 5 minutes)
- **WebSocket connections:** Monitor in Supabase dashboard (should be ~1 per active user)

### Monitoring Plan
1. Set up Vercel Analytics dashboard
2. Track key metrics weekly
3. Alert on regression (>20% increase in any metric)

---

## Rollback Plan

Each change should be:
1. Deployed separately (not bundled)
2. Monitored for 24-48 hours before next change
3. Easily revertable via Git revert

For larger refactors (root layout changes):
1. Use feature flags if possible
2. Keep old implementations available
3. Have database rollback scripts ready if schema changes are involved

---

## Phase 2: Architectural Improvements (QWAN-Inspired)

> *"The more living patterns there are in a place... the more it comes to life as an entirety."*
> — Christopher Alexander, *The Timeless Way of Building*

Beyond performance optimization, these improvements address architectural qualities that make the system more whole, legible, and alive.

### Guiding Principles

1. **Repair over replacement** - Fix at the source, not the symptom
2. **Strong centers** - Create single sources of truth that resolve forces
3. **Adaptive systems** - Code that breathes, rests, and responds to context
4. **Legibility** - The structure should be visible and understandable
5. **Meaning over magic** - Constants and patterns should express intent

---

### Phase 2.1: Cache Pattern Language

**Status:** ✅ Complete

**Problem:** Cache durations are magic numbers scattered across files without expressed meaning.

**Solution:** Create a vocabulary for caching tied to the *nature* of data.

| Pattern | Max Age | Stale While Revalidate | Use Case |
|---------|---------|------------------------|----------|
| `userAction` | 30s | 60s | Notifications, preferences |
| `roundPhase` | 60s | 300s | Current round, deadlines |
| `archival` | 300s | 600s | Past rounds, history |
| `configuration` | 600s | 1800s | Project config, terminology |
| `static` | 3600s | 7200s | About page, FAQ |

**Files Created/Updated:**
- ✅ `packages/core/src/cache/patterns.ts` - Pattern definitions and helpers
- ✅ `packages/core/src/cache/index.ts` - Exports
- ✅ `apps/web/app/api/notifications/route.ts` - Uses `userAction`
- ✅ `apps/web/app/api/notifications/unread-count/route.ts` - Uses `userAction`
- ✅ `apps/web/app/api/round-info/route.ts` - Uses `roundPhase`
- ✅ `apps/web/app/api/round/current/route.ts` - Uses `roundPhase`
- ✅ `apps/web/app/api/rounds/route.ts` - Uses `archival`

---

### Phase 2.2: Contextual Logging System

**Status:** 📋 Deferred

**Problem:** Debug logs were removed for performance, reducing system legibility.

**Solution:** Environment-aware logging that adapts to context - to be implemented when needed.

**Effort:** 3-4 hours when prioritized

---

### Phase 2.3: Session Corruption Diagnosis

**Status:** 📋 Pending

**Problem:** We detect and clear corrupted sessions but don't understand *why* corruption occurs.

**Goal:** Trace corruption to its source and heal it there.

**Investigation Steps:**
1. Add diagnostic logging to capture corruption patterns
2. Analyze: double-stringification, race conditions, library bugs
3. Fix at source or document why defensive code is necessary

**Effort:** 4-8 hours (investigation)

---

### Phase 2.4: Unified User Context

**Status:** 📋 Pending

**Problem:** Auth and user data fetched redundantly across components.

**Solution:** Single React context provider as "strong center" for user state.

```
Current (fragmented):
  RootLayout → getLayoutUserData()
    └── Page → getAuthUser()        ← redundant
          └── Component → getAuthUser()  ← redundant

Desired (unified):
  RootLayout → UserProvider
    └── Page → useUser()            ← reads from context
          └── Component → useUser()      ← reads from context
```

**Files:**
- Create: `packages/auth/src/context/UserContext.tsx`
- Update: `apps/web/app/layout.tsx`
- Migrate: Components using `getAuthUser()` client-side

**Effort:** 8-12 hours

---

### Phase 2.5: Real-Time Subscriptions

**Status:** 📋 Pending (Same as Week 4)

**Problem:** Polling is mechanical - checks regardless of changes.

**Solution:** Supabase Realtime for event-driven updates.

**Qualities:**
- **Breathing:** Active when engaged, dormant when not
- **Responsive:** Reacts to events rather than guessing
- **Resilient:** Falls back gracefully when connection drops

See "Phase 2: Upgrade to Supabase Realtime" above for implementation details.

**Effort:** 4-6 hours

---

### Implementation Order (Phase 2)

| Step | Name | Effort | Risk | Status |
|------|------|--------|------|--------|
| 2.1 | Cache Pattern Language | 2-3h | Low | ✅ Complete |
| 2.2 | Contextual Logging | 3-4h | Low | 📋 Deferred |
| 2.3 | Session Diagnosis | 4-8h | Medium | 📋 Pending |
| 2.4 | Unified Context | 8-12h | Medium | 📋 Skipped (not needed) |
| 2.5 | Real-Time Subscriptions | 4-6h | Low | 📋 Pending |

---

### Success Criteria (QWAN)

Beyond metrics, we seek the Quality Without a Name:

- [x] **Constants have meaning** - Cache patterns express intent, not magic numbers
- [ ] **The structure is visible** - New developers can understand intent
- [ ] **Changes are localized** - Modifying one concern doesn't ripple everywhere
- [ ] **The system breathes** - Active when engaged, restful when not
- [ ] **The code is quiet** - No unnecessary chatter, polling, or busy-work

---

## QWAN Audit: What Still Lacks Life

> *Second review of the diff through Christopher Alexander's lens*
> *Conducted: Current session*

### 1. Cache Pattern Language Lacks Context Awareness

The `CachePatterns` object declares fixed durations disconnected from actual system rhythms:

```typescript
roundPhase: { maxAge: 60, staleWhileRevalidate: 300 }
```

**The issue:** A round doesn't change every 60 seconds—it changes when phases transition. The cache duration is a *compromise* rather than a *truth*.

**What's missing:** Adaptive caching. A round in "celebration" phase could cache for hours. A round minutes from deadline needs freshness. The pattern doesn't know where it lives.

**Future work:** Consider phase-aware cache headers, or cache invalidation on phase transition.

---

### 2. Debug Removal Created Silence

Debug logs were removed but nothing replaced them:

```typescript
- console.log('[fetchHeroData] Called with projectId:', projectId);
- console.log('[ProjectDashboardPage] Loading dashboard for projectSlug:', slug);
```

**The issue:** Logs were removed for performance, creating silence. When something goes wrong, the system cannot speak about its own health.

**Future work:** Create a contextual logger with domain-aware structured data (e.g., notification errors capture `userId`, round errors capture `roundId`).

---

### 3. Visibility-Based Polling is Sophisticated Bandaging

```typescript
const handleVisibilityChange = () => {
  if (document.visibilityState === "visible") {
    startPolling();
  } else {
    stopPolling();
  }
};
```

**The issue:** This is *patching brokenness* rather than *addressing root cause*. The real question is: why poll at all? The system asks "do you have notifications?" repeatedly instead of the server saying "here is a notification" when one exists.

**Future work:** Phase 2.5 (Real-Time Subscriptions) addresses this properly. The visibility detection is a good interim measure but not the final form.

---

### 4. Removed Logging Creates Silence, Not Clarity

Debug logs were stripped throughout:

```typescript
- console.log('[fetchHeroData] Called with projectId:', projectId);
- console.log('[ProjectDashboardPage] Loading dashboard for projectSlug:', slug);
```

**The issue:** Noise was confused with visibility. By silencing everything, the system becomes opaque when something goes wrong.

**Future work:** Strategic logging adoption using the new logger utility.

---

### 5. Hidden Policy in `getLayoutUserData`

```typescript
const isAdmin = email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  process.env.NODE_ENV === 'development';
```

**The issue:** This embeds policy into mechanism. The concept of "admin" is hardcoded as "email match OR dev mode"—a crystallized assumption, not a living pattern.

**Future work:** Consider role-based or permission-based admin status that can evolve without rewriting this function.

---

### 6. Type Coercion Reveals Unresolved Tension

```typescript
const userId = layoutData?.userId ?? '';
```

**The issue:** Using empty string to mean "no user" is a structural lie. Components receiving this must know the secret: "empty means absent."

**Future work:** Consider honest types (`string | null`) with explicit absence handling.

---

### 7. Near-Duplicate Routes Suggest Unnamed Pattern

```typescript
// round-info/route.ts and round/current/route.ts
// Both do nearly the same thing with the same cache pattern
```

**The issue:** The near-duplication suggests a pattern wanting to emerge that hasn't been named.

**Future work:** Consider `createRoundEndpoint(options)` that captures common structure while allowing variation.

---

### Summary Table

| What Exists | What's Missing |
|-------------|----------------|
| Cache patterns with fixed numbers | Context-aware caching that knows phase state |
| Visibility-based polling | Server-initiated real-time updates |
| Removed debug noise | Meaningful operational telemetry / contextual logging |
| Combined layout data fetch | Honest types for optional user state |
| Repeated similar routes | Unified pattern for round endpoints |

**Assessment:** The diff shows *good repair work*—reducing waste, creating named patterns, consolidating fetches. But the patterns created are scaffolding, not yet inhabited by the life of the system using them.
