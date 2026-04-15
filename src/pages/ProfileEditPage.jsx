import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "../components/Header";
import AppBackground from "../shared/ui/AppBackground";
import PageHeaderReveal from "../components/PageHeaderReveal";
import { useAuth, AUTH_DEFAULT_EMOJI, normalizeUserFromServer } from "../AuthContext";
import { useLang } from "../LangContext";
import { useTheme } from "../ThemeContext";
import EmojiPickerSection from "../features/profile/ui/EmojiPickerSection";
import BioSection from "../features/profile/ui/BioSection";
import PreferencesSection from "../features/profile/ui/PreferencesSection";
import ProfileEditActions from "../features/profile/ui/ProfileEditActions";
import { apiFetch, apiPatchJson } from "../shared/lib/api";

const PROFILE_DRAFT_KEY = "shorty-profile-draft";

function readDraft() {
  try {
    const raw = localStorage.getItem(PROFILE_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(PROFILE_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Profile editing page: PATCH /me/profile, then GET /me to refresh the auth snapshot.
 */
const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { lang, setLang, t } = useLang();
  const { theme, setTheme } = useTheme();

  const browserTz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    [],
  );

  /** IANA zone saved on the server (may load after first paint when GET /me finishes). */
  const profileTimezoneRaw = user?.profile?.timezone;
  const profileTimezone =
    profileTimezoneRaw != null && String(profileTimezoneRaw).trim()
      ? String(profileTimezoneRaw).trim()
      : null;

  const initialRef = useRef(null);
  if (initialRef.current === null) {
    const p = user?.profile;
    const draft = readDraft();
    const uiTheme =
      p?.ui_theme && ["light", "dark", "system"].includes(p.ui_theme)
        ? p.ui_theme
        : theme === "light" || theme === "dark" || theme === "system"
          ? theme
          : "system";
    const uiLanguage =
      p?.ui_language && ["en", "ru"].includes(p.ui_language) ? p.ui_language : lang;

    const effectiveTz = profileTimezone || browserTz;

    initialRef.current = {
      emoji: p?.emoji_avatar || user?.emoji || AUTH_DEFAULT_EMOJI,
      bio: p?.bio ?? draft?.bio ?? "",
      uiTheme,
      uiLanguage,
      timezone: effectiveTz,
    };
  }

  const [form, setForm] = useState(() => ({ ...initialRef.current }));
  const [isLoading, setIsLoading] = useState(false);

  // When /me returns (or profile updates), keep the displayed zone in sync with the account.
  useEffect(() => {
    const effective = profileTimezone || browserTz;
    setForm((prev) => (prev.timezone === effective ? prev : { ...prev, timezone: effective }));
    if (initialRef.current) {
      initialRef.current = { ...initialRef.current, timezone: effective };
    }
  }, [profileTimezone, browserTz]);

  const isDirty = useMemo(() => {
    const init = initialRef.current;
    return (
      form.emoji !== init.emoji ||
      form.bio !== init.bio ||
      form.uiTheme !== init.uiTheme ||
      form.uiLanguage !== init.uiLanguage ||
      form.timezone !== init.timezone
    );
  }, [form]);

  useEffect(() => {
    if (form.uiTheme !== theme) {
      setTheme(form.uiTheme);
    }
  }, [form.uiTheme, theme, setTheme]);

  useEffect(() => {
    if (form.uiLanguage !== lang) {
      setLang(form.uiLanguage);
    }
  }, [form.uiLanguage, lang, setLang]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiPatchJson("/me/profile", {
        emoji_avatar: form.emoji,
        bio: form.bio.trim() === "" ? null : form.bio,
        ui_theme: form.uiTheme,
        ui_language: form.uiLanguage,
        timezone: form.timezone || null,
      });

      const me = await apiFetch("/me/");
      const normalized = normalizeUserFromServer(me, user);
      if (normalized) setUser(normalized);

      clearDraft();
      initialRef.current = { ...form };

      toast.success(t.profileEditSaveSuccess);
      navigate("/profile");
    } catch {
      toast.error(t.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  }, [form, navigate, setUser, t, user]);

  const handleCancel = useCallback(() => {
    const init = initialRef.current;
    if (theme !== init.uiTheme) setTheme(init.uiTheme);
    if (lang !== init.uiLanguage) setLang(init.uiLanguage);
    navigate("/profile");
  }, [lang, navigate, setLang, setTheme, theme]);

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-500/30 relative overflow-hidden transition-colors duration-500">
      <AppBackground />

      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-16 flex flex-col gap-5 sm:gap-6 relative z-10">
        <PageHeaderReveal
          title={t.profileEditTitle}
          subtitle={t.profileEditSubtitle}
          className="text-center space-y-2"
          titleClassName="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          subtitleClassName="text-sm sm:text-base text-slate-600 dark:text-slate-400"
        />

        <EmojiPickerSection
          emoji={form.emoji}
          onChange={(emoji) => updateField("emoji", emoji)}
          t={t}
        />

        <BioSection
          bio={form.bio}
          onChange={(bio) => updateField("bio", bio)}
          t={t}
        />

        <PreferencesSection
          uiTheme={form.uiTheme}
          uiLanguage={form.uiLanguage}
          timezone={form.timezone}
          profileTimezone={profileTimezone}
          browserTimezone={browserTz}
          onThemeChange={(v) => updateField("uiTheme", v)}
          onLanguageChange={(v) => updateField("uiLanguage", v)}
          t={t}
        />

        <ProfileEditActions
          isDirty={isDirty}
          isLoading={isLoading}
          onSave={handleSave}
          onCancel={handleCancel}
          t={t}
        />
      </main>
    </div>
  );
};

export default ProfileEditPage;
