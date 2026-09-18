import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { clearTokens, isAuthenticated as checkAuth, login as loginApi } from '../api/client';
import { getMe } from '../api/auth';
import type { AdminUser } from '../types';

interface AuthContextValue {
  authenticated: boolean;
  // True until the initial /me/ fetch (if any) has resolved — lets
  // role-gated UI avoid a flash of "no access" before it knows better.
  loading: boolean;
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(checkAuth());
  const [loading, setLoading] = useState(checkAuth());
  const [user, setUser] = useState<AdminUser | null>(null);

  async function loadMe() {
    try {
      const data = await getMe();
      setUser(data);
    } catch {
      // A hard-failing /me/ on an expired session already gets routed to
      // /login by apiFetch itself — nothing else to do here.
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authenticated) {
      loadMe();
    } else {
      setLoading(false);
    }
    // Only ever needs to run once on mount — login()/logout() manage
    // this state explicitly from then on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    await loginApi(email, password);
    setAuthenticated(true);
    setLoading(true);
    await loadMe();
  }

  function logout() {
    clearTokens();
    setAuthenticated(false);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ authenticated, loading, user, login, logout, refresh: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
