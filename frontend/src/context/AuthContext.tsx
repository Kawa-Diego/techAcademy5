import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import type {
  LoginPayload,
  LoginResponse,
  RegisterUserPayload,
  UpdateUserPayload,
  UserPublic,
} from '@ecommerce/shared';
import { httpJson } from '../services/http';

const TOKEN_KEY = 'ecommerce_token';

export type AuthContextValue = {
  readonly user: UserPublic | null;
  readonly token: string | null;
  readonly loading: boolean;
  readonly login: (payload: LoginPayload) => Promise<LoginResponse>;
  readonly register: (payload: RegisterUserPayload) => Promise<void>;
  readonly logout: () => void;
  readonly updateProfile: (payload: UpdateUserPayload) => Promise<void>;
  readonly refreshUser: () => Promise<void>;
  readonly deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const loadToken = (): string | null => localStorage.getItem(TOKEN_KEY);

const persistToken = (value: string): void => {
  localStorage.setItem(TOKEN_KEY, value);
};

const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const AuthProvider = ({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement => {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<void> => {
    const t = loadToken();
    if (t === null) {
      setUser(null);
      setToken(null);
      return;
    }
    const me = await httpJson<UserPublic>('/users/me', { method: 'GET' }, t);
    setToken(t);
    setUser(me);
  }, []);

  useEffect(() => {
    const run = async (): Promise<void> => {
      const t = loadToken();
      if (t === null) {
        setLoading(false);
        return;
      }
      try {
        await refreshUser();
      } catch {
        clearToken();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [refreshUser]);

  const login = useCallback(async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await httpJson<LoginResponse>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(payload) },
      null
    );
    persistToken(res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  }, []);

  const register = useCallback(async (payload: RegisterUserPayload) => {
    await httpJson<UserPublic>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(payload) },
      null
    );
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload: UpdateUserPayload) => {
    const t = loadToken();
    if (t === null) throw new Error('Session expired');
    const next = await httpJson<UserPublic>(
      '/users/me',
      { method: 'PATCH', body: JSON.stringify(payload) },
      t
    );
    setUser(next);
  }, []);

  const deleteAccount = useCallback(async (): Promise<void> => {
    const t = loadToken();
    if (t === null) throw new Error('Session expired');
    await httpJson<undefined>(
      '/users/me',
      { method: 'DELETE' },
      t
    );
    clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
      deleteAccount,
    }),
    [
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
      deleteAccount,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const v = useContext(AuthContext);
  if (v === null) throw new Error('AuthProvider is required');
  return v;
};
