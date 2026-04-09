import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Globe, User, Settings, Sun, Moon, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../LangContext';
import { useTheme } from '../ThemeContext';

const Header = () => {
  const { lang, toggleLang, t } = useLang();
  const { theme, toggleTheme, triggerAntigravity } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 sm:pt-6">
      <motion.div 
        layout
        className="flex flex-col mx-auto glass-panel rounded-3xl w-[95%] max-w-4xl border-slate-200/20 dark:border-white/10 overflow-hidden"
      >
        <nav className="flex justify-between items-center h-[75px] sm:h-[90px] px-6 sm:px-8 shrink-0 z-20 bg-transparent">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 sm:gap-4 group cursor-pointer bg-white dark:bg-slate-900 py-1.5 px-4 sm:py-2.5 sm:px-6 rounded-full border border-slate-200 dark:border-white/5 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="relative flex items-center justify-center transition-all duration-500 h-8 w-8 sm:h-9 sm:w-9">
              {/* Outer pulsing glow */}
              <div className="absolute inset-0 bg-blue-500/30 rounded-xl blur-lg opacity-40 group-hover:opacity-70 group-hover:scale-125 transition-all duration-500" />
              
              {/* Inner container */}
              <div className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <img 
                  src="/icon.svg" 
                  alt="Shorty Logo" 
                  className="w-full h-full object-contain rounded-lg transition-all duration-300"
                />
              </div>
            </div>
            <span className="font-display font-extrabold tracking-tight text-slate-900 dark:text-white pr-1 text-base sm:text-xl drop-shadow-sm">
              {t.brand}
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              aria-label={t.settingsTitle}
              aria-expanded={isSettingsOpen}
              className={`flex items-center justify-center cursor-pointer bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 border border-slate-200 dark:border-white/5 w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all shadow-md z-10 ${isSettingsOpen ? 'bg-blue-50 border-blue-200 dark:bg-slate-800 dark:border-blue-500/50' : ''}`}
            >
              <Settings size={18} className={`transition-transform duration-500 ${isSettingsOpen ? 'rotate-90 text-blue-500' : 'text-slate-600 dark:text-slate-300'}`} />
            </button>
            
            {/* Profile Placeholder Button */}
            <Link
              to="/profile-placeholder"
              className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#007bff] bg-white dark:bg-slate-900 hover:scale-105 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,123,255,0.4)] dark:hover:shadow-[0_0_15px_rgba(0,123,255,0.6)] cursor-pointer overflow-hidden z-10 shrink-0"
            >
              <div className="absolute inset-0 bg-[#007bff]/5 dark:bg-[#007bff]/10 group-hover:bg-[#007bff]/15 dark:group-hover:bg-[#007bff]/20 transition-all duration-300" />
              <User size={18} className="text-[#007bff] group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors duration-300 relative z-10" />
            </Link>
          </div>
        </nav>

        {/* Settings Expanded Area */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="px-5 sm:px-6 pb-5 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Lang Toggle */}
                <button
                  onClick={toggleLang}
                  className="flex items-center gap-3 cursor-pointer bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:-translate-y-1 active:scale-[0.95] border border-slate-200/50 dark:border-white/5 p-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md group"
                >
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <Globe size={18} className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Язык / Lang</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{lang.toUpperCase()}</span>
                  </div>
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 cursor-pointer bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:-translate-y-1 active:scale-[0.95] border border-slate-200/50 dark:border-white/5 p-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md group"
                >
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    {theme === 'dark' ? <Sun size={18} className="text-indigo-600 dark:text-indigo-400" /> : <Moon size={18} className="text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.themeToggle}</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{theme === 'dark' ? t.themeLight : t.themeDark}</span>
                  </div>
                </button>

                {/* Easter Egg */}
                <button
                  onClick={() => {
                    triggerAntigravity();
                    setIsSettingsOpen(false);
                  }}
                  className="flex items-center gap-3 cursor-pointer bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 hover:-translate-y-1 active:scale-[0.95] border border-red-200 dark:border-red-500/20 p-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-red-500/20 group"
                >
                  <div className="bg-red-100 dark:bg-red-500/20 p-2 rounded-lg group-hover:-translate-y-2 group-hover:rotate-12 transition-all duration-300">
                    <Rocket size={18} className="text-red-500 dark:text-red-400" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-red-500/80 dark:text-red-400/80 font-medium font-mono uppercase tracking-widest text-[10px]">Top Secret</span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">{t.easterEgg}</span>
                  </div>
                </button>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Header;
