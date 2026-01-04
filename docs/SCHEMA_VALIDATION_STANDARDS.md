# Schema Validation Standards

## Overview

This document establishes standards for Zod schema definitions to ensure consistency across the codebase and prevent validation mismatches.

## The Problem

Having different schemas for the same data structure can cause subtle bugs:

```typescript
// File 1: actionSchemas.ts
coverImageUrl: z.string().url().optional().or(z.literal(""))

// File 2: submission.ts
coverImageUrl: z.union([z.string().url(), z.literal("")]).optional()
```

**Issues:**
- Different validation behavior
- Different TypeScript types
- Hard to maintain
- Can cause runtime errors

## Standard Patterns

### ✅ Optional URL or Empty String

**Correct Pattern:**
```typescript
coverImageUrl: z.union([z.string().url(), z.literal("")]).optional()
```

**Accepts:**
- Valid URL: `"https://example.com/image.jpg"` ✓
- Empty string: `""` ✓
- Undefined: `undefined` ✓

**Why This Works:**
1. `z.union([z.string().url(), z.literal("")])` - Accepts valid URL OR empty string
2. `.optional()` - Makes the entire union optional (can be undefined)

**❌ Avoid:**
```typescript
// WRONG - confusing order of operations
z.string().url().optional().or(z.literal(""))

// WRONG - doesn't handle undefined correctly
z.string().url().or(z.literal(""))
```

### ✅ Optional String

**Correct Pattern:**
```typescript
description: z.string().optional()
```

**Accepts:**
- Any string: `"text"` ✓
- Empty string: `""` ✓
- Undefined: `undefined` ✓

**❌ Avoid:**
```typescript
// WRONG - redundant
description: z.string().optional().or(z.literal(""))
```

### ✅ Optional Number with Preprocessing

**Correct Pattern:**
```typescript
audioDuration: z.preprocess(
  (val) => {
    if (val === undefined || val === "" || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  },
  z.number().positive().optional()
)
```

**Why:**
- Handles FormData string inputs
- Converts to number or undefined
- Validates as positive number if present

### ✅ Required URL

**Correct Pattern:**
```typescript
audioFileUrl: z.string({
  required_error: "Please upload an audio file",
  invalid_type_error: "Audio file URL must be a string",
}).min(1, "Please upload an audio file").url("Audio File: Please provide a valid URL")
```

**Benefits:**
- Clear error messages
- Non-empty requirement
- URL format validation

## Schema Consistency Rules

### Rule 1: One Source of Truth

**DO:** Define shared schemas once and export them

```typescript
// schemas/submission.ts
export const submissionSchema = z.object({
  audioFileUrl: z.string().url(),
  coverImageUrl: z.union([z.string().url(), z.literal("")]).optional(),
  // ...
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
```

**DON'T:** Duplicate schema definitions
```typescript
// ❌ BAD - duplicated in multiple files
// actionSchemas.ts
const submitCoverSchema = z.object({ /* same fields */ });

// submission.ts
const submissionSchema = z.object({ /* same fields */ });
```

### Rule 2: Consistent Field Validation

Fields with the same semantic meaning should have identical validation across all schemas.

**Example:**
```typescript
// All schemas with coverImageUrl should use:
coverImageUrl: z.union([z.string().url(), z.literal("")]).optional()

// All schemas with audioDuration should use:
audioDuration: z.preprocess(/* same preprocessing */, z.number().positive().optional())
```

### Rule 3: Document Schema Purpose

Add comments explaining why certain patterns are used:

```typescript
export const submitCoverSchema = z.object({
  // Required fields for audio file
  audioFileUrl: z.string().url("Invalid audio file URL"),
  audioFilePath: z.string().min(1, "Audio file path is required"),

  // Optional cover image - accepts URL or empty string
  coverImageUrl: z.union([z.string().url(), z.literal("")]).optional(),
  coverImagePath: z.string().optional(),

  // Use preprocess to handle string to number conversion for optional fields
  audioDuration: z.preprocess(/* ... */),
});
```

## Testing Schema Compatibility

### Manual Comparison

Compare field definitions across schemas:

```bash
# Check for .optional().or( pattern
grep -r "\.optional()\.or(" packages/data-access/src/schemas/

# Check for .or().optional() pattern
grep -r "\.or(.*).optional()" packages/data-access/src/schemas/
```

### TypeScript Type Checking

Ensure schemas produce compatible types:

```typescript
import { submitCoverSchema } from './actionSchemas';
import { submissionSchema } from './submission';

// This should not have type errors if schemas are compatible
type ActionInput = z.infer<typeof submitCoverSchema>;
type SubmissionInput = z.infer<typeof submissionSchema>;

// Test assignment compatibility
const testCompatibility = (action: ActionInput): SubmissionInput => action;
```

## Common Patterns Reference

### URLs

```typescript
// Required URL
url: z.string().url()

// Optional URL
url: z.string().url().optional()

// URL or empty string (optional)
url: z.union([z.string().url(), z.literal("")]).optional()
```

### Strings

```typescript
// Required non-empty string
name: z.string().min(1, "Name is required")

// Optional string
description: z.string().optional()

// String with max length
title: z.string().min(1).max(100)
```

### Numbers

```typescript
// Required positive number
count: z.number().positive()

// Optional number
age: z.number().optional()

// Number with coercion from string
id: z.coerce.number().int().positive()

// Number with preprocessing (from FormData)
duration: z.preprocess(
  (val) => {
    if (val === undefined || val === "" || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  },
  z.number().positive().optional()
)
```

### Arrays

```typescript
// Required non-empty array
items: z.array(z.string()).min(1)

// Optional array
tags: z.array(z.string()).optional()
```

## Fixed Issues

### Issue: Schema Mismatch in coverImageUrl

**Location:** `actionSchemas.ts` vs `submission.ts`

**Before:**
```typescript
// actionSchemas.ts
coverImageUrl: z.string().url().optional().or(z.literal(""))

// submission.ts
coverImageUrl: z.union([z.string().url(), z.literal("")]).optional()
```

**After:** ✅
```typescript
// Both files now use:
coverImageUrl: z.union([z.string().url(), z.literal("")]).optional()
```

**Files Changed:**
- `packages/data-access/src/schemas/actionSchemas.ts:23`
- Standardized to match `submission.ts` pattern

### Issue: Redundant .or(z.literal("")) Patterns

**Before:**
```typescript
coolThingsLearned: z.string().optional().or(z.literal(""))
toolsUsed: z.string().optional().or(z.literal(""))
happyAccidents: z.string().optional().or(z.literal(""))
didntWork: z.string().optional().or(z.literal(""))
```

**After:** ✅
```typescript
coolThingsLearned: z.string().optional()
toolsUsed: z.string().optional()
happyAccidents: z.string().optional()
didntWork: z.string().optional()
```

**Reason:** `z.string().optional()` already accepts empty strings, so `.or(z.literal(""))` is redundant.

## Validation Checklist

When creating or modifying schemas:

- [ ] Check if a similar schema already exists
- [ ] Use consistent patterns for similar fields
- [ ] Add error messages for required fields
- [ ] Use `.optional()` correctly (after unions/transforms)
- [ ] Avoid redundant validation (e.g., `.optional().or(z.literal(""))`)
- [ ] Test with actual data (including edge cases)
- [ ] Document any preprocessing or custom validation
- [ ] Ensure TypeScript types are compatible

## Related Files

- Action Schemas: `packages/data-access/src/schemas/actionSchemas.ts`
- Submission Schema: `packages/data-access/src/schemas/submission.ts`
- Signup Schemas: `packages/data-access/src/schemas/signupSchemas.ts`
- User Schema: `packages/data-access/src/schemas/user.ts`
- Auth Schema: `packages/data-access/src/schemas/auth.ts`
- Voting Schema: `packages/data-access/src/schemas/voting.ts`

## Further Reading

- [Zod Documentation](https://zod.dev/)
- [Zod Best Practices](https://github.com/colinhacks/zod#best-practices)
- [FormData Validation](https://zod.dev/?id=formdata)
