import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "../components/Header";
import { useLang } from "../LangContext";
import AppBackground from "../shared/ui/AppBackground";

const NotFoundPage = () => {
  const { t } = useLang();

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-500/30 relative overflow-hidden transition-colors duration-500">
      <AppBackground />

      <Header />

      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-[20rem] sm:max-w-2xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-[40px] border border-white/50 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-3xl p-5 sm:p-10 text-center">
          <div className="mx-auto mb-5 flex items-center justify-center">
            <img src="/icon.svg" alt="Shorty icon" className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_10px_18px_rgba(37,99,235,0.38)]" />
          </div>

          <p className="font-display text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
            404
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
            {t.notFoundTitle}
          </h1>
          <p className="mt-4 sm:mt-5 text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.notFoundHint}
          </p>

          <div className="mt-6 sm:mt-7 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-display font-bold border border-white/50 dark:border-white/10 bg-white/35 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/35 transition"
            >
              <ArrowLeft size={16} />
              {t.notFoundGoHome}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFoundPage;
