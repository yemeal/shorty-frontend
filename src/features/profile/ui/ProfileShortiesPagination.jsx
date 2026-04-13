import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildCompactPaginationItems } from "../model/profilePagination";

const GLASS_BTN =
  "cursor-pointer rounded-xl min-w-[2.25rem] h-9 px-2.5 text-sm font-medium border border-white/50 dark:border-white/10 bg-white/35 dark:bg-black/20 disabled:opacity-45 disabled:cursor-not-allowed transition-[background-color,border-color,box-shadow] duration-200 hover:bg-white/55 dark:hover:bg-black/35";

const PAGE_BTN =
  "cursor-pointer rounded-lg min-w-8 h-8 px-1.5 text-xs font-semibold tabular-nums border transition-[background-color,border-color,color,box-shadow] duration-200 sm:min-w-[2rem] sm:px-2 sm:text-sm";

const PAGE_BTN_IDLE =
  "border-white/45 dark:border-white/10 bg-white/25 dark:bg-black/20 text-slate-600 dark:text-slate-300 hover:bg-white/45 dark:hover:bg-black/35 hover:border-blue-400/40 dark:hover:border-blue-500/25";

const PAGE_BTN_ACTIVE =
  "border-blue-500/50 dark:border-blue-400/40 bg-blue-500/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-200 shadow-[0_0_0_1px_rgba(59,130,246,0.12)]";

/**
 * Prev / compact page numbers / Next — glass style aligned with profile list.
 */
const ProfileShortiesPagination = ({
  t,
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
}) => {
  const items = useMemo(
    () => buildCompactPaginationItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

  if (totalPages < 1) return null;

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
      aria-label={t.paginationNavLabel}
    >
      <button
        type="button"
        aria-label={t.paginationPrev}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage}
        className={`inline-flex items-center justify-center gap-1 pl-2.5 pr-3 ${GLASS_BTN}`}
      >
        <ChevronLeft size={16} className="shrink-0 opacity-80" aria-hidden />
        <span className="hidden sm:inline">{t.paginationPrev}</span>
      </button>

      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 px-1">
        {items.map((item, idx) =>
          item === "ellipsis" ? (
            <span
              key={`e-${idx}`}
              className="min-w-[1.25rem] text-center text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 select-none"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`${PAGE_BTN} ${item === currentPage ? PAGE_BTN_ACTIVE : PAGE_BTN_IDLE}`}
              aria-label={`${t.paginationPage} ${item}`}
              aria-current={item === currentPage ? "page" : undefined}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        aria-label={t.paginationNext}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className={`inline-flex items-center justify-center gap-1 pl-3 pr-2.5 ${GLASS_BTN}`}
      >
        <span className="hidden sm:inline">{t.paginationNext}</span>
        <ChevronRight size={16} className="shrink-0 opacity-80" aria-hidden />
      </button>
    </nav>
  );
};

export default ProfileShortiesPagination;
