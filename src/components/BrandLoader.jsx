import React from "react";

const BrandLoader = ({ label = "Loading..." }) => {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-white/50 dark:border-white/10 bg-white/45 dark:bg-slate-900/45 backdrop-blur-[30px] px-4 py-3">
      <span className="relative w-8 h-8 flex items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-blue-400/40 animate-ping" />
        <span className="w-7 h-7 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center">
          <img src="/icon.svg" alt="loading" className="w-4 h-4 object-contain" />
        </span>
      </span>
      <span className="text-sm type-ui-label text-slate-700 dark:text-slate-200">{label}</span>
    </div>
  );
};

export default BrandLoader;
