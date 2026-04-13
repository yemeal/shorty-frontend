import { describe, it, expect } from "vitest";
import { buildCompactPaginationItems } from "../features/profile/model/profilePagination";

describe("buildCompactPaginationItems", () => {
  it("returns empty for total < 1", () => {
    expect(buildCompactPaginationItems(1, 0)).toEqual([]);
  });

  it("returns all pages when total <= 7", () => {
    expect(buildCompactPaginationItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("collapses middle with ellipses for large totals", () => {
    expect(buildCompactPaginationItems(8, 15)).toEqual([1, "ellipsis", 7, 8, 9, "ellipsis", 15]);
    expect(buildCompactPaginationItems(2, 15)).toEqual([1, 2, 3, "ellipsis", 15]);
    expect(buildCompactPaginationItems(14, 15)).toEqual([1, "ellipsis", 13, 14, 15]);
  });
});
