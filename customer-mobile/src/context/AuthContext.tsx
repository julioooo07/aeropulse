import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authStorage } from "@/services/authStorage";
import {
  forgotPassword,
  getCurrentUser,
  getSession,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  requestOtp,
  resetPassword,
  saveSessionCart,
  startRegistration,
  verifyOtp,
  verifyRegistrationCode,
} from "@/services/authService";
import type { User } from "@/types/domain";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  role: string | null;
  hydrated: boolean;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<string | null>;
  register: (payload: Record<string, unknown>) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  requestRegistrationStart: (email: string) => Promise<any>;
  verifyRegistration: (payload: { email: string; code: string; secret: string }) => Promise<any>;
  requestOtp: (payload: Record<string, unknown>) => Promise<any>;
  verifyOtp: (payload: Record<string, unknown>) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (payload: Record<string, unknown>) => Promise<any>;
  syncSessionCart: (cart: unknown[]) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadUser = async () => {
    try {
      const result = await getCurrentUser();
      setUser(result.user || result);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = await authStorage.getToken();
      setToken(storedToken);
      if (storedToken) {
        await loadUser();
      }
      setHydrated(true);
    };
    bootstrap();
  }, []);

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    try {
      const result = await loginRequest(identifier, password);
      await authStorage.setToken(result.token);
      setToken(result.token);
      setUser(result.user as User);
      return ((result.user as User)?.role as string) || null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: Record<string, unknown>) => {
    setLoading(true);
    try {
      const result = await registerRequest(payload);
      await authStorage.setToken(result.token);
      setToken(result.token);
      setUser(result.user as User);
      return ((result.user as User)?.role as string) || null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch {
      // Best effort only.
    } finally {
      await authStorage.setToken(null);
      setToken(null);
      setUser(null);
    }
  };

  const refreshSession = async () => {
    await loadUser();
    try {
      await getSession();
    } catch {
      // Session cart is best-effort.
    }
  };

  const syncSessionCart = async (cart: unknown[]) => {
    await saveSessionCart(cart);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      role: user?.role ? String(user.role) : null,
      hydrated,
      loading,
      login,
      register,
      logout,
      refreshSession,
      requestRegistrationStart: startRegistration,
      verifyRegistration: verifyRegistrationCode,
      requestOtp,
      verifyOtp,
      forgotPassword,
      resetPassword,
      syncSessionCart,
    }),
    [hydrated, loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
