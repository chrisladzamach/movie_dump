import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User } from '../types';
import * as authService from '../services/auth.service';
import { connectSocket, disconnectSocket } from '../services/socket.service';

interface AuthContextValue {
  user: User | null;
  otherUsers: User[];
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [otherUsers, setOtherUsers] = useState<User[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    const profile = await authService.getProfile();
    setUser(profile.user);
    setOtherUsers(profile.otherUsers);
  }, [token]);

  useEffect(() => {
    async function init() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        await refreshProfile();
        connectSocket(token);
      } catch {
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [token, refreshProfile]);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    localStorage.setItem('token', result.token);
    setToken(result.token);
    setUser(result.user);
    connectSocket(result.token);
    await refreshProfile();
  };

  const register = async (username: string, email: string, password: string) => {
    const result = await authService.register(username, email, password);
    localStorage.setItem('token', result.token);
    setToken(result.token);
    setUser(result.user);
    connectSocket(result.token);
    await refreshProfile();
  };

  const logout = () => {
    localStorage.removeItem('token');
    disconnectSocket();
    setToken(null);
    setUser(null);
    setOtherUsers([]);
  };

  return (
    <AuthContext.Provider
      value={{ user, otherUsers, token, loading, login, register, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
