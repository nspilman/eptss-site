# @eptss/auth

Comprehensive authentication package for EPTSS applications, providing unified auth logic across web and admin apps.

## Features

- 🔐 **Multiple Auth Methods**: Email magic links, password auth, and Google OAuth
- 🛡️ **Auth Guards**: Server and client-side authentication guards
- 🎣 **React Hooks**: Client-side auth state management
- 🚦 **Middleware**: Configurable route protection
- 🎨 **Pre-built Components**: Ready-to-use login forms
- 📦 **Monorepo-ready**: Shared across multiple Next.js apps

## Installation

The package is already installed in your monorepo workspace. To use it in an app:

```bash
# It's automatically available as workspace dependency
```

## Usage

### Middleware

Protect routes with authentication middleware:

```typescript
// middleware.ts
import { createAuthMiddleware } from '@eptss/auth/middleware'

export const middleware = createAuthMiddleware({
  protectedPaths: ['/dashboard', '/profile'],
  publicPaths: ['/login', '/sign-up'],
  redirectToOnAuth: '/dashboard',
  redirectToOnNoAuth: '/login',
  adminPaths: ['/admin'], // Optional: admin-only routes
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### Components

#### LoginForm

Magic link authentication with email:

```tsx
import { LoginForm } from '@eptss/auth/components'

export default function LoginPage() {
  return (
    <LoginForm 
      redirectUrl="/dashboard"
      titleOverride="Welcome Back"
      onSuccess={() => console.log('Login successful')}
    />
  )
}
```

#### PasswordAuthForm

Username/password authentication with registration:

```tsx
import { PasswordAuthForm } from '@eptss/auth/components'

export default function AuthPage() {
  return (
    <PasswordAuthForm 
      redirectUrl="/dashboard"
      onSuccess={() => router.push('/dashboard')}
    />
  )
}
```

#### GoogleSignInButton

OAuth authentication:

```tsx
import { GoogleSignInButton } from '@eptss/auth/components'

export function MyLoginForm() {
  return (
    <div>
      <GoogleSignInButton redirectUrl="/dashboard" />
    </div>
  )
}
```

#### AuthStateListener

Listen for auth state changes and refresh the page accordingly:

```tsx
import { AuthStateListener } from '@eptss/auth/components'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthStateListener>
          {children}
        </AuthStateListener>
      </body>
    </html>
  )
}
```

### Server-Side Guards

#### RequireAuth

Protect server components:

```tsx
import { RequireAuth } from '@eptss/auth'

export default async function ProtectedPage() {
  return (
    <RequireAuth redirectTo="/login">
      <div>Protected content</div>
    </RequireAuth>
  )
}
```

#### RequireAdmin

Restrict access to admin users:

```tsx
import { RequireAdmin } from '@eptss/auth'

export default async function AdminPage() {
  return (
    <RequireAdmin redirectTo="/">
      <div>Admin only content</div>
    </RequireAdmin>
  )
}
```

#### withAuth HOC

Wrap components with authentication:

```tsx
import { withAuth } from '@eptss/auth'

async function DashboardPage() {
  return <div>Dashboard</div>
}

export default withAuth(DashboardPage, {
  redirectTo: '/login',
  requireAdmin: false, // Set to true for admin-only
})
```

### Client-Side Hooks

#### useAuthState

Get current auth state:

```tsx
'use client'
import { useAuthState } from '@eptss/auth/hooks'

export function MyComponent() {
  const { user, isLoading, isAuthenticated } = useAuthState()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please log in</div>
  
  return <div>Welcome, {user.email}</div>
}
```

#### useRequireAuth

Automatically redirect unauthenticated users:

```tsx
'use client'
import { useRequireAuth } from '@eptss/auth/hooks'

export function ProtectedComponent() {
  const { user, isLoading } = useRequireAuth('/login')
  
  if (isLoading) return <div>Loading...</div>
  
  return <div>Protected content for {user.email}</div>
}
```

### Server Utilities

#### getAuthUser

Get authenticated user in server components:

```tsx
import { getAuthUser } from '@eptss/auth'

export default async function ProfilePage() {
  const { userId, email } = await getAuthUser()
  
  if (!userId) {
    redirect('/login')
  }
  
  return <div>User: {email}</div>
}
```

#### isAdmin

Check if user is admin:

```tsx
import { isAdmin } from '@eptss/auth'

export default async function AdminPage() {
  const adminCheck = await isAdmin()
  
  if (!adminCheck) {
    redirect('/')
  }
  
  return <div>Admin panel</div>
}
```

## Configuration

### Environment Variables

Required in your app's `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Admin user (for admin checks)
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com

# Optional: Web app URL for cross-app redirects
NEXT_PUBLIC_WEB_APP_URL=https://your-domain.com
```

## Architecture

The auth package is built on:
- **Supabase Auth**: Backend authentication service
- **Next.js 14**: App router, server components, middleware
- **React Hook Form**: Form validation
- **Zod**: Schema validation
- **Framer Motion**: Animations

## File Structure

```
packages/auth/
├── src/
│   ├── components/       # UI components
│   │   ├── LoginForm.tsx
│   │   ├── PasswordAuthForm.tsx
│   │   ├── GoogleSignInButton.tsx
│   │   └── AuthStateListener.tsx
│   ├── guards/           # Auth guards
│   │   ├── RequireAuth.tsx
│   │   ├── RequireAdmin.tsx
│   │   └── withAuth.tsx
│   ├── hooks/            # Client hooks
│   │   ├── useAuthState.ts
│   │   └── useRequireAuth.ts
│   ├── middleware/       # Route protection
│   │   └── authMiddleware.ts
│   ├── utils/            # Utilities
│   │   ├── getAuthUser.ts
│   │   └── isAdmin.ts
│   ├── types.ts          # TypeScript types
│   └── index.ts          # Main exports
└── package.json
```

## Migration Guide

### From Direct Data Access Imports

Before:
```tsx
import { getAuthUser } from '@eptss/data-access/utils/supabase/server'
import { isAdmin } from '@eptss/data-access/utils/isAdmin'
```

After:
```tsx
import { getAuthUser, isAdmin } from '@eptss/auth'
```

### From Custom Middleware

Before:
```tsx
// Custom middleware with lots of boilerplate
export async function middleware(request: NextRequest) {
  // ... 70 lines of auth logic
}
```

After:
```tsx
import { createAuthMiddleware } from '@eptss/auth/middleware'

export const middleware = createAuthMiddleware({
  protectedPaths: ['/dashboard'],
  redirectToOnNoAuth: '/login',
})
```

## Examples

### Complete Admin App Setup

```tsx
// apps/admin/middleware.ts
import { createAuthMiddleware } from '@eptss/auth/middleware'

export const middleware = createAuthMiddleware({
  protectedPaths: ['/admin'],
  adminPaths: ['/admin'],
  redirectToOnNoAuth: '/login',
})

// apps/admin/app/layout.tsx
import { getAuthUser, isAdmin } from '@eptss/auth'
import { redirect } from 'next/navigation'

export default async function RootLayout({ children }) {
  const { userId } = await getAuthUser()
  
  if (!userId) redirect('/login')
  if (!(await isAdmin())) redirect('/')
  
  return <html><body>{children}</body></html>
}

// apps/admin/app/login/page.tsx
import { LoginForm } from '@eptss/auth/components'

export default function LoginPage() {
  return <LoginForm redirectUrl="/admin" titleOverride="Admin Login" />
}
```

## Troubleshooting

### "Cannot find module '@eptss/auth'"

Run `pnpm install` in the monorepo root to link workspace packages.

### Admin check not working

Ensure `NEXT_PUBLIC_ADMIN_EMAIL` is set in your environment variables and matches the user's email exactly.

### Middleware not triggering

Check your `matcher` config in `middleware.ts` to ensure it covers the routes you want to protect.

## Contributing

This package is internal to the EPTSS monorepo. To add features:

1. Add functionality to `packages/auth/src/`
2. Export from appropriate index files
3. Update this README
4. Test in both web and admin apps

## License

Internal package for EPTSS project.