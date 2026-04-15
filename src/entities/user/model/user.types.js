/**
 * @typedef {Object} UserProfileSnapshot
 * @property {string} emoji_avatar
 * @property {'light'|'dark'|'system'} ui_theme
 * @property {'en'|'ru'} ui_language
 * @property {string|null} [bio]
 * @property {string|null} [timezone]
 */

/**
 * @typedef {Object} UserSnapshot
 * @property {number | string} [id]
 * @property {string} [username]
 * @property {string} [email]
 * @property {string} [emoji] — convenience copy of `profile.emoji_avatar` for UI
 * @property {UserProfileSnapshot} [profile] — from GET /me / register / login
 */

export {};
