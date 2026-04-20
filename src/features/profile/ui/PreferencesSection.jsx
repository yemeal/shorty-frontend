import React from "react";
import { Globe } from "lucide-react";
import SegmentedPill from "../../../shared/ui/SegmentedPill";

/**
 * Preferences section: Theme selector, Language selector, Timezone display.
 * Timezone is read-only: shows the account IANA zone when set, otherwise the browser zone.
 */
const PreferencesSection = ({
  uiTheme,
  uiLanguage,
  timezone,
  profileTimezone,
  browserTimezone,
  onThemeChange,
  onLanguageChange,
  t,
}) => {
  const timezoneHint = (() => {
    if (!profileTimezone) {
      return t.profileEditTimezoneHintBrowser;
    }
    if (profileTimezone === browserTimezone) {
      return t.profileEditTimezoneHintSynced;
    }
    return t.profileEditTimezoneHintDiff
      .replace("{account}", profileTimezone)
      .replace("{browser}", browserTimezone || "—");
  })();
  const themeOptions = [
    { value: "light", label: t.profileEditThemeLight },
    { value: "dark", label: t.profileEditThemeDark },
    { value: "system", label: t.profileEditThemeSystem },
  ];

  const langOptions = [
    { value: "en", label: "English" },
    { value: "ru", label: "Русский" },
  ];

  return (
    <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-[40px] transform-gpu border border-white/50 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-3xl p-5 sm:p-6 relative overflow-hidden transition-shadow duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 pointer-events-none" />
      <div className="relative z-10 space-y-6">
        {/* Theme */}
        <div>
          <p className="type-ui-label text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 mb-3">
            {t.profileEditThemeLabel}
          </p>
          <SegmentedPill
            options={themeOptions}
            value={uiTheme}
            onChange={onThemeChange}
            layoutId="profile-edit-theme"
          />
        </div>

        {/* Language */}
        <div>
          <p className="type-ui-label text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 mb-3">
            {t.profileEditLangLabel}
          </p>
          <SegmentedPill
            options={langOptions}
            value={uiLanguage}
            onChange={onLanguageChange}
            layoutId="profile-edit-lang"
            className="max-w-xs"
          />
        </div>

        {/* Timezone (read-only) */}
        <div>
          <p className="type-ui-label text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 mb-3">
            {t.profileEditTimezoneLabel}
          </p>
          <div className="flex items-center gap-3 rounded-2xl border border-white/40 dark:border-white/10 bg-white/30 dark:bg-black/20 px-4 py-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg shrink-0">
              <Globe size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="type-tech-strong text-sm text-slate-800 dark:text-white truncate">
                {timezone || "—"}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {timezoneHint}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSection;
