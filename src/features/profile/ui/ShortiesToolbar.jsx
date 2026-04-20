import React, { useCallback, useId, useMemo, useRef, useState } from "react";
import { ArrowUpDown, ChevronDown, Hash } from "lucide-react";
import {
  PROFILE_SHORTIES_PAGE_SIZE_MAX,
  PROFILE_SHORTIES_PAGE_SIZE_MIN,
} from "../model/myShortUrlsQuery";
import { GLASS_HOVER_INTERACTIVE_CLASS, MOTION_EASE_SMOOTH } from "../../../lib/motionTokens";
import { useDismissOnOutsidePress } from "../../../hooks/useDismissOnOutsidePress";

/**
 * Колонка триггера: на мобилке на всю ширину, с sm — компактная фиксированная ширина (длинный текст режется truncate).
 */
const TOOLBAR_TRIGGER_COL = "w-full sm:w-[14rem] shrink-0 min-w-0";

/**
 * Сортировка: иконка слева (pl-9). Высота 44px — норм для touch.
 */
const TRIGGER_SHELL_SORT =
  "relative flex h-11 min-w-0 w-full cursor-pointer items-center rounded-xl border pl-9 pr-10 text-left text-sm outline-none transition-[border-color,box-shadow,background-color] duration-300 focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-400/30 touch-manipulation";

/** «На странице»: как сортировка, иконка # слева (pl-9). */
const TRIGGER_SHELL_PAGE_SIZE =
  "relative flex h-11 min-w-0 w-full cursor-pointer items-center rounded-xl border pl-9 pr-10 text-left text-sm outline-none transition-[border-color,box-shadow,background-color] duration-300 focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-400/30 touch-manipulation";

const TRIGGER_IDLE =
  "border-white/55 dark:border-white/10 bg-white/35 dark:bg-black/20 text-slate-800 dark:text-white";

const TRIGGER_OPEN =
  "bg-blue-50/90 border-blue-300/60 text-slate-900 dark:bg-slate-800/90 dark:border-blue-500/45 dark:text-white";

const ICON_ABS = "pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400";

const CHEVRON_ABS =
  "pointer-events-none absolute right-2.5 top-1/2 z-10 size-4 -translate-y-1/2 text-slate-400 opacity-80 transition-transform duration-[400ms]";

const dropletOuterClass = (isOpen) =>
  `absolute left-1/2 top-full z-20 mt-1.5 w-full min-w-0 -translate-x-1/2 grid transition-[grid-template-rows] duration-[400ms] ${
    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
  }`;

const dropletEaseStyle = {
  transitionTimingFunction: `cubic-bezier(${MOTION_EASE_SMOOTH.join(",")})`,
};

const dropletWidthClass = (isOpen) =>
  `max-w-full shrink-0 transition-[width] duration-[400ms] ${isOpen ? "w-full" : "w-9 sm:w-10"}`;

/** Тот же вид, что на десктопе; зона тапа задаётся обёрткой, не высотой трека. */
const PAGE_SIZE_RANGE_CLASS =
  "w-full h-2 cursor-pointer appearance-none rounded-full bg-slate-200/70 dark:bg-white/[0.08] accent-blue-600 dark:accent-blue-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-sm dark:[&::-webkit-slider-thumb]:bg-blue-400 [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-blue-600 dark:[&::-moz-range-thumb]:bg-blue-400";

const SORT_OPTION_BASE = `flex w-full cursor-pointer rounded-xl border border-transparent px-3 py-2.5 text-left text-sm font-medium text-slate-800 dark:text-slate-200 transition-colors duration-200 hover:bg-white/25 dark:hover:bg-white/10 active:scale-[0.99] touch-manipulation ${GLASS_HOVER_INTERACTIVE_CLASS}`;

const SORT_OPTION_ACTIVE =
  "border-blue-400/40 bg-blue-500/12 font-semibold text-blue-900 dark:border-blue-500/35 dark:bg-blue-500/18 dark:text-blue-50";

/**
 * Поиск и сортировка в профиле.
 * Мобилка: блоки столбцом на всю ширину; с sm — два триггера фиксированной ширины в ряд.
 */
const ShortiesToolbar = ({
  t,
  sort,
  query,
  pageSize,
  onPageSizeChange,
  onSortChange,
  onQueryChange,
}) => {
  const [openMenu, setOpenMenu] = useState(null);
  const sortTriggerRef = useRef(null);
  const sortPanelRef = useRef(null);
  const pageSizeTriggerRef = useRef(null);
  const pageSizePanelRef = useRef(null);
  const sortPanelId = useId();
  const pageSizePanelId = useId();

  const sortOpen = openMenu === "sort";
  const pageSizeOpen = openMenu === "pageSize";

  const pageSizeAriaLabel = useMemo(
    () => t.shortiesPerPageButton.replace("{n}", String(pageSize)),
    [t.shortiesPerPageButton, pageSize],
  );

  const sortOptions = useMemo(
    () => [
      { value: "newest", label: t.shortiesSortNewest },
      { value: "oldest", label: t.shortiesSortOldest },
      { value: "clicks_desc", label: t.shortiesSortClicksDesc },
      { value: "clicks_asc", label: t.shortiesSortClicksAsc },
    ],
    [t],
  );

  const currentSortLabel = useMemo(
    () => sortOptions.find((o) => o.value === sort)?.label ?? sortOptions[0].label,
    [sort, sortOptions],
  );

  const closeMenus = useCallback(() => setOpenMenu(null), []);

  useDismissOnOutsidePress({
    active: openMenu != null,
    rootRefs: [sortTriggerRef, sortPanelRef, pageSizeTriggerRef, pageSizePanelRef],
    onDismiss: closeMenus,
  });

  const toggleSort = () => setOpenMenu((m) => (m === "sort" ? null : "sort"));
  const togglePageSize = () => setOpenMenu((m) => (m === "pageSize" ? null : "pageSize"));

  const toolbarChromeZ = openMenu ? "relative z-[200]" : "";

  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
      <div className="space-y-3 w-full md:max-w-xl min-w-0">
        <h2 className="type-display-title text-3xl sm:text-4xl text-slate-900 dark:text-white">
          {t.shortiesTitle}
        </h2>

        <div
          className={`grid grid-cols-2 gap-2 min-w-0 sm:flex sm:flex-row sm:flex-wrap sm:items-end sm:gap-2 ${toolbarChromeZ}`}
        >
          <div className={`relative min-w-0 ${TOOLBAR_TRIGGER_COL}`}>
            <div className="relative w-full min-w-0">
              <button
                ref={sortTriggerRef}
                type="button"
                aria-expanded={sortOpen}
                aria-controls={sortPanelId}
                aria-haspopup="listbox"
                aria-label={`${t.profileToolbarSortMenuAria}. ${currentSortLabel}`}
                className={`${TRIGGER_SHELL_SORT} ${sortOpen ? TRIGGER_OPEN : TRIGGER_IDLE}`}
                onClick={() => toggleSort()}
              >
                <ArrowUpDown size={14} className={ICON_ABS} aria-hidden />
                <span className="min-w-0 flex-1 truncate pr-1">{currentSortLabel}</span>
                <ChevronDown
                  size={16}
                  className={`${CHEVRON_ABS} ${sortOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""}`}
                  aria-hidden
                />
              </button>

              <div
                ref={sortPanelRef}
                id={sortPanelId}
                aria-hidden={!sortOpen}
                className={dropletOuterClass(sortOpen)}
                style={dropletEaseStyle}
              >
                <div
                  className={`flex w-full min-h-0 justify-center overflow-hidden ${!sortOpen ? "pointer-events-none" : ""}`}
                >
                  <div className={dropletWidthClass(sortOpen)} style={dropletEaseStyle}>
                    <div className="px-4 pb-6 pt-1 -mx-4">
                      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-[40px] rounded-3xl border border-white/50 dark:border-white/10 overflow-hidden relative shadow-lg dark:shadow-2xl">
                        <div
                          role="listbox"
                          aria-label={t.profileToolbarSortMenuAria}
                          className="flex flex-col gap-1.5 p-3 sm:p-3.5 relative z-10"
                        >
                          {sortOptions.map(({ value, label }) => (
                            <button
                              key={value}
                              type="button"
                              role="option"
                              aria-selected={sort === value}
                              className={`${SORT_OPTION_BASE} ${sort === value ? SORT_OPTION_ACTIVE : ""}`}
                              onClick={() => {
                                onSortChange(value);
                                setOpenMenu(null);
                              }}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`relative min-w-0 ${TOOLBAR_TRIGGER_COL}`}>
            <div className="relative w-full min-w-0">
              <button
                ref={pageSizeTriggerRef}
                type="button"
                aria-expanded={pageSizeOpen}
                aria-controls={pageSizePanelId}
                aria-haspopup="dialog"
                aria-label={pageSizeAriaLabel}
                title={t.shortiesPerPageTooltip}
                className={`${TRIGGER_SHELL_PAGE_SIZE} ${pageSizeOpen ? TRIGGER_OPEN : TRIGGER_IDLE}`}
                onClick={() => togglePageSize()}
              >
                <Hash size={14} className={ICON_ABS} aria-hidden />
                <span className="flex min-w-0 flex-1 items-center justify-between gap-2 pr-1">
                  <span className="truncate">{t.shortiesPerPage}</span>
                  <span className="type-tech-strong shrink-0 text-sm text-slate-900 dark:text-white">
                    {pageSize}
                  </span>
                </span>
                <ChevronDown
                  size={16}
                  className={`${CHEVRON_ABS} ${pageSizeOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""}`}
                  aria-hidden
                />
              </button>

              <div
                ref={pageSizePanelRef}
                id={pageSizePanelId}
                aria-hidden={!pageSizeOpen}
                role="presentation"
                className={dropletOuterClass(pageSizeOpen)}
                style={dropletEaseStyle}
              >
                <div
                  className={`flex w-full min-h-0 justify-center overflow-hidden ${!pageSizeOpen ? "pointer-events-none" : ""}`}
                >
                  <div className={dropletWidthClass(pageSizeOpen)} style={dropletEaseStyle}>
                    <div className="px-4 pb-6 pt-1 -mx-4">
                      <div
                        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-[40px] rounded-3xl border border-white/50 dark:border-white/10 overflow-hidden relative shadow-lg dark:shadow-2xl"
                        role="dialog"
                        aria-label={t.shortiesPerPage}
                        aria-modal="false"
                      >
                        <div className="px-3 py-3 sm:px-4 sm:py-4 relative z-10">
                          <div className="flex min-h-11 items-center sm:min-h-0">
                            <input
                              type="range"
                              min={PROFILE_SHORTIES_PAGE_SIZE_MIN}
                              max={PROFILE_SHORTIES_PAGE_SIZE_MAX}
                              step={1}
                              value={pageSize}
                              onChange={(e) => onPageSizeChange(Number(e.target.value))}
                              aria-valuemin={PROFILE_SHORTIES_PAGE_SIZE_MIN}
                              aria-valuemax={PROFILE_SHORTIES_PAGE_SIZE_MAX}
                              aria-valuenow={pageSize}
                              aria-label={t.shortiesPerPage}
                              className={PAGE_SIZE_RANGE_CLASS}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <label className="w-full md:w-[420px] min-w-0 block touch-manipulation">
        <span className="sr-only">{t.shortiesSearch}</span>
        <input
          value={query}
          onChange={onQueryChange}
          placeholder={t.shortiesSearch}
          className="type-ui-input w-full h-11 rounded-xl border border-white/55 dark:border-white/10 bg-white/35 dark:bg-black/20 px-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition"
        />
      </label>
    </div>
  );
};

export default ShortiesToolbar;
