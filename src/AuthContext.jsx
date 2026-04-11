import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, apiPostForm, apiPostJson } from "./shared/lib/api";

const USER_STORAGE_KEY = "shorty-auth-user";
const DEFAULT_EMOJI = "⚡️";
const REFRESH_INTERVAL_MS = 8 * 60 * 1000;

const AuthContext = createContext(null);

/**
 * Reads persisted auth snapshot from localStorage.
 * This snapshot is used for instant client boot while session refresh runs.
 */
function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      ...parsed,
      emoji: parsed.emoji || DEFAULT_EMOJI,
    };
  } catch {
    return null;
  }
}

function storeUser(user) {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  /**
   * Commits user state to both React state and localStorage.
   */
  const commitUser = useCallback((nextUser) => {
    setUser(nextUser);
    storeUser(nextUser);
  }, []);

  /**
   * Register creates a backend account and persists the resulting user snapshot
   * locally until `/me` endpoint becomes the canonical profile source.
   */
  const register = useCallback(
    async ({ username, email, password, emoji }) => {
      const data = await apiPostJson("/auth/register", {
        username,
        email,
        password,
      });

      const nextUser = {
        ...(data?.user || {}),
        emoji: emoji || DEFAULT_EMOJI,
      };
      commitUser(nextUser);
      return nextUser;
    },
    [commitUser],
  );

  const login = useCallback(
    async ({ email, password }) => {
      const data = await apiPostForm("/auth/login", {
        username: email,
        password,
      });

      // Preserve custom emoji when the same user logs in again on this device.
      const previous = readStoredUser();
      const nextUser = {
        ...(data?.user || {}),
        emoji:
          previous?.email === data?.user?.email
            ? previous?.emoji || DEFAULT_EMOJI
            : DEFAULT_EMOJI,
      };

      commitUser(nextUser);
      return nextUser;
    },
    [commitUser],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      commitUser(null);
    }
  }, [commitUser]);

  /**
   * Refreshes cookie-based auth session.
   * `silent` refreshes should not trigger global network indicator.
   */
  const refreshSession = useCallback(
    async ({ clearOnFail = false } = {}) => {
      try {
        await apiFetch("/auth/refresh", { method: "POST", silent: true });
        return true;
      } catch {
        if (clearOnFail) {
          commitUser(null);
        }
        return false;
      }
    },
    [commitUser],
  );

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      // We only bootstrap refresh when user snapshot exists in local storage.
      const stored = readStoredUser();
      if (!stored) {
        if (isMounted) setIsBootstrapping(false);
        return;
      }

      const refreshed = await refreshSession({ clearOnFail: true });
      if (isMounted) {
        if (!refreshed) {
          commitUser(null);
        }
        setIsBootstrapping(false);
      }
    };

    bootstrap();
    return () => {
      isMounted = false;
    };
  }, [commitUser, refreshSession]);

  useEffect(() => {
    if (!user) return undefined;

    // Keep cookie-based session alive in the background for active users.
    const id = window.setInterval(() => {
      refreshSession({ clearOnFail: true });
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [refreshSession, user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      register,
      login,
      logout,
      refreshSession,
      setUser: commitUser,
    }),
    [commitUser, isBootstrapping, login, logout, refreshSession, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

export const AUTH_DEFAULT_EMOJI = DEFAULT_EMOJI;
