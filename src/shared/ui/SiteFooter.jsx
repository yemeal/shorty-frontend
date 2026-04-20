import React from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../LangContext";
import {
  GITHUB_REPOSITORY_URL,
  getLegalCopy,
  LEGAL_ROUTES,
} from "../config/legal";

const footerLinkClass =
  "text-sm type-ui-label text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors";

const GithubIcon = ({ size = 16, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const SiteFooter = () => {
  const { lang, t } = useLang();
  const legal = getLegalCopy(lang);

  return (
    <footer
      data-testid="home-footer"
      className="relative z-10 mt-auto py-8 px-4 sm:px-6 text-center"
    >
      <div className="mx-auto max-w-5xl flex flex-col items-center gap-4">
        <a
          href={GITHUB_REPOSITORY_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200/60 dark:border-white/10 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-[background-color,color,border-color,box-shadow] duration-200 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/35"
        >
          <GithubIcon size={16} />
          <span>GitHub</span>
        </a>

        <nav
          aria-label="Legal"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
        >
          <Link to={LEGAL_ROUTES.privacy} className={footerLinkClass}>
            {legal.footerLinks.privacy}
          </Link>
          <Link to={LEGAL_ROUTES.terms} className={footerLinkClass}>
            {legal.footerLinks.terms}
          </Link>
          <Link to={LEGAL_ROUTES.cookies} className={footerLinkClass}>
            {legal.footerLinks.cookies}
          </Link>
          <Link to={LEGAL_ROUTES.contacts} className={footerLinkClass}>
            {legal.footerLinks.contacts}
          </Link>
        </nav>

        <div className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-500">
          <span className="text-sm type-tech">
            &copy; {new Date().getFullYear()} {t.footer}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
