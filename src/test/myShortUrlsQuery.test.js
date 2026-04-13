import { describe, it, expect } from "vitest";
import {
  uiSortToApiSort,
  PROFILE_SHORTIES_PAGE_SIZE,
  PROFILE_SEARCH_DEBOUNCE_MS,
} from "../features/profile/model/myShortUrlsQuery";

describe("myShortUrlsQuery", () => {
  it("exports page size matching backend default", () => {
    expect(PROFILE_SHORTIES_PAGE_SIZE).toBe(5);
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
