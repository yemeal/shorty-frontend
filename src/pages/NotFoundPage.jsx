import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "../components/Header";
import { useLang } from "../LangContext";

const NotFoundPage = () => {
  const { t } = useLang();

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-500/30 relative overflow-hidden transition-colors duration-500">
      <div className="fixed top-[-20%] sm:top-[-15%] left-[50%] -translate-x-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[400px] rounded-[100%] bg-blue-500/10 dark:bg-blue-500/20 blur-[120px] sm:blur-[140px] pointer-events-none z-0 animate-float-delayed" />
      <div className="fixed top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-blue-500/20 dark:bg-blue-600/30 blur-[110px] sm:blur-[130px] pointer-events-none z-0 animate-float" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-purple-500/10 dark:bg-purple-600/20 blur-[130px] sm:blur-[150px] pointer-events-none z-0 animate-float-delayed" />
      <div className="fixed top-[30%] left-[40%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] sm:blur-[120px] pointer-events-none z-0 animate-float" />

      <Header />

      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-2xl w-full bg-white/60 dark:bg-slate-900/40 backdrop-blur-[40px] border border-white/50 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-3xl p-6 sm:p-10 text-center">
          <div className="mx-auto mb-5 flex items-center justify-center">
            <img src="/icon.svg" alt="Shorty icon" className="w-14 h-14 object-contain drop-shadow-[0_10px_18px_rgba(37,99,235,0.38)]" />
          </div>

          <p className="font-display text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
            404
          </p>
          <h1 className="mt-2 font-display text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
            {t.notFoundTitle}
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.notFoundHint}
          </p>

          <div className="mt-7 flex justify-center">
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
