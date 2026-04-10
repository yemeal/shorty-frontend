import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Globe, LogIn, Settings, Sun, Moon, Rocket } from "lucide-react";
import { useLang } from "../LangContext";
import { useTheme } from "../ThemeContext";
import { useAuth, AUTH_DEFAULT_EMOJI } from "../AuthContext";

const BUTTON_CLASS =
  "flex items-center gap-3 cursor-pointer bg-white/15 dark:bg-white/5 backdrop-blur-[25px] border border-white/30 dark:border-white/10 border-t-white/40 dark:border-t-white/10 p-3 rounded-xl hover:-translate-y-1 active:scale-[0.97] transition-all duration-500 shadow-[0_10px_25px_-10px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-[0_15px_35px_-8px_rgba(0,0,0,0.1)] group";

const Header = () => {
  const { lang, toggleLang, t } = useLang();
  const { theme, toggleTheme, triggerAntigravity } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 sm:pt-6">
      <div className="w-[95%] max-w-4xl relative">
        <div className="glass-panel rounded-3xl border-slate-200/20 dark:border-white/10 overflow-hidden relative">
          <nav className="flex justify-between items-center h-[75px] sm:h-[90px] px-6 sm:px-8 relative z-20">
            <Link to="/" className="flex items-center gap-3 sm:gap-4 group cursor-pointer bg-white dark:bg-slate-900 py-1.5 px-4 sm:py-2.5 sm:px-6 rounded-full border border-slate-200 dark:border-white/5 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="relative flex items-center justify-center transition-all duration-500 h-8 w-8 sm:h-9 sm:w-9">
                <div className="absolute inset-0 bg-blue-500/30 rounded-xl blur-lg opacity-40 group-hover:opacity-70 group-hover:scale-125 transition-all duration-500" />
                <div className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <img src="/icon.svg" alt="Shorty Logo" className="w-full h-full object-contain rounded-lg transition-all duration-300" />
                </div>
              </div>
              <span className="font-display font-extrabold tracking-tight text-slate-900 dark:text-white pr-1 text-base sm:text-xl drop-shadow-sm">
                {t.brand}
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                aria-label={t.settingsTitle}
                aria-expanded={isSettingsOpen}
                className={`flex items-center justify-center cursor-pointer bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 border border-slate-200 dark:border-white/5 w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all shadow-md z-10 ${isSettingsOpen ? 'bg-blue-50 border-blue-200 dark:bg-slate-800 dark:border-blue-500/50' : ''}`}
              >
                <Settings size={18} className={`transition-transform duration-500 ${isSettingsOpen ? 'rotate-90 text-blue-500' : 'text-slate-600 dark:text-slate-300'}`} />
              </button>

              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="flex items-center justify-center cursor-pointer bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 border border-slate-200 dark:border-white/5 w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all shadow-md hover:shadow-lg"
                  aria-label={t.profileTitle}
                >
                  <span className="text-xl sm:text-2xl">
                    {user?.emoji || AUTH_DEFAULT_EMOJI}
                  </span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="cursor-pointer bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-display font-black w-10 h-10 sm:w-auto sm:px-6 sm:py-2.5 sm:h-11 rounded-full sm:rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.97] shrink-0 shadow-md hover:shadow-lg"
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

        {/* Settings panel — always in DOM, CSS grid-rows + width transition (droplet) */}
        <div
          aria-hidden={!isSettingsOpen}
          className={`absolute top-full right-0 mt-3 mb-6 grid transition-[grid-template-rows,width] duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
            isSettingsOpen ? 'grid-rows-[1fr] w-64 sm:w-72' : 'grid-rows-[0fr] w-32 sm:w-36'
          }`}
        >
          <div className={`overflow-hidden min-h-0 ${!isSettingsOpen ? 'pointer-events-none' : ''}`}>
            <div className="px-1 pb-6">
              <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-[40px] transform-gpu border border-white/50 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-3xl overflow-hidden">
                <div className="flex flex-col gap-2 p-3 sm:p-4">

                  <button onClick={toggleLang} className={BUTTON_CLASS}>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <Globe size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Язык / Lang</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{lang.toUpperCase()}</span>
                    </div>
                  </button>

                  <button onClick={toggleTheme} className={BUTTON_CLASS}>
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      {theme === 'dark' ? <Sun size={18} className="text-indigo-600 dark:text-indigo-400" /> : <Moon size={18} className="text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.themeToggle}</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{theme === 'dark' ? t.themeLight : t.themeDark}</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      triggerAntigravity();
                      setIsSettingsOpen(false);
                    }}
                    className={BUTTON_CLASS}
                  >
                    <div className="bg-slate-100 dark:bg-slate-700/30 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <Rocket size={18} className="text-slate-600 dark:text-slate-300" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.secret}</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{t.doNotPress}</span>
                    </div>
                  </button>

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
