/**
 * @typedef {Object} ShortUrlApiItem
 * @property {string} id
 * @property {string} slug
 * @property {string} long_url
 * @property {string} created_at
 * @property {string|null|undefined} updated_at
 * @property {number} usage_count
 * @property {boolean} is_active
 */

/**
 * @typedef {Object} PaginationMetaApi
 * @property {number} page
 * @property {number} page_size
 * @property {number} total_pages
 * @property {number} total_items
 * @property {string} sort_by
 * @property {string} sort_order
 * @property {boolean} has_next_page
 * @property {boolean} has_previous_page
 * @property {string|null|undefined} q
 */

/**
 * @typedef {Object} ShortUrlListPageApi
 * @property {ShortUrlApiItem[]} items
 * @property {PaginationMetaApi} meta
 */

/**
 * Profile list card (UI + actions).
 * @typedef {Object} ProfileShorty
 * @property {string} id
 * @property {string} slug
 * @property {string} short
 * @property {string} original
 * @property {number} clicks
 * @property {string} createdAt
 */

export {};
