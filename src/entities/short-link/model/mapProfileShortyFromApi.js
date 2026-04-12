import { buildPublicShortUrlDisplay } from "../../../shared/lib/publicShortUrl";

/**
 * Maps GET /me/short_urls item to profile card shape.
 * @param {import("./shortLink.types").ShortUrlApiItem} row
 * @returns {import("./shortLink.types").ProfileShorty}
 */
export function mapProfileShortyFromApi(row) {
  return {
    id: String(row.id),
    slug: row.slug,
    short: buildPublicShortUrlDisplay(row.slug),
    original: row.long_url,
    clicks: row.usage_count,
    createdAt: row.created_at,
  };
}
