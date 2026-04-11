import React from "react";
import { ArrowUpDown } from "lucide-react";

/**
 * Search and sort controls for profile short-link list.
 */
const ShortiesToolbar = ({ t, sort, query, onSortChange, onQueryChange }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
      <div className="space-y-3">
        <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          {t.shortiesTitle}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <ArrowUpDown
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={sort}
              onChange={onSortChange}
              className="h-10 cursor-pointer appearance-none rounded-xl border border-white/55 dark:border-white/10 bg-white/35 dark:bg-black/20 pl-9 pr-8 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition"
            >
              <option value="newest">{t.shortiesSortNewest}</option>
              <option value="oldest">{t.shortiesSortOldest}</option>
              <option value="clicks_desc">{t.shortiesSortClicksDesc}</option>
              <option value="clicks_asc">{t.shortiesSortClicksAsc}</option>
            </select>
          </label>
        </div>
      </div>

      <label className="w-full md:w-[420px]">
        <span className="sr-only">{t.shortiesSearch}</span>
        <input
          value={query}
          onChange={onQueryChange}
          placeholder={t.shortiesSearch}
          className="w-full h-10 rounded-xl border border-white/55 dark:border-white/10 bg-white/35 dark:bg-black/20 px-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition"
        />
      </label>
    </div>
  );
};

export default ShortiesToolbar;
