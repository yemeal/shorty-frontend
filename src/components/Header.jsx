import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Globe, User } from 'lucide-react';
import { useLang } from '../LangContext';

const Header = () => {
  const { lang, toggleLang, t } = useLang();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 sm:pt-6">
      <nav className="flex justify-between items-center mx-auto glass-panel py-2.5 px-5 sm:px-6 rounded-full w-[95%] max-w-3xl border-white/10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group cursor-pointer bg-slate-900 py-1.5 px-3 sm:px-4 rounded-full border border-white/5 shadow-md">
          <div className="relative flex items-center justify-center transition-all duration-500 h-7 w-7 sm:h-9 sm:w-9">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
            <div className="relative bg-blue-600 shadow-inner shadow-white/20 p-1 rounded-full z-10 w-full h-full flex items-center justify-center border border-white/10">
              <Zap size={16} className="text-white group-hover:rotate-12 transition-transform duration-300" strokeWidth={2.5} />
            </div>
          </div>
          <span className="font-display font-bold tracking-tight text-white pr-1 text-base sm:text-lg">
            {t.brand}
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-95 border border-white/5 py-2 px-3 sm:px-4 rounded-full transition-all font-medium text-xs sm:text-sm text-slate-300 hover:text-white shadow-md z-10"
          >
            <Globe size={14} className="text-blue-400" />
            {lang.toUpperCase()}
          </button>
          <a
            href="https://github.com/yemeal/shorty"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center bg-[#0F1C36] hover:bg-[#162A51] hover:scale-105 active:scale-95 border border-blue-500/20 py-2 px-5 rounded-full transition-all font-medium text-sm text-blue-400 hover:text-blue-300 hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] shadow-md z-10"
          >
            <span className="font-bold mr-1.5 drop-shadow-lg">★</span>
            GitHub
          </a>
          
          {/* Profile Placeholder Button */}
          <Link
            to="/profile-placeholder"
            className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#007bff] bg-slate-900 hover:scale-105 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,123,255,0.6)] cursor-pointer overflow-hidden z-10 shrink-0"
          >
            <div className="absolute inset-0 bg-[#007bff]/10 group-hover:bg-[#007bff]/20 transition-all duration-300" />
            <User size={18} className="text-[#007bff] group-hover:text-blue-300 transition-colors duration-300 relative z-10" />
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Header;
