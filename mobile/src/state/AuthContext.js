import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthApi } from "../services/api";
import { BRANCH_KEY, clearToken, getJson, getToken, removeMany, saveToken, setJson, USER_KEY } from "../services/storage";

const AuthContext = createContext(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback(async (token, nextUser) => {
    const branch = nextUser?.activeBranch || nextUser?.assignedBranch || "";
    await saveToken(token);
    await setJson(USER_KEY, nextUser);
    await setJson(BRANCH_KEY, branch || null);
    setUser(nextUser);
  }, []);

  const refreshMe = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setLoading(false);
      return null;
    }
    try {
      const result = await AuthApi.me();
      await persistSession(token, result.user);
      return result.user;
    } catch (_error) {
      await clearToken();
      await removeMany([USER_KEY, BRANCH_KEY]);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const cached = await getJson(USER_KEY, null);
      if (mounted && cached) setUser(cached);
      await refreshMe();
    })();
    return () => {
      mounted = false;
    };
  }, [refreshMe]);

  const login = useCallback(async ({ identifier, password, branch }) => {
    const result = await AuthApi.login({ identifier, password, branch });
    await persistSession(result.token, result.user);
    return result.user;
  }, [persistSession]);

  const register = useCallback(async (payload) => {
    const result = await AuthApi.register(payload);
    if (result.token) await persistSession(result.token, result.user);
    return result.user;
  }, [persistSession]);

  const logout = useCallback(async () => {
    try {
      await AuthApi.logout();
    } catch (_error) {
      // Local logout should still complete if the network is down.
    }
    await clearToken();
    await removeMany([USER_KEY, BRANCH_KEY]);
    setUser(null);
  }, []);

  const updateCachedUser = useCallback(async (nextUser) => {
    setUser(nextUser);
    await setJson(USER_KEY, nextUser);
    const branch = nextUser?.activeBranch || nextUser?.assignedBranch || "";
    await setJson(BRANCH_KEY, branch || null);
  }, []);

  const value = useMemo(() => ({
    user,
    role: user?.role || null,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refreshMe,
    updateCachedUser
  }), [user, loading, login, register, logout, refreshMe, updateCachedUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
