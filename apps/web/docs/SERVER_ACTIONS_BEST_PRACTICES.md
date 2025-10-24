# Server Actions Best Practices

**Last Updated**: 2025-10-20  
**Project**: EPTSS Website

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Action Structure Template](#action-structure-template)
4. [Best Practices](#best-practices)
5. [Common Pitfalls](#common-pitfalls)
6. [Testing Guidelines](#testing-guidelines)
7. [Examples](#examples)

---

## Overview

Server Actions in Next.js 15 are server-side functions that can be called directly from client components. They provide a secure way to mutate data, handle form submissions, and perform server-side operations.

### Key Benefits
- **Type-safe** - Full TypeScript support
- **Secure** - Run only on the server
- **Progressive Enhancement** - Work without JavaScript
- **Integrated** - Built into Next.js routing and caching

---

## Core Principles

### 1. **Always Use `"use server"` Directive**
```typescript
"use server";

export async function myAction() {
  // Server-only code
}
```

### 2. **Return Structured Responses**
```typescript
type FormReturn = {
  status: "Success" | "Error";
  message: string;
  data?: any;
};
```

### 3. **Never Throw Errors**
Return errors instead of throwing them to prevent unhandled promise rejections on the client.

### 4. **Always Validate Input**
Use Zod or similar validation library for all inputs.

### 5. **Revalidate Cache**
Use `revalidatePath()` or `revalidateTag()` after mutations.

---

## Action Structure Template

```typescript
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/utils/supabase/server";
import type { FormReturn } from "@/types";

// 1. Define validation schema
const actionSchema = z.object({
  field1: z.string().min(1, "Field is required"),
  field2: z.coerce.number().int().positive(),
});

// 2. Define the action
export async function myAction(formData: FormData): Promise<FormReturn> {
  try {
    // 3. Authenticate (if needed)
    const { userId } = await getAuthUser();
    if (!userId) {
      return { status: "Error", message: "Unauthorized" };
    }
    
    // 4. Validate input
    const validation = actionSchema.safeParse({
      field1: formData.get("field1"),
      field2: formData.get("field2"),
    });
    
    if (!validation.success) {
      return { 
        status: "Error", 
        message: validation.error.errors[0].message 
      };
    }
    
    const { field1, field2 } = validation.data;
    
    // 5. Perform business logic
    await performOperation(field1, field2, userId);
    
    // 6. Revalidate affected paths
    revalidatePath('/dashboard');
    
    // 7. Return success
    return { 
      status: "Success", 
      message: "Operation completed successfully" 
    };
    
  } catch (error) {
    // 8. Handle errors gracefully
    console.error('Action failed:', error);
    return { 
      status: "Error", 
      message: "Something went wrong. Please try again." 
    };
  }
}
```

---

## Best Practices

### ✅ Input Validation

**Always validate with Zod:**
```typescript
const signupSchema = z.object({
  roundId: z.coerce.number().int().positive(),
  userId: z.string().uuid(),
  email: z.string().email(),
});

const validation = signupSchema.safeParse(data);
if (!validation.success) {
  return { status: "Error", message: validation.error.errors[0].message };
}
```

**Why**: Prevents invalid data from reaching your database and provides clear error messages.

---

### ✅ Error Handling

**Return errors, don't throw:**
```typescript
// ❌ BAD
export async function myAction(formData: FormData) {
  if (!userId) {
    throw new Error("Unauthorized");
  }
}

// ✅ GOOD
export async function myAction(formData: FormData): Promise<FormReturn> {
  if (!userId) {
    return { status: "Error", message: "Unauthorized" };
  }
}
```

**Why**: Throwing errors can cause unhandled promise rejections on the client.

---

### ✅ Authentication

**Check auth at the start:**
```typescript
export async function myAction(formData: FormData): Promise<FormReturn> {
  const { userId } = await getAuthUser();
  
  if (!userId) {
    return { status: "Error", message: "Please log in to continue" };
  }
  
  // Rest of logic
}
```

**Why**: Prevents unauthorized access and provides clear feedback.

---

### ✅ Rate Limiting

**Protect against abuse:**
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"),
});

export async function myAction(formData: FormData): Promise<FormReturn> {
  const { userId } = await getAuthUser();
  
  const { success } = await ratelimit.limit(`action:${userId}`);
  if (!success) {
    return { 
      status: "Error", 
      message: "Too many requests. Please try again later." 
    };
  }
  
  // Rest of logic
}
```

**Why**: Prevents spam, abuse, and DOS attacks.

---

### ✅ Logging & Monitoring

**Log important events:**
```typescript
import { logger } from "@/lib/logger";

export async function myAction(formData: FormData): Promise<FormReturn> {
  try {
    // Business logic
    
    logger.info('Action completed', { userId, actionType: 'signup' });
    return { status: "Success", message: "Done" };
    
  } catch (error) {
    logger.error('Action failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      userId,
    });
    
    return { status: "Error", message: "Something went wrong" };
  }
}
```

**Why**: Helps debug issues and monitor application health.

---

### ✅ Cache Revalidation

**Revalidate after mutations:**
```typescript
import { revalidatePath, revalidateTag } from "next/cache";

export async function updateProfile(formData: FormData): Promise<FormReturn> {
  // Update database
  await db.update(users).set({ name }).where(eq(users.id, userId));
  
  // Revalidate specific paths
  revalidatePath('/profile');
  revalidatePath('/dashboard');
  
  // Or revalidate by tag
  revalidateTag('user-profile');
  
  return { status: "Success", message: "Profile updated" };
}
```

**Why**: Ensures users see fresh data after mutations.

---

### ✅ Database Transactions

**Use transactions for multi-step operations:**
```typescript
export async function signup(formData: FormData): Promise<FormReturn> {
  try {
    await db.transaction(async (tx) => {
      // Step 1: Create signup
      await tx.insert(signups).values({ userId, roundId, songId });
      
      // Step 2: Update user stats
      await tx.update(users)
        .set({ signupCount: sql`${users.signupCount} + 1` })
        .where(eq(users.id, userId));
    });
    
    // Email happens AFTER transaction commits
    await sendConfirmationEmail(email);
    
    return { status: "Success", message: "Signed up successfully" };
  } catch (error) {
    return { status: "Error", message: "Signup failed" };
  }
}
```

**Why**: Ensures data consistency - either all operations succeed or none do.

---

### ✅ Extract Reusable Logic

**Create helper functions:**
```typescript
// lib/helpers/userHelpers.ts
export async function getUserInfo(userId: string) {
  const result = await db
    .select({ email: users.email, username: users.username })
    .from(users)
    .where(eq(users.userid, userId))
    .limit(1);
  
  return result[0] || null;
}

// actions/myAction.ts
export async function myAction(formData: FormData): Promise<FormReturn> {
  const userInfo = await getUserInfo(userId);
  if (!userInfo) {
    return { status: "Error", message: "User not found" };
  }
  // Use userInfo
}
```

**Why**: Reduces code duplication and improves maintainability.

---

### ✅ Type Safety

**Use TypeScript strictly:**
```typescript
// types/index.ts
export type FormReturn = {
  status: "Success" | "Error";
  message: string;
  data?: unknown;
};

// actions/myAction.ts
export async function myAction(
  formData: FormData
): Promise<FormReturn> {
  // TypeScript ensures return type matches
}
```

**Why**: Catches errors at compile time and improves IDE support.

---

## Common Pitfalls

### ❌ Throwing Errors
```typescript
// BAD
throw new Error("Something went wrong");

// GOOD
return { status: "Error", message: "Something went wrong" };
```

### ❌ No Input Validation
```typescript
// BAD
const roundId = parseInt(formData.get("roundId") as string);

// GOOD
const validation = z.coerce.number().int().positive().safeParse(
  formData.get("roundId")
);
```

### ❌ Forgetting to Revalidate
```typescript
// BAD
await updateDatabase();
return { status: "Success" };

// GOOD
await updateDatabase();
revalidatePath('/dashboard');
return { status: "Success" };
```

### ❌ Exposing Sensitive Errors
```typescript
// BAD
return { status: "Error", message: error.message }; // May expose DB details

// GOOD
console.error('Error:', error);
return { status: "Error", message: "Something went wrong" };
```

### ❌ No Rate Limiting
```typescript
// BAD
export async function sendEmail(formData: FormData) {
  await sendEmail(email);
}

// GOOD
export async function sendEmail(formData: FormData) {
  const { success } = await ratelimit.limit(`email:${userId}`);
  if (!success) return { status: "Error", message: "Rate limit exceeded" };
  await sendEmail(email);
}
```

---

## Testing Guidelines

### Unit Testing
```typescript
import { describe, it, expect, vi } from 'vitest';
import { myAction } from './actions';

describe('myAction', () => {
  it('should return error when not authenticated', async () => {
    vi.mock('@/utils/supabase/server', () => ({
      getAuthUser: vi.fn().mockResolvedValue({ userId: null }),
    }));
    
    const formData = new FormData();
    const result = await myAction(formData);
    
    expect(result.status).toBe('Error');
    expect(result.message).toContain('Unauthorized');
  });
  
  it('should validate input correctly', async () => {
    const formData = new FormData();
    formData.set('roundId', 'invalid');
    
    const result = await myAction(formData);
    
    expect(result.status).toBe('Error');
  });
});
```

### Integration Testing
```typescript
import { test, expect } from '@playwright/test';

test('signup flow', async ({ page }) => {
  await page.goto('/sign-up');
  
  await page.fill('[name="songTitle"]', 'Test Song');
  await page.fill('[name="artist"]', 'Test Artist');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('text=Success')).toBeVisible();
});
```

---

## Examples

### Example 1: Simple Form Action
```typescript
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { FormReturn } from "@/types";

const feedbackSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters"),
  rating: z.coerce.number().int().min(1).max(5),
});

export async function submitFeedback(formData: FormData): Promise<FormReturn> {
  try {
    const validation = feedbackSchema.safeParse({
      message: formData.get("message"),
      rating: formData.get("rating"),
    });
    
    if (!validation.success) {
      return { 
        status: "Error", 
        message: validation.error.errors[0].message 
      };
    }
    
    const { message, rating } = validation.data;
    
    await db.insert(feedback).values({ message, rating });
    
    revalidatePath('/feedback');
    
    return { status: "Success", message: "Thank you for your feedback!" };
  } catch (error) {
    console.error('Feedback submission failed:', error);
    return { status: "Error", message: "Failed to submit feedback" };
  }
}
```

### Example 2: Authenticated Action with Email
```typescript
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/utils/supabase/server";
import { sendEmail } from "@/services/emailService";
import type { FormReturn } from "@/types";

const signupSchema = z.object({
  roundId: z.coerce.number().int().positive(),
  songTitle: z.string().min(1),
  artist: z.string().min(1),
});

export async function signupForRound(formData: FormData): Promise<FormReturn> {
  try {
    // 1. Authenticate
    const { userId, email } = await getAuthUser();
    if (!userId) {
      return { status: "Error", message: "Please log in to continue" };
    }
    
    // 2. Validate
    const validation = signupSchema.safeParse({
      roundId: formData.get("roundId"),
      songTitle: formData.get("songTitle"),
      artist: formData.get("artist"),
    });
    
    if (!validation.success) {
      return { 
        status: "Error", 
        message: validation.error.errors[0].message 
      };
    }
    
    const { roundId, songTitle, artist } = validation.data;
    
    // 3. Database operation
    await db.insert(signups).values({
      userId,
      roundId,
      songTitle,
      artist,
    });
    
    // 4. Send confirmation email (non-blocking)
    sendEmail({
      to: email,
      subject: "Signup Confirmation",
      body: `You've signed up for round ${roundId}`,
    }).catch(err => console.error('Email failed:', err));
    
    // 5. Revalidate
    revalidatePath('/dashboard');
    revalidatePath(`/round/${roundId}`);
    
    return { 
      status: "Success", 
      message: "Successfully signed up!" 
    };
    
  } catch (error) {
    console.error('Signup failed:', error);
    return { 
      status: "Error", 
      message: "Signup failed. Please try again." 
    };
  }
}
```

---

## Resources

- [Next.js Server Actions Docs](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Zod Documentation](https://zod.dev/)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)

---

**Last Updated**: 2025-10-20
