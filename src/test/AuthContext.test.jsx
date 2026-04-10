import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { AuthProvider, useAuth, AUTH_DEFAULT_EMOJI } from "../AuthContext";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe("AUTH_DEFAULT_EMOJI", () => {
  it("is the lightning bolt", () => {
    expect(AUTH_DEFAULT_EMOJI).toBe("⚡️");
  });
});

describe("useAuth — initial state", () => {
  it("starts unauthenticated with no stored user", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("reads stored user from localStorage", async () => {
    localStorage.setItem(
      "shorty-auth-user",
      JSON.stringify({ id: 1, username: "u", email: "a@b.c", emoji: "🦊" }),
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));
    expect(result.current.user).not.toBeNull();
    expect(result.current.user.username).toBe("u");
    expect(result.current.user.emoji).toBe("🦊");
  });

  it("clears user if refresh fails on bootstrap", async () => {
    localStorage.setItem(
      "shorty-auth-user",
      JSON.stringify({ id: 1, username: "u", email: "a@b.c" }),
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () => JSON.stringify({ detail: "Not authenticated" }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});

describe("useAuth — login", () => {
  it("calls /auth/login and stores user", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({ user: { id: 1, username: "u", email: "a@b.c" } }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));

    await act(async () => {
      await result.current.login({ email: "a@b.c", password: "12345678" });
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.user.email).toBe("a@b.c");
    expect(result.current.isAuthenticated).toBe(true);
    const stored = JSON.parse(localStorage.getItem("shorty-auth-user"));
    expect(stored.email).toBe("a@b.c");
  });

  it("assigns default emoji for new user", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({ user: { id: 1, username: "u", email: "new@b.c" } }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));

    await act(async () => {
      await result.current.login({ email: "new@b.c", password: "12345678" });
    });

    expect(result.current.user.emoji).toBe(AUTH_DEFAULT_EMOJI);
  });

  it("preserves emoji for returning user", async () => {
    localStorage.setItem(
      "shorty-auth-user",
      JSON.stringify({ email: "a@b.c", emoji: "🐼" }),
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({ user: { id: 1, username: "u", email: "a@b.c" } }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));

    await act(async () => {
      await result.current.login({ email: "a@b.c", password: "12345678" });
    });

    expect(result.current.user.emoji).toBe("🐼");
  });
});

describe("useAuth — register", () => {
  it("calls /auth/register and stores user with emoji", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({ user: { id: 2, username: "newguy", email: "n@b.c" } }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));

    await act(async () => {
      await result.current.register({
        username: "newguy",
        email: "n@b.c",
        password: "12345678",
        emoji: "🔥",
      });
    });

    expect(result.current.user.username).toBe("newguy");
    expect(result.current.user.emoji).toBe("🔥");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("uses default emoji when none provided", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({ user: { id: 2, username: "u", email: "n@b.c" } }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));

    await act(async () => {
      await result.current.register({
        username: "u",
        email: "n@b.c",
        password: "12345678",
      });
    });

    expect(result.current.user.emoji).toBe(AUTH_DEFAULT_EMOJI);
  });
});

describe("useAuth — logout", () => {
  it("clears user and calls /auth/logout", async () => {
    localStorage.setItem(
      "shorty-auth-user",
      JSON.stringify({ id: 1, username: "u", email: "a@b.c" }),
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("shorty-auth-user")).toBeNull();
  });

  it("clears user even if logout API fails", async () => {
    localStorage.setItem(
      "shorty-auth-user",
      JSON.stringify({ id: 1, username: "u", email: "a@b.c" }),
    );
    vi.spyOn(globalThis, "fetch").mockImplementation(async (path) => {
      if (String(path).includes("/auth/refresh")) {
        return { ok: true, text: async () => JSON.stringify({ ok: true }) };
      }
      throw new Error("network down");
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));

    await act(async () => {
      try { await result.current.logout(); } catch {}
    });

    expect(result.current.user).toBeNull();
  });
});

describe("useAuth — refreshSession", () => {
  it("returns true on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));

    let refreshed;
    await act(async () => {
      refreshed = await result.current.refreshSession();
    });
    expect(refreshed).toBe(true);
  });

  it("returns false and clears user on failure with clearOnFail", async () => {
    localStorage.setItem(
      "shorty-auth-user",
      JSON.stringify({ id: 1, username: "u", email: "a@b.c" }),
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () => JSON.stringify({ detail: "expired" }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));
    expect(result.current.user).toBeNull();
  });
});

describe("useAuth — localStorage edge cases", () => {
  it("handles corrupt localStorage user", async () => {
    localStorage.setItem("shorty-auth-user", "NOT_JSON");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error());
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("handles non-object localStorage user", async () => {
    localStorage.setItem("shorty-auth-user", JSON.stringify("just a string"));
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error());
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));
    expect(result.current.user).toBeNull();
  });
});
