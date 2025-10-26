"use client";

import { createContext, useContext } from 'react';
import type { AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // This is a placeholder - implement full auth context if needed
  // For now, individual hooks like useAuthState work fine
  return <>{children}</>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}