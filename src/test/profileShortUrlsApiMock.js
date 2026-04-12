/**
 * Deterministic GET /me/short_urls responses for ProfilePage tests.
 * Mirrors backend query params: page, page_size, sort_by, sort_order, q.
 */
import { vi } from "vitest";

const BASE = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    slug: "spacefox",
    long_url: "https://example.com/blog/space-fox",
    usage_count: 212,
    created_at: "2026-03-27T11:20:00Z",
    updated_at: null,
    is_active: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    slug: "chillwave",
    long_url: "https://example.com/playlist/chillwave",
    usage_count: 82,
    created_at: "2026-03-30T18:10:00Z",
    updated_at: null,
    is_active: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    slug: "nightowl",
    long_url: "https://example.com/article/night-productivity",
    usage_count: 146,
    created_at: "2026-04-01T08:40:00Z",
    updated_at: null,
    is_active: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111104",
    slug: "spark-labs",
    long_url: "https://example.com/product/spark-labs",
    usage_count: 67,
    created_at: "2026-04-03T13:00:00Z",
    updated_at: null,
    is_active: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111105",
    slug: "sea-salt",
    long_url: "https://example.com/store/sea-salt",
    usage_count: 15,
    created_at: "2026-04-06T09:15:00Z",
    updated_at: null,
    is_active: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111106",
    slug: "ultra-read",
    long_url: "https://example.com/docs/ultra-read",
    usage_count: 304,
    created_at: "2026-04-08T07:40:00Z",
    updated_at: null,
    is_active: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111107",
    slug: "green-loop",
    long_url: "https://example.com/green-loop",
    usage_count: 43,
    created_at: "2026-04-08T19:20:00Z",
    updated_at: null,
    is_active: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111108",
    slug: "echo",
    long_url: "https://example.com/podcast/echo",
    usage_count: 89,
    created_at: "2026-04-09T12:50:00Z",
    updated_at: null,
    is_active: true,
  },
];

function cmpCreatedAt(a, b, order) {
  const da = new Date(a.created_at).getTime();
  const db = new Date(b.created_at).getTime();
  return order === "asc" ? da - db : db - da;
}

function cmpUsage(a, b, order) {
  return order === "asc" ? a.usage_count - b.usage_count : b.usage_count - a.usage_count;
}

/**
 * @param {string} inputUrl fetch url string
 */
export function buildProfileShortUrlsJsonBody(inputUrl) {
  const u = new URL(inputUrl, "https://шорти.рф");
  const page = Math.max(1, Number(u.searchParams.get("page") || "1"));
  const pageSize = Math.min(20, Math.max(1, Number(u.searchParams.get("page_size") || "5")));
  const sortBy = u.searchParams.get("sort_by") || "created_at";
  const sortOrder = u.searchParams.get("sort_order") || "desc";
  const q = (u.searchParams.get("q") || "").trim().toLowerCase();

  let rows = [...BASE];
  if (q) {
    rows = rows.filter(
      (r) => r.slug.toLowerCase().includes(q) || r.long_url.toLowerCase().includes(q),
    );
  }
  rows.sort((a, b) => {
    if (sortBy === "usage_count") return cmpUsage(a, b, sortOrder);
    return cmpCreatedAt(a, b, sortOrder);
  });

  const totalItems = rows.length;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
  const offset = (page - 1) * pageSize;
  const items = rows.slice(offset, offset + pageSize);

  const meta = {
    page,
    page_size: pageSize,
    total_pages: totalPages,
    total_items: totalItems,
    sort_by: sortBy,
    sort_order: sortOrder,
    has_next_page: page * pageSize < totalItems,
    has_previous_page: page > 1,
    q: q || null,
  };

  return JSON.stringify({ items, meta });
}

export function installProfileShortUrlsFetchMock() {
  return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = typeof input === "string" ? input : input.url;
    if (String(url).includes("/me/short_urls")) {
      return Promise.resolve({
        ok: true,
        text: async () => buildProfileShortUrlsJsonBody(url),
      });
    }
    return Promise.resolve({
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });
  });
}
