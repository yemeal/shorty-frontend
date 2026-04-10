import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRecentLinks } from "../hooks/useRecentLinks";

beforeEach(() => {
  localStorage.clear();
});

const link = (n) => ({
  shortUrl: `шорти.рф/test${n}`,
  original: `https://example.com/${n}`,
  date: new Date().toISOString(),
});

describe("useRecentLinks", () => {
  it("starts empty when localStorage is clean", () => {
    const { result } = renderHook(() => useRecentLinks());
    expect(result.current.recentLinks).toEqual([]);
  });

  it("adds a link", () => {
    const { result } = renderHook(() => useRecentLinks());
    act(() => result.current.addLink(link(1)));
    expect(result.current.recentLinks).toHaveLength(1);
    expect(result.current.recentLinks[0].shortUrl).toBe("шорти.рф/test1");
  });

  it("prepends new links (newest first)", () => {
    const { result } = renderHook(() => useRecentLinks());
    act(() => result.current.addLink(link(1)));
    act(() => result.current.addLink(link(2)));
    expect(result.current.recentLinks[0].shortUrl).toBe("шорти.рф/test2");
    expect(result.current.recentLinks[1].shortUrl).toBe("шорти.рф/test1");
  });

  it("limits to 5 links", () => {
    const { result } = renderHook(() => useRecentLinks());
    for (let i = 1; i <= 7; i++) {
      act(() => result.current.addLink(link(i)));
    }
    expect(result.current.recentLinks).toHaveLength(5);
    expect(result.current.recentLinks[0].shortUrl).toBe("шорти.рф/test7");
  });

  it("deduplicates by shortUrl (moves existing to top)", () => {
    const { result } = renderHook(() => useRecentLinks());
    act(() => result.current.addLink(link(1)));
    act(() => result.current.addLink(link(2)));
    act(() => result.current.addLink(link(1)));
    expect(result.current.recentLinks).toHaveLength(2);
    expect(result.current.recentLinks[0].shortUrl).toBe("шорти.рф/test1");
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useRecentLinks());
    act(() => result.current.addLink(link(1)));
    const stored = JSON.parse(localStorage.getItem("shorty-recent-links"));
    expect(stored).toHaveLength(1);
  });

  it("clears history", () => {
    const { result } = renderHook(() => useRecentLinks());
    act(() => result.current.addLink(link(1)));
    act(() => result.current.clearHistory());
    expect(result.current.recentLinks).toEqual([]);
  });

  it("loads from localStorage on init", () => {
    localStorage.setItem(
      "shorty-recent-links",
      JSON.stringify([link(99)]),
    );
    const { result } = renderHook(() => useRecentLinks());
    expect(result.current.recentLinks).toHaveLength(1);
    expect(result.current.recentLinks[0].shortUrl).toBe("шорти.рф/test99");
  });

  it("handles corrupt localStorage gracefully", () => {
    localStorage.setItem("shorty-recent-links", "NOT_JSON");
    const { result } = renderHook(() => useRecentLinks());
    expect(result.current.recentLinks).toEqual([]);
  });

  it("handles non-array localStorage gracefully", () => {
    localStorage.setItem("shorty-recent-links", JSON.stringify({ bad: true }));
    const { result } = renderHook(() => useRecentLinks());
    expect(result.current.recentLinks).toEqual([]);
  });
});
