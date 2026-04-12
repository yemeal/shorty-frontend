/**
 * Public short-link URLs.
 *
 * В production на одном домене с nginx (как в shorty/nginx) slug уходит на API через
 * reverse proxy — достаточно текущего host.
 * В dev/preview фронт на :5173, редиректы живут на FastAPI (:8000) — без подстановки
 * открытие /slug попадает в React Router → /not-found.
 */

function getConfiguredFollowOrigin() {
  const raw = import.meta.env.VITE_SHORT_FOLLOW_BASE;
  if (raw && String(raw).trim()) {
    return String(raw).replace(/\/$/, "");
  }
  if (import.meta.env.DEV && import.meta.env.MODE !== "test") {
    return "http://127.0.0.1:8000";
  }
  return null;
}

export function getPublicShortLinkHost() {
  const origin = getConfiguredFollowOrigin();
  if (origin) {
    try {
      return new URL(origin).host;
    } catch {
      return "127.0.0.1:8000";
    }
  }
  let host = typeof window !== "undefined" ? window.location.host : "";
  host = host.replace("xn--h1algi1a.xn--p1ai", "шорти.рф");
  return host;
}

/** Display form without protocol, e.g. `шорти.рф/my-slug` */
export function buildPublicShortUrlDisplay(slug) {
  return `${getPublicShortLinkHost()}/${slug}`;
}

/** Absolute URL for opening / QR */
export function buildPublicShortUrlAbsolute(slug) {
  const origin = getConfiguredFollowOrigin();
  if (origin) {
    return `${origin}/${slug}`;
  }
  if (typeof window === "undefined") return `/${slug}`;
  return `${window.location.protocol}//${buildPublicShortUrlDisplay(slug)}`;
}
