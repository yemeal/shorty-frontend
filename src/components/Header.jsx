import React from 'react';
import { Zap, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ lang, toggleLang }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile-placeholder');
  };

  return (
    <nav className="flex justify-between items-center mx-auto glass-panel py-2.5 px-5 sm:px-6 rounded-full w-[95%] max-w-3xl border-white/10">
      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer bg-slate-900 py-1.5 px-3 sm:px-4 rounded-full border border-white/5 shadow-md">
        <div className="relative flex items-center justify-center transition-all duration-500 h-7 w-7 sm:h-9 sm:w-9">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
          <div className="relative bg-blue-600 shadow-inner shadow-white/20 p-1 rounded-full z-10 w-full h-full flex items-center justify-center border border-white/10">
            <Zap size={16} className="text-white group-hover:rotate-12 transition-transform duration-300" strokeWidth={2.5} />
          </div>
        </div>
        <span className="font-display font-bold tracking-tight text-white pr-1 text-base sm:text-lg">
          шорти.рф
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={toggleLang}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-95 border border-white/5 py-2 px-3 sm:px-4 rounded-full transition-all font-medium text-xs sm:text-sm text-slate-300 hover:text-white shadow-md z-10"
        >
          <Globe size={14} className="text-blue-400" />
          {lang.toUpperCase()}
        </button>
        {/* Profile Button */}
        <button
          onClick={handleProfileClick}
          className="flex items-center justify-center w-9 h-9 rounded-full border border-[#007bff]/30 hover:border-[#007bff]/70 hover:shadow-[0_0_10px_rgba(0,123,255,0.6)] transition-all duration-200"
          title="Профиль"
        >
          {/* Simple avatar icon using a circle with initials */}
          <span className="text-xs font-medium text-[#007bff]">👤</span>
        </button>
      </div>
    </nav>
  );
};

export default Header;
