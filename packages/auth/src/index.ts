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
export { getAuthUser } from './utils/getAuthUser';

// Type exports
export type { AuthUser, AuthSession } from './types';