'use client';

/**
 * auth.ts – React Auth Context
 * Provides authentication state and helpers to the whole app.
 * Token is stored in localStorage; user object is rehydrated via /api/auth/me on mount.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, setToken, clearToken, getToken } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'agent' | 'consultant';
  site?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, try to rehydrate session from stored token
  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await authApi.me();
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          clearToken();
        }
      } catch {
        // Token invalid / expired — clear it
        clearToken();
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (!res.success) throw new Error('Login failed');
    setToken(res.data.access_token);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    clearToken();
    setUser(null);
    window.location.href = '/login';
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
