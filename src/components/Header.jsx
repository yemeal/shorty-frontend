import React, { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Globe, LogIn, Moon, Rocket, Settings, Sun } from "lucide-react";
import { useLang } from "../LangContext";
import { useTheme } from "../ThemeContext";
import { AUTH_DEFAULT_EMOJI, useAuth } from "../AuthContext";
import { GLASS_HOVER_CHROME_CLASS, MOTION_EASE_SMOOTH } from "../lib/motionTokens";
import { useDismissOnOutsidePress } from "../hooks/useDismissOnOutsidePress";
import {
  silentSyncProfilePreferences,
  themeAfterHeaderToggle,
} from "../features/profile/api/silentSyncProfilePreferences";
import EmojiGlyph from "../shared/ui/EmojiGlyph";

const SETTINGS_MENU_CAPTION =
  "text-xs text-slate-500 dark:text-slate-400 type-ui-label";
const SETTINGS_MENU_VALUE =
  "text-sm sm:text-base type-display-title text-slate-800 dark:text-slate-200";
const SETTINGS_MENU_BUTTON_CLASS =
  `glass-frost-surface group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/40 dark:border-white/10 border-t-white/60 dark:border-t-white/15 bg-white/18 dark:bg-white/[0.03] px-3.5 py-3.5 text-left shadow-[0_14px_28px_-22px_rgba(15,23,42,0.38)] dark:shadow-[0_16px_30px_-24px_rgba(0,0,0,0.5)] active:scale-[0.98] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/35 ${GLASS_HOVER_CHROME_CLASS}`;
const SETTINGS_MENU_ICON_CLASS =
  "relative flex size-11 shrink-0 items-center justify-center rounded-2xl border transition-[transform,border-color,background-color,box-shadow] duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-px group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none";
const HEADER_BRAND_LINK_CLASS =
  "flex items-center gap-3 sm:gap-4 group cursor-pointer bg-white dark:bg-slate-900 py-1.5 px-4 sm:py-2.5 sm:px-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-md hover:shadow-lg transition-[background-color,border-color,box-shadow,transform] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/35";
const HEADER_ACTION_ICON_BUTTON_CLASS =
  "flex items-center justify-center cursor-pointer bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 border border-slate-200 dark:border-white/5 rounded-full shadow-md transition-[background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/35";
const HEADER_PRIMARY_LINK_CLASS =
  "cursor-pointer bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 type-display-cta rounded-full sm:rounded-2xl transition-[background-color,border-color,box-shadow,transform] duration-200 flex items-center justify-center gap-2 active:scale-[0.97] shrink-0 shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/35";
const SETTINGS_MENU_TONES = {
  blue: {
    glowClassName:
      "bg-gradient-to-br from-blue-500/18 via-blue-500/[0.04] to-transparent dark:from-blue-400/18 dark:via-blue-400/[0.05]",
    iconClassName:
      "border-blue-200/70 bg-blue-500/10 text-blue-600 shadow-[0_10px_20px_-16px_rgba(59,130,246,0.7)] dark:border-blue-500/25 dark:bg-blue-500/14 dark:text-blue-300",
    valueClassName: "group-hover:text-blue-700 dark:group-hover:text-white",
  },
  indigo: {
    glowClassName:
      "bg-gradient-to-br from-indigo-500/16 via-indigo-500/[0.04] to-transparent dark:from-indigo-400/18 dark:via-indigo-400/[0.05]",
    iconClassName:
      "border-indigo-200/70 bg-indigo-500/10 text-indigo-600 shadow-[0_10px_20px_-16px_rgba(99,102,241,0.66)] dark:border-indigo-500/25 dark:bg-indigo-500/14 dark:text-indigo-300",
    valueClassName: "group-hover:text-indigo-700 dark:group-hover:text-white",
  },
  violet: {
    glowClassName:
      "bg-gradient-to-br from-violet-500/15 via-violet-500/[0.04] to-transparent dark:from-violet-400/16 dark:via-violet-400/[0.05]",
    iconClassName:
      "border-violet-200/70 bg-violet-500/10 text-violet-600 shadow-[0_10px_20px_-16px_rgba(139,92,246,0.58)] dark:border-violet-500/25 dark:bg-violet-500/14 dark:text-violet-300",
    valueClassName: "group-hover:text-violet-700 dark:group-hover:text-white",
  },
};

function SettingsMenuButton({ tone = "blue", icon, caption, value, onClick }) {
  const styles = SETTINGS_MENU_TONES[tone] ?? SETTINGS_MENU_TONES.blue;

  return (
    <button type="button" onClick={onClick} className={SETTINGS_MENU_BUTTON_CLASS}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/75 via-white/20 to-transparent opacity-80"
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 motion-reduce:transition-none ${styles.glowClassName}`}
      />
      <div className={`${SETTINGS_MENU_ICON_CLASS} ${styles.iconClassName}`}>{icon}</div>
      <div className="relative flex min-w-0 flex-1 flex-col items-start gap-0.5">
        <span className={SETTINGS_MENU_CAPTION}>{caption}</span>
        <span className={`${SETTINGS_MENU_VALUE} ${styles.valueClassName}`}>{value}</span>
      </div>
    </button>
  );
}

const Header = () => {
  const { lang, toggleLang, t } = useLang();
  const { theme, toggleTheme, triggerAntigravity } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsTriggerRef = useRef(null);
  const settingsPanelRef = useRef(null);
  const settingsPanelId = "header-settings-panel";

  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);
  const toggleSettings = useCallback(() => {
    setIsSettingsOpen((prev) => !prev);
  }, []);

  useDismissOnOutsidePress({
    active: isSettingsOpen,
    rootRefs: [settingsTriggerRef, settingsPanelRef],
    onDismiss: closeSettings,
  });

  const onSettingsLangClick = useCallback(() => {
    const nextLang = lang === "en" ? "ru" : "en";
    toggleLang();
    if (!isAuthenticated) return;
    silentSyncProfilePreferences({ ui_language: nextLang });
  }, [isAuthenticated, lang, toggleLang]);

  const onSettingsThemeClick = useCallback(() => {
    const nextTheme = themeAfterHeaderToggle(theme);
    toggleTheme();
    if (!isAuthenticated) return;
    silentSyncProfilePreferences({ ui_theme: nextTheme });
  }, [isAuthenticated, theme, toggleTheme]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 sm:pt-6">
      <div className="w-[95%] max-w-4xl relative">
        <div className="glass-panel rounded-3xl border-slate-200/20 dark:border-white/10 overflow-hidden relative">
          <nav
            aria-label="Primary"
            className="flex justify-between items-center h-[75px] sm:h-[90px] px-6 sm:px-8 relative z-20"
          >
            <Link to="/" className={HEADER_BRAND_LINK_CLASS}>
              <div className="relative flex items-center justify-center transition-[transform,opacity] duration-500 h-8 w-8 sm:h-9 sm:w-9">
                <div className="absolute inset-0 bg-blue-500/30 rounded-xl blur-lg opacity-40 group-hover:opacity-70 group-hover:scale-125 transition-[opacity,transform] duration-500" />
                <div className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <img
                    src="/icon.svg"
                    alt=""
                    width="36"
                    height="36"
                    className="w-full h-full object-contain rounded-lg transition-transform duration-300"
                  />
                </div>
              </div>
              <span className="type-brand-mark text-slate-900 dark:text-white pr-1 text-base sm:text-xl drop-shadow-sm">
                {t.brand}
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                ref={settingsTriggerRef}
                type="button"
                onClick={toggleSettings}
                aria-label={t.settingsTitle}
                aria-expanded={isSettingsOpen}
                aria-controls={settingsPanelId}
                className={`${HEADER_ACTION_ICON_BUTTON_CLASS} w-9 h-9 sm:w-10 sm:h-10 z-10 ${isSettingsOpen ? "bg-blue-50 border-blue-200 dark:bg-slate-800 dark:border-blue-500/50" : ""}`}
              >
                <Settings
                  size={18}
                  className={`transition-transform duration-500 ${isSettingsOpen ? "rotate-90 text-blue-500" : "text-slate-600 dark:text-slate-300"}`}
                />
              </button>

              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className={`${HEADER_ACTION_ICON_BUTTON_CLASS} w-12 h-12 sm:w-14 sm:h-14 hover:shadow-lg`}
                  aria-label={t.profileTitle}
                >
                  <EmojiGlyph
                    emoji={user?.emoji || AUTH_DEFAULT_EMOJI}
                    label={t.profileTitle}
                    loading="eager"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    textClassName="text-2xl sm:text-3xl"
                  />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className={`${HEADER_PRIMARY_LINK_CLASS} w-10 h-10 sm:w-auto sm:px-6 sm:py-2.5 sm:h-11`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base">
                    <LogIn size={16} />
                    <span className="hidden sm:inline">{t.signIn}</span>
                  </span>
                </Link>
              )}
            </div>
          </nav>
        </div>

        <div
          id={settingsPanelId}
          ref={settingsPanelRef}
          aria-hidden={!isSettingsOpen}
          className={`absolute top-full right-0 mt-3 mb-6 grid transition-[grid-template-rows,width] duration-[400ms] ${
            isSettingsOpen ? "grid-rows-[1fr] w-64 sm:w-72" : "grid-rows-[0fr] w-32 sm:w-36"
          }`}
          style={{ transitionTimingFunction: `cubic-bezier(${MOTION_EASE_SMOOTH.join(",")})` }}
        >
          <div
            className={`overflow-hidden min-h-0 ${!isSettingsOpen ? "pointer-events-none" : ""}`}
            inert={!isSettingsOpen}
          >
            <div className="px-2 pb-5 sm:pb-6 pt-0.5">
              <div className="glass-panel glass-panel--menu rounded-3xl border-slate-200/20 dark:border-white/10 overflow-hidden relative">
                <div className="flex flex-col gap-2 p-3 sm:p-4 relative z-10">
                  <SettingsMenuButton
                    tone="blue"
                    onClick={onSettingsLangClick}
                    icon={<Globe size={18} />}
                    caption="Язык / Lang"
                    value={lang.toUpperCase()}
                  />

                  <SettingsMenuButton
                    tone="indigo"
                    onClick={onSettingsThemeClick}
                    icon={theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    caption={t.themeToggle}
                    value={theme === "dark" ? t.themeLight : t.themeDark}
                  />

                  <SettingsMenuButton
                    tone="violet"
                    onClick={() => {
                      triggerAntigravity();
                      setIsSettingsOpen(false);
                    }}
                    icon={<Rocket size={18} />}
                    caption={t.secret}
                    value={t.doNotPress}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
