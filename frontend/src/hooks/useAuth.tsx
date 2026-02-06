import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { auth as authApi } from '../api/client';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const data = await authApi.me();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const data = await authApi.login(email, password);
      setUser(data);
    } catch (err: any) {
      setError(err.message || 'Kunne ikke logge inn');
      throw err;
    }
  };

  const register = async (email: string, name: string, password: string) => {
    setError(null);
    try {
      const data = await authApi.register(email, name, password);
      setUser(data);
    } catch (err: any) {
      setError(err.message || 'Kunne ikke opprette bruker');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {} finally {
      setUser(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
