import { describe, it, expect } from "vitest";
import {
  uiSortToApiSort,
  PROFILE_SHORTIES_PAGE_SIZE,
  PROFILE_SHORTIES_PAGE_SIZE_DEFAULT,
  PROFILE_SHORTIES_PAGE_SIZE_MAX,
  PROFILE_SHORTIES_PAGE_SIZE_MIN,
  PROFILE_SEARCH_DEBOUNCE_MS,
  parseProfilePageSizeParam,
} from "../features/profile/model/myShortUrlsQuery";

describe("myShortUrlsQuery", () => {
  it("exports page size matching backend default", () => {
    expect(PROFILE_SHORTIES_PAGE_SIZE).toBe(5);
    expect(PROFILE_SHORTIES_PAGE_SIZE_DEFAULT).toBe(5);
    expect(PROFILE_SHORTIES_PAGE_SIZE_MIN).toBe(1);
    expect(PROFILE_SHORTIES_PAGE_SIZE_MAX).toBe(20);
  });

  it("parseProfilePageSizeParam clamps to backend bounds", () => {
    expect(parseProfilePageSizeParam(null)).toBe(5);
    expect(parseProfilePageSizeParam("")).toBe(5);
    expect(parseProfilePageSizeParam("1")).toBe(1);
    expect(parseProfilePageSizeParam("20")).toBe(20);
    expect(parseProfilePageSizeParam("0")).toBe(1);
    expect(parseProfilePageSizeParam("99")).toBe(20);
    expect(parseProfilePageSizeParam("12")).toBe(12);
  });

  it("exports search debounce for profile list", () => {
    expect(PROFILE_SEARCH_DEBOUNCE_MS).toBe(500);
  });

  it("maps UI sort to API params", () => {
    expect(uiSortToApiSort("newest")).toEqual({ sort_by: "created_at", sort_order: "desc" });
    expect(uiSortToApiSort("oldest")).toEqual({ sort_by: "created_at", sort_order: "asc" });
    expect(uiSortToApiSort("clicks_desc")).toEqual({ sort_by: "usage_count", sort_order: "desc" });
    expect(uiSortToApiSort("clicks_asc")).toEqual({ sort_by: "usage_count", sort_order: "asc" });
    expect(uiSortToApiSort("unknown")).toEqual({ sort_by: "created_at", sort_order: "desc" });
  });
});
