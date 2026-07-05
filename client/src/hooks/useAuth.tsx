import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, getToken, setToken, clearToken } from '../services/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setIsLoading(false);
      return;
    }

    authApi
      .me()
      .then((res) => setUser(res.user))
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      clearToken();
      setUser(null);
    }

    window.addEventListener('nordcore:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('nordcore:unauthorized', handleUnauthorized);
  }, []);

  async function login(username: string, password: string) {
    const { token } = await authApi.login(username, password);
    setToken(token);
    const { user: loggedInUser } = await authApi.me();
    setUser(loggedInUser);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
