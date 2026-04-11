/**
 * Sorts short-link items according to profile filter settings.
 */
export function sortShorties(items, sort) {
  const next = [...items];
  if (sort === "newest")
    next.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sort === "oldest")
    next.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (sort === "clicks_desc") next.sort((a, b) => b.clicks - a.clicks);
  if (sort === "clicks_asc") next.sort((a, b) => a.clicks - b.clicks);
  return next;
}

/**
 * Filters short-link items by query over both short and original URLs.
 */
export function filterShorties(items, query) {
  const search = query.trim().toLowerCase();
  if (!search) return items;
  return items.filter(
    (item) =>
      item.short.toLowerCase().includes(search) ||
      item.original.toLowerCase().includes(search),
  );
}

/**
 * Paginates a collection and returns page metadata.
 */
export function paginateShorties(items, pageSize, requestedPage) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const paged = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const shownFrom = items.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const shownTo = (currentPage - 1) * pageSize + paged.length;
  return { totalPages, currentPage, paged, shownFrom, shownTo };
}
