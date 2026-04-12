import { apiFetch } from "../../../shared/lib/api";
import { mapProfileShortyFromApi } from "../../../entities/short-link/model/mapProfileShortyFromApi";

/**
 * @param {object} params
 * @param {number} params.page
 * @param {number} params.pageSize
 * @param {string} params.sortBy
 * @param {string} params.sortOrder
 * @param {string} [params.q]
 * @returns {Promise<{ items: import("../../../entities/short-link/model/shortLink.types").ProfileShorty[], meta: import("../../../entities/short-link/model/shortLink.types").PaginationMetaApi }>}
 */
export async function fetchMyShortUrls({ page, pageSize, sortBy, sortOrder, q }) {
  const search = new URLSearchParams();
  search.set("page", String(page));
  search.set("page_size", String(pageSize));
  search.set("sort_by", sortBy);
  search.set("sort_order", sortOrder);
  const trimmed = (q || "").trim();
  if (trimmed) search.set("q", trimmed);

  const payload = await apiFetch(`/me/short_urls?${search.toString()}`);

  if (
    !payload ||
    typeof payload !== "object" ||
    !Array.isArray(payload.items) ||
    !payload.meta ||
    typeof payload.meta !== "object"
  ) {
    throw new Error("Invalid short URLs response");
  }

  const items = payload.items.map(mapProfileShortyFromApi);
  return { items, meta: payload.meta };
}
