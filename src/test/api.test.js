import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError, apiFetch, apiPostJson, apiPostForm, apiPatchJson } from "../lib/api";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("ApiError", () => {
  it("stores code, status, and payload", () => {
    const err = new ApiError("fail", { code: "x/y", status: 400, payload: { a: 1 } });
    expect(err.message).toBe("fail");
    expect(err.code).toBe("x/y");
    expect(err.status).toBe(400);
    expect(err.payload).toEqual({ a: 1 });
    expect(err.name).toBe("ApiError");
  });

  it("defaults optional fields", () => {
    const err = new ApiError("fail");
    expect(err.code).toBeNull();
    expect(err.status).toBe(0);
    expect(err.payload).toBeNull();
  });
});

describe("apiFetch", () => {
  it("returns parsed JSON for successful response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ data: 42 }),
    });
    const result = await apiFetch("/test");
    expect(result).toEqual({ data: 42 });
    expect(fetch).toHaveBeenCalledWith("/test", { credentials: "include" });
  });

  it("returns null for empty body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => "",
    });
    expect(await apiFetch("/empty")).toBeNull();
  });

  it("throws ApiError with detail.message for object detail", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () =>
        JSON.stringify({
          detail: { code: "auth/not_authenticated", message: "Not authenticated" },
        }),
    });
    await expect(apiFetch("/fail")).rejects.toThrow("Not authenticated");
    try {
      await apiFetch("/fail");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.code).toBe("auth/not_authenticated");
      expect(e.status).toBe(401);
    }
  });

  it("throws ApiError for array detail (validation errors)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
      text: async () =>
        JSON.stringify({ detail: [{ msg: "field required", loc: ["body", "email"] }] }),
    });
    await expect(apiFetch("/validate")).rejects.toThrow("field required");
  });

  it("throws ApiError for string detail", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      text: async () => JSON.stringify({ detail: "Origin not allowed" }),
    });
    await expect(apiFetch("/forbidden")).rejects.toThrow("Origin not allowed");
  });

  it("uses statusText when no body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: async () => "",
    });
    await expect(apiFetch("/crash")).rejects.toThrow("Internal Server Error");
  });

  it("handles non-JSON text body in error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      text: async () => "nginx error page",
    });
    await expect(apiFetch("/proxy-fail")).rejects.toThrow("nginx error page");
  });
});

describe("apiPostJson", () => {
  it("sends JSON content-type and stringified body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });
    await apiPostJson("/register", { email: "a@b.c", password: "12345678" });
    expect(fetch).toHaveBeenCalledWith(
      "/register",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: "a@b.c", password: "12345678" }),
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });
});

describe("apiPatchJson", () => {
  it("sends PATCH with JSON body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });
    await apiPatchJson("/me/profile", { bio: "x" });
    expect(fetch).toHaveBeenCalledWith(
      "/me/profile",
      expect.objectContaining({
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ bio: "x" }),
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });
});

describe("apiPostForm", () => {
  it("sends URL-encoded body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });
    await apiPostForm("/login", { username: "a@b.c", password: "secret" });
    const call = fetch.mock.calls[0];
    expect(call[1].method).toBe("POST");
    expect(call[1].body).toBeInstanceOf(URLSearchParams);
    expect(call[1].body.get("username")).toBe("a@b.c");
    expect(call[1].body.get("password")).toBe("secret");
  });
});
