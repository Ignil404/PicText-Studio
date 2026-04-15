import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import axios from 'axios';
import { getSessionId } from '@/lib/session';

// ─── Types ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  created_at: string;
  render_count: number;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  sessionId: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Axios setup ────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: '',
  withCredentials: true, // send cookies for refresh token
});

// Attach access token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic token refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retried) {
      original._retried = true;
      try {
        const refreshRes = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const { access_token } = refreshRes.data;
        localStorage.setItem('access_token', access_token);
        original.headers.Authorization = `Bearer ${access_token}`;
        return api(original);
      } catch {
        // Refresh failed — clear state, redirect to login
        localStorage.removeItem('access_token');
        window.location.href = '/auth';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

// ─── Provider ───────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem('access_token'),
  );
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    const response = await api.get<User>('/api/auth/me');
    setUser(response.data);
  }, []);

  // Fetch user profile if we have a token
  useEffect(() => {
    if (!accessToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    api
      .get<User>('/api/auth/me')
      .then((res) => {
        if (!cancelled) {
          setUser(res.data);
        }
      })
      .catch(() => {
        // Token invalid — clear it
        if (!cancelled) {
          localStorage.removeItem('access_token');
          setAccessToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await axios.post(
      '/api/auth/login',
      { email, password },
      { withCredentials: true },
    );
    const { access_token } = res.data;
    localStorage.setItem('access_token', access_token);
    setAccessToken(access_token);
    await fetchCurrentUser();

    // Guest → user migration
    const sid = getSessionId();
    if (sid) {
      try {
        await api.post('/api/auth/migrate-session', { session_id: sid });
        await fetchCurrentUser();
      } catch {
        // Migration failure is non-fatal
      }
    }
  }, [fetchCurrentUser]);

  const register = useCallback(async (email: string, password: string) => {
    await axios.post(
      '/api/auth/register',
      { email, password },
      { withCredentials: true },
    );
    await login(email, password);
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout', {}, { withCredentials: true });
    } catch {
      // Server unreachable — clear local state anyway
    }
    localStorage.removeItem('access_token');
    setAccessToken(null);
    setUser(null);
    window.location.assign('/');
  }, []);

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider
      value={{ user, accessToken, sessionId, isLoading, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export { api };
