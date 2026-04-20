import React, { useMemo } from "react";
import { CheckCircle2, Globe, Zap } from "lucide-react";
import PageHeaderReveal from "../components/PageHeaderReveal";
import ShortenForm from "../features/shorten/ui/ShortenForm";
import { useLang } from "../LangContext";
import { GLASS_HOVER_SURFACE_CLASS } from "../lib/motionTokens";
import AppPageShell from "../shared/ui/AppPageShell";

const HOME_SECTIONS = {
  hero: "home-hero",
  features: "home-features",
};
const FEATURE_CARD_CLASS =
  `glass-frost-surface group relative isolate list-none overflow-hidden rounded-[2rem] border border-white/30 dark:border-white/10 border-t-white/45 dark:border-t-white/12 bg-white/12 dark:bg-white/[0.03] p-8 shadow-[0_20px_40px_-18px_rgba(15,23,42,0.14)] dark:shadow-none ${GLASS_HOVER_SURFACE_CLASS}`;
const FEATURE_ICON_CLASS =
  "relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border shadow-sm transition-[transform,border-color,background-color,box-shadow] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[1px] group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none";

const HomePage = () => {
  const { t } = useLang();
  const featureCards = useMemo(
    () => [
      {
        key: "speed",
        title: t.feat1Title,
        desc: t.feat1Desc,
        icon: <Zap size={22} className="text-blue-500/80 dark:text-blue-300" />,
        glowClassName:
          "bg-gradient-to-br from-blue-500/18 via-blue-500/[0.04] to-transparent dark:from-blue-400/18 dark:via-blue-400/[0.05]",
        iconClassName:
          "border-blue-200/70 dark:border-blue-500/20 bg-blue-500/10 dark:bg-blue-500/14 shadow-[0_10px_24px_-18px_rgba(59,130,246,0.7)]",
        titleHoverClassName: "group-hover:text-blue-950 dark:group-hover:text-white",
      },
      {
        key: "reliability",
        title: t.feat2Title,
        desc: t.feat2Desc,
        icon: <CheckCircle2 size={22} className="text-indigo-500/80 dark:text-indigo-300" />,
        glowClassName:
          "bg-gradient-to-br from-indigo-500/16 via-indigo-500/[0.05] to-transparent dark:from-indigo-400/18 dark:via-indigo-400/[0.05]",
        iconClassName:
          "border-indigo-200/70 dark:border-indigo-500/20 bg-indigo-500/10 dark:bg-indigo-500/14 shadow-[0_10px_24px_-18px_rgba(99,102,241,0.62)]",
        titleHoverClassName: "group-hover:text-indigo-950 dark:group-hover:text-white",
      },
      {
        key: "open-source",
        title: t.feat3Title,
        desc: t.feat3Desc,
        icon: <Globe size={22} className="text-purple-500/80 dark:text-purple-300" />,
        glowClassName:
          "bg-gradient-to-br from-purple-500/16 via-purple-500/[0.04] to-transparent dark:from-purple-400/18 dark:via-purple-400/[0.05]",
        iconClassName:
          "border-purple-200/70 dark:border-purple-500/20 bg-purple-500/10 dark:bg-purple-500/14 shadow-[0_10px_24px_-18px_rgba(168,85,247,0.58)]",
        titleHoverClassName: "group-hover:text-purple-950 dark:group-hover:text-white",
      },
    ],
    [t],
  );

  return (
    <AppPageShell mainClassName="w-full">
      <div className="relative z-10 flex-1 w-full">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-32 sm:pt-40 pb-12 flex flex-col items-center">
          <section aria-labelledby={HOME_SECTIONS.hero} className="relative w-full">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-full">
              <div
                aria-hidden="true"
                className="mx-auto mt-6 h-[18rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.34),rgba(59,130,246,0.18)_38%,rgba(0,0,0,0)_74%)] blur-3xl sm:mt-8 sm:h-[24rem] sm:w-[40rem]"
              />
            </div>

            <div className="relative z-10">
              <PageHeaderReveal
                title={
                  <>
                    {t.title1} <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 drop-shadow-sm dark:drop-shadow-lg">
                      {t.title2}
                    </span>
                  </>
                }
                subtitle={t.subtitle}
                className="text-center space-y-4 sm:space-y-6 mb-10 sm:mb-14 relative z-10 w-full transition-colors duration-500"
                titleClassName="type-display-hero text-4xl sm:text-5xl md:text-7xl text-slate-900 dark:text-white"
                subtitleClassName="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed px-4 transition-colors"
                titleId={HOME_SECTIONS.hero}
              />
            </div>

            <div className="relative z-10">
              <ShortenForm />
            </div>
          </section>

          <section
            aria-labelledby={HOME_SECTIONS.features}
            className="w-full max-w-4xl pt-8 sm:pt-10 border-t-2 border-slate-300/30 dark:border-white/5 relative z-10"
          >
            <h2 id={HOME_SECTIONS.features} className="sr-only">
              Product highlights
            </h2>
            <ul className="grid md:grid-cols-3 gap-6 w-full">
              {featureCards.map((item) => (
                <li key={item.key} className={FEATURE_CARD_CLASS}>
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 motion-reduce:transition-none ${item.glowClassName}`}
                  />
                  <div className={`${FEATURE_ICON_CLASS} ${item.iconClassName}`}>{item.icon}</div>
                  <h3
                    className={`relative z-10 mb-3 type-display-title text-xl text-slate-900 transition-colors dark:text-white ${item.titleHoverClassName}`}
                  >
                    {item.title}
                  </h3>
                  <p className="relative z-10 text-sm font-medium leading-relaxed text-slate-500 transition-colors dark:text-slate-400">
                    {item.desc}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppPageShell>
  );
};

export default HomePage;
