# EPTSS Architecture Guide
**Next.js 15 App Router - Server-First Architecture**

---

## TL;DR - The Rules

### The Flow
```
READS:  Page → Provider → Data Access → Database
WRITES: Client Component → Server Action → Data Access → Database
```

### Who Calls What
- **Pages**: Call providers only, never services
- **Providers**: Call services, return read-only data
- **Actions**: Call services, handle mutations
- **Client Components**: Receive data as props, call actions
- **Services**: Direct database access only

### Can I Pass This Across Server/Client Boundary?
- ✅ Plain objects, arrays, primitives, strings, numbers, booleans
- ⚠️ Dates → become strings (reconstruct with `new Date()` on client)
- ✅ Server Actions → the ONLY functions you can pass
- ❌ Regular functions, class instances, Maps, Sets, circular references

---

## Quick Reference: Where Does Code Live?

| Layer | Location | Directive | Calls | Called By |
|-------|----------|-----------|-------|-----------|
| **Data Access** | `/data-access/*.ts` | `"use server"` | Database | Providers, Actions |
| **Providers** | `/providers/*/*.ts` | `"use server"` | Data Access | Server Components |
| **Actions** | `/actions/*.ts` | `"use server"` | Data Access | Client Components |
| **Pages** | `/app/**/page.tsx` | None | Providers | Next.js |
| **Client Components** | Any file | `'use client'` | Nothing | Server Components |

---

## Layer 1: Data Access (Services)

**Purpose**: Raw CRUD operations, no business logic.

```typescript
// data-access/roundService.ts
"use server";

export async function getRoundById(roundId: number) {
  return await db.query.rounds.findFirst({
    where: eq(rounds.id, roundId)
  });
}

export async function createRound(data: RoundData) {
  return await db.insert(rounds).values(data);
}
```

**Rules**:
- ✅ Direct database access only
- ✅ Simple, focused queries
- ✅ Return plain objects
- ❌ No business logic
- ❌ No composition
- ❌ Never called from pages

---

## Layer 2: Providers (Reads)

**Purpose**: Compose data from services, add business logic, shape for UI.

```typescript
// providers/roundProvider/roundProvider.ts
"use server";

export async function roundProvider(slug?: string) {
  // 1. Fetch from multiple services
  const [round, signups, submissions] = await Promise.all([
    getRoundBySlug(slug),
    getSignupsByRound(roundId),
    getSubmissions(roundId)
  ]);
  
  // 2. Add business logic
  const phase = getCurrentPhase(round);
  const isVotingOpen = phase === "voting";
  
  // 3. Return UI-ready data
  return {
    roundId: round.id,
    slug: round.slug,
    phase,
    song: round.song,
    isVotingOpen,
    signups,
    submissions
  };
}
```

**Rules**:
- ✅ Compose multiple service calls
- ✅ Use `Promise.all()` for parallel fetching
- ✅ Add business logic
- ✅ Transform data for UI
- ❌ No mutations
- ❌ No database access directly
- ❌ Read-only only

---

## Layer 3: Actions (Writes)

**Purpose**: Handle mutations. Can be passed to client components!

```typescript
// actions/roundActions.ts
"use server";

export async function submitSignup(formData: FormData) {
  // 1. Auth
  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated' };
  
  // 2. Validate
  const validated = schema.safeParse({
    title: formData.get('title'),
    artist: formData.get('artist'),
  });
  if (!validated.success) {
    return { success: false, errors: validated.error };
  }
  
  // 3. Call service
  await createSignup(validated.data);
  
  // 4. Revalidate
  revalidatePath('/dashboard');
  
  // 5. Redirect
  redirect('/dashboard');
}
```

**Rules**:
- ✅ Mark with `"use server"`
- ✅ Validate input
- ✅ Check auth
- ✅ Call services
- ✅ Revalidate cache
- ✅ Can redirect
- ✅ **Can be passed to client components**
- ❌ No direct database access

---

## Layer 4: Pages (Server Components)

**Purpose**: Orchestrate, fetch data, render UI.

```typescript
// app/round/[slug]/page.tsx
import { roundProvider } from '@/providers';
import { submitSignup } from '@/actions/roundActions';
import { SignupForm } from './SignupForm'; // client component

export default async function RoundPage({ params }) {
  const { slug } = await params;
  
  // Call provider for data
  const roundData = await roundProvider(slug);
  
  return (
    <div>
      <h1>{roundData.song.title}</h1>
      
      {/* Pass action to client component */}
      <SignupForm 
        roundId={roundData.roundId}
        onSubmit={submitSignup}
      />
    </div>
  );
}
```

**Rules**:
- ✅ Call providers for data
- ✅ Pass actions to client components
- ✅ Pass plain data as props
- ❌ No `'use client'`
- ❌ No service calls
- ❌ No database access

---

## Layer 5: Client Components

**Purpose**: Interactivity, event handlers, browser APIs.

```typescript
// SignupForm.tsx
'use client';
import { useFormState } from 'react-dom';

export function SignupForm({ roundId, onSubmit }) {
  const [state, formAction] = useFormState(onSubmit, {});
  
  return (
    <form action={formAction}>
      <input type="hidden" name="roundId" value={roundId} />
      <input name="title" />
      <button type="submit">Sign Up</button>
      {state.error && <p>{state.error}</p>}
    </form>
  );
}
```

**Rules**:
- ✅ Mark with `'use client'`
- ✅ Receive data as props
- ✅ Receive actions as props
- ✅ Event handlers
- ✅ useState, useEffect
- ❌ Can't call providers
- ❌ Can't call services
- ❌ Can't do database operations

---

## Common Patterns

### Pattern 1: Fetching Data
```typescript
// ✅ Correct
export default async function Page() {
  const data = await someProvider();
  return <ClientComponent data={data} />;
}

// ❌ Wrong
export default async function Page() {
  const data = await someService(); // NO! Use provider
  return <ClientComponent data={data} />;
}
```

### Pattern 2: Mutations
```typescript
// ✅ Correct - Pass action to client
import { submitForm } from '@/actions';

export default async function Page() {
  return <ClientForm onSubmit={submitForm} />;
}

// ❌ Wrong - Can't pass regular functions
export default async function Page() {
  async function handleSubmit() { /* ... */ }
  return <ClientForm onSubmit={handleSubmit} />; // Won't work!
}
```

### Pattern 3: Dates
```typescript
// Server: Send as ISO string
const data = {
  createdAt: new Date().toISOString()
};

// Client: Reconstruct
'use client';
export function Component({ createdAt }) {
  const date = new Date(createdAt); // Reconstruct!
  return <p>{date.toLocaleDateString()}</p>;
}
```

### Pattern 4: URL State
```typescript
// Server: Read from searchParams
export default async function Page({ searchParams }) {
  const params = await searchParams;
  const filter = params.filter || 'all';
  const data = await getProducts({ filter });
  return <ProductList products={data} filter={filter} />;
}

// Client: Update URL
'use client';
export function FilterBar({ currentFilter }) {
  const router = useRouter();
  return (
    <select 
      value={currentFilter}
      onChange={(e) => router.push(`?filter=${e.target.value}`)}
    >
      <option value="all">All</option>
    </select>
  );
}
```

---

## Your Current Status

### ✅ Doing Well (95%)
- Services are clean and focused
- Most providers compose correctly
- Actions layer exists
- Homepage, reporting, round pages follow pattern

### ⚠️ Remaining Issues (5%)
1. **Profile page** - Needs complete refactor (biggest issue)
2. **app/health/page.tsx** - Calling service directly
3. **app/submit/page.tsx** - Calling service directly
4. **app/sign-up/SharedSignupPageWrapper.tsx** - Multiple violations

---

## Troubleshooting

### Error: "Functions cannot be passed to Client Components"
**Problem**: Trying to pass a regular function across the boundary.  
**Solution**: Use a Server Action instead (`"use server"` directive).

### Error: "X is not serializable"
**Problem**: Trying to pass Date, function, or class instance.  
**Solution**: Convert to plain object/string before passing.

### Error: "Cannot read property of undefined"
**Problem**: Date became a string, trying to call date methods.  
**Solution**: Reconstruct with `new Date(dateString)` on client.

### How to check if code is server or client?
```typescript
// Server Component (default)
export default async function Page() { } // Can be async

// Client Component (explicit)
'use client';
export function Component() { } // Must use 'use client'
```

---

## Quick Wins (Remaining Fixes)

### 1. app/submit/page.tsx (2 min)
```typescript
// Before
const { slug } = await roundProvider();
const { data: round } = await getRoundBySlug(slug); // ❌

// After
const roundData = await roundProvider(); // Already has everything! ✅
```

### 2. app/health/page.tsx (5 min)
```typescript
// Create providers/monitoringProvider.ts
export const monitoringProvider = async () => {
  return await getMonitoringData();
};

// Use in page
import { monitoringProvider } from '@/providers';
const data = await monitoringProvider();
```

### 3. Move any `import { X } from '@/data-access'` in pages to providers or actions

---

## The Mental Model

Think of it like a restaurant:
- **Services**: Ingredients in the fridge
- **Providers**: Cooks preparing dishes (read-only)
- **Actions**: Waiters taking orders (write)
- **Pages**: Menu showing dishes
- **Client Components**: Customers interacting

Customers don't go in the fridge. They order from waiters or look at the menu.

---

## Verification Commands

```bash
# Find pages calling services (should return nothing)
grep -r "from '@/data-access'" app --include="*.tsx" | grep -v "/api/" | grep -v "/actions"

# Find all 'use client' files
grep -r "'use client'" app --include="*.tsx" | cut -d: -f1

# See what changed
git status
```

---

## Remember

1. **Server by default** - Everything is a server component unless you add `'use client'`
2. **Push client boundaries to leaves** - Only mark interactive bits as client
3. **Pass actions, not functions** - Actions are the ONLY functions that cross the boundary
4. **When in doubt, serialize it** - Test with `JSON.stringify()` to check serializability
5. **One provider call per page** - Compose everything in the provider

---

## Need Help?

1. Is it a **read** operation? → Provider
2. Is it a **write** operation? → Action  
3. Does it need **interactivity**? → Client Component
4. Does it **fetch data**? → Provider in Server Component
5. Not sure? → Start with Server Component, add `'use client'` only when you must
