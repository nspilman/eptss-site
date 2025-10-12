# Zod + FormData Best Practices

## TL;DR

**Always validate FormData with Zod in Server Actions. Never manually extract with `.get()`.**

```typescript
// ❌ BAD - Manual extraction, no validation, error-prone
const params = {
  roundId: Number(formData.get("roundId")?.toString() || "-1"),
  songTitle: formData.get("songTitle")?.toString() || "",
};

// ✅ GOOD - Zod validation, type-safe, handles errors
const validation = validateFormData(formData, signupSchema);
if (!validation.success) {
  return { status: 'Error', message: validation.error };
}
// validation.data is now type-safe!
```

---

## Why Use Zod for FormData?

### 1. **Type Safety**
```typescript
// Schema defines the shape AND the TypeScript type
const signupSchema = z.object({
  songTitle: z.string().min(1),
  artist: z.string().min(1),
  roundId: z.number(),
});

type SignupData = z.infer<typeof signupSchema>; // TypeScript type!
```

### 2. **Runtime Validation**
FormData comes from users = **never trust it**. Zod validates:
- Required fields exist
- Types are correct (string → number conversion)
- URLs are valid
- Emails are valid
- Custom business rules

### 3. **Better Error Messages**
```typescript
// Manual extraction
if (!formData.get("songTitle")) {
  return { error: "Missing songTitle" }; // Generic
}

// Zod validation
const result = signupSchema.safeParse(data);
// "songTitle: Song title is required" ✅ User-friendly!
```

### 4. **Single Source of Truth**
```typescript
// Define schema once
const signupSchema = z.object({ /* ... */ });

// Use it everywhere:
// - Client form validation (zodResolver)
// - Server action validation (validateFormData)
// - TypeScript types (z.infer)
```

---

## The Pattern

### 1. Define Your Schema
```typescript
// schemas/signupSchemas.ts
export const signupSchema = z.object({
  songTitle: z.string().min(1, "Song title is required"),
  artist: z.string().min(1, "Artist is required"),
  youtubeLink: z.string().url("Must be a valid URL"),
  additionalComments: z.string().optional(),
  roundId: z.number(),
});

export type SignupInput = z.infer<typeof signupSchema>;
```

### 2. Use in Server Action
```typescript
// actions/userParticipationActions.ts
import { validateFormData } from "@/utils/formDataHelpers";
import { signupSchema } from "@/schemas/signupSchemas";

export async function signup(formData: FormData): Promise<FormReturn> {
  // Validate
  const validation = validateFormData(formData, signupSchema);
  
  if (!validation.success) {
    return { status: 'Error', message: validation.error };
  }
  
  // validation.data is type-safe and validated!
  return await signupService(validation.data);
}
```

### 3. Service Trusts the Input
```typescript
// data-access/signupService.ts
import { SignupInput } from "@/schemas/signupSchemas";

export async function signupService(data: SignupInput) {
  // No validation needed - action already validated!
  return await db.insert(signups).values(data);
}
```

### 4. Use in Client Forms
```typescript
// SignupForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/schemas/signupSchemas";

const form = useForm({
  resolver: zodResolver(signupSchema), // Same schema!
  defaultValues: { /* ... */ }
});
```

---

## Helper Utility

We provide `validateFormData` to make this easy:

```typescript
// utils/formDataHelpers.ts
export function validateFormData<T extends z.ZodTypeAny>(
  formData: FormData,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; error: string }
```

**Features:**
- Extracts all FormData fields
- Handles multiple values (checkboxes)
- Converts numeric fields (roundId, userId, etc.)
- Returns type-safe result
- Formats errors nicely

---

## Common Patterns

### Pattern: Optional Fields
```typescript
const schema = z.object({
  name: z.string().min(1),
  bio: z.string().optional(), // Can be undefined
  tags: z.array(z.string()).optional().default([]), // Array with default
});
```

### Pattern: Transformations
```typescript
const schema = z.object({
  email: z.string().email().toLowerCase(), // Normalize
  age: z.coerce.number().int().positive(), // String → Number
  createdAt: z.string().transform(s => new Date(s)), // String → Date
});
```

### Pattern: Custom Validation
```typescript
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

### Pattern: Conditional Fields
```typescript
const schema = z.discriminatedUnion("userType", [
  z.object({ userType: z.literal("admin"), adminCode: z.string() }),
  z.object({ userType: z.literal("user") }),
]);
```

---

## Where to Use Zod

### ✅ **Always Use:**
1. **Server Actions** - Trust boundary, validate ALL inputs
2. **API Route Handlers** - External inputs from fetch/webhooks
3. **Client Forms** - Immediate feedback with `zodResolver`
4. **Environment Variables** - Validate at startup

### ❌ **Don't Use:**
1. **Data-access Services** - They trust inputs from actions
2. **Providers** - They work with DB data (already validated)
3. **Internal function parameters** - TypeScript types are enough

---

## Migration Checklist

To replace manual FormData extraction with Zod:

- [ ] Find manual `.get()` extraction
```typescript
// Search for patterns like:
formData.get("fieldName")?.toString() || ""
Number(formData.get("id"))
```

- [ ] Create or identify the appropriate Zod schema

- [ ] Replace with `validateFormData`
```typescript
const validation = validateFormData(formData, mySchema);
if (!validation.success) {
  return { status: 'Error', message: validation.error };
}
```

- [ ] Update service to accept typed input
```typescript
// Instead of: (formData: FormData)
// Use: (data: MySchemaInput)
```

- [ ] Remove manual extraction code

---

## Examples in Our Codebase

### ✅ Good: completeSignupAfterVerification
```typescript
export async function completeSignupAfterVerification(formData: FormData) {
  const validation = validateFormData(formData, signupSchema);
  
  if (!validation.success) {
    return { status: 'Error', message: validation.error };
  }
  
  return await completeSignupAfterVerificationService(validation.data);
}
```

### ✅ Good: signup (in data-access)
```typescript
export async function signup(formData: FormData, providedUserId?: string) {
  // Extract
  const formDataObj = {
    songTitle: formData.get("songTitle")?.toString() || "",
    artist: formData.get("artist")?.toString() || "",
    youtubeLink: formData.get("youtubeLink")?.toString() || "",
    additionalComments: formData.get("additionalComments")?.toString() || "",
    roundId: Number(formData.get("roundId")?.toString() || "-1"),
  };
  
  // Validate with Zod ✅
  const validationResult = signupSchema.safeParse(formDataObj);
  
  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors
      .map(err => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    return handleResponse(400, Navigation.SignUp, errorMessages);
  }
  
  const validData = validationResult.data; // Type-safe!
  // ...
}
```

---

## Key Takeaway

**Treat all FormData as untrusted input. Validate with Zod at the action boundary.**

This gives you:
- 🛡️ Security (validate everything)
- 🔒 Type safety (TypeScript knows the shape)
- 🐛 Better errors (user-friendly messages)
- 📝 Single source of truth (one schema, multiple uses)
- 🧹 Cleaner code (no manual extraction)
