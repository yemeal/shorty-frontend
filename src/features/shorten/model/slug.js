/**
 * Reserved slug values that should never be user-defined.
 */
export const RESERVED_SLUG_WORDS = [
  "docs",
  "redoc",
  "openapi.json",
  "short_url",
  "auth",
  "me",
  "api",
  "admin",
  "health",
  "metrics",
  "graphql",
  "ws",
  "login",
  "register",
  "profile",
  "placeholder",
  "profile-placeholder",
  "favicon.ico",
  "favicon",
  "robots.txt",
  "robots",
  "sitemap.xml",
  "sitemap",
  "manifest.webmanifest",
  "manifest",
  "assets",
  "static",
  "public",
  "img",
  "images",
  "fonts",
  "css",
  "js",
  "uploads",
  "media",
  "about",
  "contact",
  "privacy",
  "terms",
  "support",
  "help",
  "status",
  "dashboard",
  "settings",
  "shorty",
  "апи",
  "админ",
  "доки",
  "вход",
  "регистрация",
  "профиль",
  "настройки",
];

/**
 * Validates a custom short-link slug and returns translation key of an error.
 * Empty string means slug is valid.
 */
export function validateSlug(slugText) {
  if (!slugText) return "slugErrorLength";
  if (slugText.length < 6 || slugText.length > 30) return "slugErrorLength";
  if (!/^[a-zA-Zа-яА-ЯёЁ0-9_-]+$/.test(slugText)) return "slugErrorChars";
  if (RESERVED_SLUG_WORDS.includes(slugText.toLowerCase()))
    return "slugErrorReserved";
  return "";
}
