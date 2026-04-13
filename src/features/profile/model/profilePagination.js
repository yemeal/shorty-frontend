/**
 * Compact page list: [1, 'ellipsis', 5, 6, 7, 'ellipsis', 15]
 * @param {number} current 1-based
 * @param {number} total
 * @returns {(number | "ellipsis")[]}
 */
export function buildCompactPaginationItems(current, total) {
  if (total < 1) return [];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  /** @type {(number | "ellipsis")[]} */
  const out = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("ellipsis");
    out.push(p);
    prev = p;
  }
  return out;
}
