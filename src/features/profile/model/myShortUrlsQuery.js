/** Matches backend default page_size (see PaginationParams). */
export const PROFILE_SHORTIES_PAGE_SIZE = 5;

/**
 * Maps toolbar sort value to API query fields.
 * @param {string} uiSort newest | oldest | clicks_desc | clicks_asc
 * @returns {{ sort_by: string, sort_order: string }}
 */
export function uiSortToApiSort(uiSort) {
  switch (uiSort) {
    case "oldest":
      return { sort_by: "created_at", sort_order: "asc" };
    case "clicks_desc":
      return { sort_by: "usage_count", sort_order: "desc" };
    case "clicks_asc":
      return { sort_by: "usage_count", sort_order: "asc" };
    case "newest":
    default:
      return { sort_by: "created_at", sort_order: "desc" };
  }
}
