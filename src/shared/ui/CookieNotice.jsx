import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../LangContext";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  getLegalCopy,
  LEGAL_ROUTES,
} from "../config/legal";

function hasAcceptedCookieNotice() {
  try {
    return localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) === "accepted";
  } catch {
    return false;
  }
}

const CookieNotice = () => {
  const { lang } = useLang();
  const legal = useMemo(() => getLegalCopy(lang), [lang]);
  const [isVisible, setIsVisible] = useState(() => !hasAcceptedCookieNotice());

  if (!isVisible) return null;

  return (
    <div
      data-testid="cookie-notice"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto w-auto max-w-xl rounded-3xl border border-white/40 dark:border-white/10 bg-white/75 dark:bg-slate-900/75 backdrop-blur-[40px] shadow-2xl p-4 sm:p-5"
    >
      <div className="flex flex-col gap-3">
        <div className="space-y-1 text-left">
          <p className="type-ui-title text-sm sm:text-base text-slate-900 dark:text-white">
            {legal.cookieNoticeTitle}
          </p>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {legal.cookieNoticeBody}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-end">
          <Link
            to={LEGAL_ROUTES.cookies}
            className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm type-ui-label border border-white/40 dark:border-white/10 bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/35 text-slate-700 dark:text-slate-200 transition-[background-color,border-color,color]"
          >
            {legal.cookieNoticeDetails}
          </Link>
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "accepted");
              } catch {
                /* ignore */
              }
              setIsVisible(false);
            }}
            className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm type-ui-label cursor-pointer border border-blue-500/30 dark:border-blue-400/40 bg-blue-500/15 dark:bg-blue-600/20 text-blue-700 dark:text-white hover:bg-blue-500/20 dark:hover:bg-blue-600/30 transition-[background-color,border-color,color]"
          >
            {legal.cookieNoticeAccept}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieNotice;
