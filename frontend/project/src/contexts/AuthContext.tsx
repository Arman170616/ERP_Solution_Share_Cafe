import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, isLoggedIn, setOnAuthExpired, setTokens } from '../lib/api';

export type Role = 'admin' | 'manager' | 'staff';

export type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: Role;
  is_active: boolean;
  date_joined: string;
};

type Tokens = { access: string; refresh: string };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => setUser(null), []);

  useEffect(() => {
    setOnAuthExpired(clearSession);
  }, [clearSession]);

  useEffect(() => {
    (async () => {
      if (!isLoggedIn()) {
        setLoading(false);
        return;
      }
      try {
        setUser(await api.get<User>('/accounts/me/'));
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    })();
  }, [clearSession]);

  const login = useCallback(async (username: string, password: string) => {
    const tokens = await api.post<Tokens>('/accounts/login/', { username, password }, { skipAuth: true });
    setTokens(tokens);
    setUser(await api.get<User>('/accounts/me/'));
  }, []);

  const signup = useCallback(async (username: string, password: string, email?: string) => {
    const tokens = await api.post<Tokens>(
      '/accounts/signup/',
      { username, password, email },
      { skipAuth: true }
    );
    setTokens(tokens);
    setUser(await api.get<User>('/accounts/me/'));
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/accounts/logout/', { refresh: localStorage.getItem('refresh') });
    } catch {
      // best-effort: still clear local session even if the network call fails
    }
    setTokens(null);
    clearSession();
  }, [clearSession]);

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
