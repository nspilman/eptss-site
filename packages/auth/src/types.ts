export interface AuthUser {
  userId: string;
  email: string;
  username?: string;
}

export interface AuthSession {
  user: AuthUser | null;
  isLoading: boolean;
  error?: string;
}

export interface AuthContextType extends AuthSession {
  signIn: (email: string, redirectUrl?: string) => Promise<void>;
  signInWithPassword: (username: string, password: string) => Promise<void>;
  signInWithGoogle: (redirectUrl?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}