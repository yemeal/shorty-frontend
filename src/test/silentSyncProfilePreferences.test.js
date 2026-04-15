import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  silentSyncProfilePreferences,
  themeAfterHeaderToggle,
} from "../features/profile/api/silentSyncProfilePreferences";

describe("themeAfterHeaderToggle", () => {
  it("toggles light and dark", () => {
    expect(themeAfterHeaderToggle("light")).toBe("dark");
    expect(themeAfterHeaderToggle("dark")).toBe("light");
  });

  it("from system flips relative to prefers-color-scheme", () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: String(query).includes("dark") ? true : false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    expect(themeAfterHeaderToggle("system")).toBe("light");
  });
});

describe("silentSyncProfilePreferences", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does not fetch when patch is empty", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => "{}",
    });
    silentSyncProfilePreferences({});
    silentSyncProfilePreferences({ ui_language: "xx" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sends silent PATCH for ui_language", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => "{}",
    });
    silentSyncProfilePreferences({ ui_language: "ru" });
    expect(fetchSpy).toHaveBeenCalledWith(
      "/me/profile",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ ui_language: "ru" }),
      }),
    );
  });
});
