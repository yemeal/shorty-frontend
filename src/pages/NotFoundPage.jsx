import React from "react";
import { ArrowLeft } from "lucide-react";
import { useLang } from "../LangContext";
import { GlassSecondaryLink } from "../shared/ui/GlassSecondaryAction";
import AppPageShell from "../shared/ui/AppPageShell";

const NotFoundPage = () => {
  const { t } = useLang();

  return (
    <AppPageShell>
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-[20rem] sm:max-w-2xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-[40px] border border-white/50 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-3xl p-5 sm:p-10 text-center">
          <div className="mx-auto mb-5 flex items-center justify-center">
            <img src="/icon.svg" alt="Shorty icon" className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_10px_18px_rgba(37,99,235,0.38)]" />
          </div>

          <p className="type-display-title text-4xl sm:text-6xl text-slate-900 dark:text-white">
            404
          </p>
          <h1 className="mt-2 type-display-title text-4xl sm:text-6xl text-slate-900 dark:text-white">
            {t.notFoundTitle}
          </h1>
          <p className="mt-4 sm:mt-5 text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.notFoundHint}
          </p>

          <div className="mt-6 sm:mt-7 flex justify-center">
            <GlassSecondaryLink to="/">
              <ArrowLeft size={16} />
              {t.notFoundGoHome}
            </GlassSecondaryLink>
          </div>
        </div>
      </div>
    </AppPageShell>
  );
};

export default NotFoundPage;
