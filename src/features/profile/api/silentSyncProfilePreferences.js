import { apiPatchJson } from "../../../shared/lib/api";

/**
 * Computes the theme value after the header settings menu toggle (same rules as ThemeContext.toggleTheme).
 * @param {'light' | 'dark' | 'system'} current
 * @returns {'light' | 'dark'}
 */
export function themeAfterHeaderToggle(current) {
  if (current === "system") {
    const resolved =
      typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    return resolved === "dark" ? "light" : "dark";
  }
  return current === "dark" ? "light" : "dark";
}

/**
 * Best-effort PATCH /me/profile for theme/language. No toasts, no loading; failures ignored.
 * Call only when `isAuthenticated` is true.
 *
 * @param {{ ui_language?: 'en' | 'ru', ui_theme?: 'light' | 'dark' | 'system' }} patch
 */
export function silentSyncProfilePreferences(patch) {
  const body = {};
  if (patch.ui_language === "en" || patch.ui_language === "ru") {
    body.ui_language = patch.ui_language;
  }
  if (patch.ui_theme === "light" || patch.ui_theme === "dark" || patch.ui_theme === "system") {
    body.ui_theme = patch.ui_theme;
  }
  if (Object.keys(body).length === 0) return;
  void apiPatchJson("/me/profile", body, { silent: true }).catch(() => {});
}
