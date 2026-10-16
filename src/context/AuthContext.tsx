import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api, authStorage } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  demoLogin: (role: 'student' | 'admin') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = authStorage.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const current = await api.getCurrentUser();
      setUser(current);
    } catch {
      authStorage.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    authStorage.setToken(res.token);
    setUser(res.user);
  };

  const register = async (name: string, email: string, pass: string) => {
    const res = await api.register(name, email, pass);
    authStorage.setToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Even if network fails, clear local storage
    }
    setUser(null);
  };

  const demoLogin = async (role: 'student' | 'admin') => {
    if (role === 'admin') {
      await login('admin@truthlens.ai', 'AdminPass123!');
    } else {
      await login('student@truthlens.ai', 'DemoPass123!');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        demoLogin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
