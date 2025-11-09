// Auth provider exports
export { AuthProvider, useAuth } from './providers/AuthProvider';

// Component exports
export { LoginForm } from './components/LoginForm';
export { GoogleSignInButton } from './components/GoogleSignInButton';
export { PasswordAuthForm } from './components/PasswordAuthForm';
export { AuthStateListener } from './components/AuthStateListener';

// Guard exports
export { withAuth } from './guards/withAuth';
export { RequireAuth } from './guards/RequireAuth';
export { RequireAdmin } from './guards/RequireAdmin';

// Hook exports
export { useAuthState } from './hooks/useAuthState';
export { useRequireAuth } from './hooks/useRequireAuth';

// Utils exports
export { isAdmin } from './utils/isAdmin';

// Note: Server-side utilities (getAuthUser, getCurrentUsername, ensureUserExists) 
// are available via @eptss/auth/server to avoid bundling next/headers in client code

// Type exports
export type { AuthUser, AuthSession } from './types';