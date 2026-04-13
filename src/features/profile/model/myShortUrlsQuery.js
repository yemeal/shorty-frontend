/** Matches backend default page_size (see PaginationParams). */
export const PROFILE_SHORTIES_PAGE_SIZE_DEFAULT = 5;

/** @deprecated use PROFILE_SHORTIES_PAGE_SIZE_DEFAULT; kept for tests and imports */
export const PROFILE_SHORTIES_PAGE_SIZE = PROFILE_SHORTIES_PAGE_SIZE_DEFAULT;

/** Backend PaginationParams: ge=1, le=20 */
export const PROFILE_SHORTIES_PAGE_SIZE_MIN = 1;
export const PROFILE_SHORTIES_PAGE_SIZE_MAX = 20;

/**
 * @param {string | null | undefined} raw
 * @returns {number}
 */
export function parseProfilePageSizeParam(raw) {
  if (raw == null || raw === "") return PROFILE_SHORTIES_PAGE_SIZE_DEFAULT;
  const n = Number(raw);
  if (!Number.isFinite(n)) return PROFILE_SHORTIES_PAGE_SIZE_DEFAULT;
  return Math.min(
    PROFILE_SHORTIES_PAGE_SIZE_MAX,
    Math.max(PROFILE_SHORTIES_PAGE_SIZE_MIN, Math.floor(n)),
  );
}

/** Delay before search query triggers GET /me/short_urls (reduces server load). */
export const PROFILE_SEARCH_DEBOUNCE_MS = 500;

/** Delay after page size changes before refetch (fewer requests while dragging the slider). */
export const PROFILE_PAGE_SIZE_DEBOUNCE_MS = 450;

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
