import { apiFetch } from "../../../shared/lib/api";

/**
 * DELETE /me/short_urls/{id} — cookie auth; triggers global network activity indicator.
 * @param {string} shortUrlId — UUID
 */
export async function deleteMyShortUrl(shortUrlId) {
  const path = `/me/short_urls/${encodeURIComponent(shortUrlId)}`;
  return apiFetch(path, { method: "DELETE" });
}
