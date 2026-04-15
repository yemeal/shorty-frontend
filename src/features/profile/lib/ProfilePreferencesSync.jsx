import { useEffect } from "react";
import { useAuth } from "../../../AuthContext";
import { useLang } from "../../../LangContext";
import { useTheme } from "../../../ThemeContext";

/**
 * Applies `user.profile.ui_theme` / `ui_language` from the API after login or GET /me.
 * Keeps Lang/Theme in sync with the server-side profile row.
 */
export default function ProfilePreferencesSync() {
  const { user } = useAuth();
  const { setLang } = useLang();
  const { setTheme } = useTheme();

  useEffect(() => {
    const p = user?.profile;
    if (!p || typeof p !== "object") return;
    if (p.ui_language === "en" || p.ui_language === "ru") {
      setLang(p.ui_language);
    }
    if (p.ui_theme === "light" || p.ui_theme === "dark" || p.ui_theme === "system") {
      setTheme(p.ui_theme);
    }
  }, [user?.profile, setLang, setTheme]);

  return null;
}
