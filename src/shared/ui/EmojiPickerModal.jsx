import React, {
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion as Motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { EMOJI_CATEGORIES } from "../config/emojiData";
import { emojiHaystackMatchesQuery } from "../lib/emojiSearchExpand";
import { MOTION_EASE_SMOOTH } from "../config/motionTokens";
import EmojiGlyph from "./EmojiGlyph";

/**
 * Full-screen emoji picker modal with bottom category tabs, search, and scrollable grid.
 * Styled in the project's Liquid Glass design system.
 *
 * Architecture note: the overlay backdrop and the modal background are rendered
 * as _sibling_ layers rather than nested, to work around Chromium's nested
 * `backdrop-filter` rendering bug (nested filters get silently dropped).
 *
 * Open/close uses the same CSS droplet pattern as ShortiesToolbar / Header settings
 * (grid-rows 0fr→1fr + width). The page dimmer and the modal glass layer are not
 * wrapped in opacity tweens — animating opacity above `backdrop-filter` causes a
 * visible blur delay / flash in Chromium.
 *
 * @param {boolean}                isOpen
 * @param {(emoji: string) => void} onSelect — called with the selected emoji character
 * @param {() => void}             onClose
 * @param {Record<string, string>} t        — i18n dictionary (uses emojiPickerTitle, emojiPickerSearch, emojiPickerNoResults, + category labelKeys)
 * @param {'ru'|'en'}           [lang='en'] — drives RU/EN query expansion for search
 */

const IS_TEST_ENV = import.meta.env.MODE === "test";

const DROPLET_MS = 400;
const FULL_CATEGORY_RENDER_COUNT = EMOJI_CATEGORIES.length;
const INITIAL_CATEGORY_RENDER_COUNT = IS_TEST_ENV ? FULL_CATEGORY_RENDER_COUNT : 2;
const FULL_EMOJI_RENDER_COUNT = Number.POSITIVE_INFINITY;
const INITIAL_EMOJI_RENDER_COUNT = IS_TEST_ENV ? FULL_EMOJI_RENDER_COUNT : 18;

const dropletEaseStyle = {
  transitionTimingFunction: `cubic-bezier(${MOTION_EASE_SMOOTH.join(",")})`,
};

/* ── Reusable class-name tokens ────────────────────────────────────── */

/** Full-screen overlay — flex-centering wrapper for the modal. */
const OVERLAY_SHELL_CLASS =
  "fixed inset-0 z-[70] flex flex-col items-stretch justify-end px-3 pt-[6.25rem] pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] sm:items-center sm:justify-center sm:px-4 sm:py-6";

/** Overlay backdrop layer (sibling, not parent — avoids nested filter bug). No opacity tween — blur is immediate. */
const OVERLAY_BACKDROP_CLASS =
  "absolute inset-0 bg-black/50 backdrop-blur-md dark:backdrop-blur-lg cursor-default";

/** Modal container — glass card with fixed height, mobile-safe (taller panel + more viewport). */
const MODAL_CONTAINER_CLASS =
  "cursor-default min-w-0 w-full h-[min(42rem,calc(100dvh-6.25rem-env(safe-area-inset-bottom,0px)))] max-h-[calc(100dvh-6.25rem-env(safe-area-inset-bottom,0px))] flex flex-col rounded-[1.75rem] sm:rounded-[2rem] border border-white/60 dark:border-white/10 shadow-2xl shadow-blue-900/10 dark:shadow-black/50 overflow-hidden relative z-10 isolate transform-gpu sm:h-[min(680px,_92vh)] sm:max-h-[92vh]";

/** Internal background blur layer (pushed behind content with -z-10). Not under an opacity tween — avoids backdrop-filter flicker. */
const MODAL_BG_BLUR_CLASS =
  "absolute inset-0 -z-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-[40px] pointer-events-none transform-gpu";

/** Close button (X). */
const CLOSE_BTN_CLASS =
  "cursor-pointer flex items-center justify-center w-9 h-9 rounded-xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-black/20 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-colors";

/** Search bar wrapper (inset glass pill). */
const SEARCH_BAR_CLASS =
  "flex items-center gap-3 bg-white/25 dark:bg-black/30 rounded-2xl px-4 py-2.5 border border-white/40 dark:border-white/10 shadow-[inset_0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_2px_10px_0_rgba(255,255,255,0.05)] focus-within:border-blue-400 dark:focus-within:border-blue-500/30 transition-all";

/** Floating bottom category tab bar. */
const CATEGORY_BAR_CLASS =
  "!absolute bottom-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] left-3 right-3 z-20 bg-[rgba(255,255,255,0.4)] dark:bg-slate-800/50 backdrop-blur-[32px] rounded-3xl border border-white/50 dark:border-white/10 overflow-hidden shrink-0 shadow-sm sm:bottom-2 sm:left-5 sm:right-5 sm:max-w-[calc(100%_-_40px)]";

/** Horizontal scroll container for category buttons (hidden scrollbar). */
const CATEGORY_SCROLL_CLASS =
  "flex items-center gap-2 px-2.5 py-2.5 overflow-x-auto relative z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-1.5 sm:px-2 sm:py-2";

/** Individual category button — base. */
const CAT_BTN_BASE =
  "cursor-pointer shrink-0 flex items-center justify-center w-12 h-12 rounded-[1rem] text-[26px] transition-all sm:w-11 sm:h-11 sm:text-2xl";
const CAT_BTN_ACTIVE =
  "bg-blue-500/20 dark:bg-blue-500/30 border border-blue-400/50 shadow-[0_4px_16px_rgba(59,130,246,0.25)] scale-110";
const CAT_BTN_IDLE =
  "bg-transparent border border-transparent hover:bg-white/30 dark:hover:bg-white/10 hover:border-white/50 hover:scale-105";

/** Single emoji button in the grid. */
const EMOJI_BTN_CLASS =
  "cursor-pointer flex items-center justify-center h-14 sm:h-12 w-full rounded-2xl text-[30px] sm:text-[28px] bg-white/40 dark:bg-black/20 border border-white/50 dark:border-white/5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-white/20 hover:bg-blue-50/50 dark:hover:bg-white/5 hover:scale-105 active:scale-95 transition-all";

/* ── Component ─────────────────────────────────────────────────────── */

const EmojiPickerModal = ({ isOpen, onSelect, onClose, t, lang = "en" }) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(EMOJI_CATEGORIES[0].id);
  const [mounted, setMounted] = useState(isOpen);
  const [dropletExpanded, setDropletExpanded] = useState(isOpen && IS_TEST_ENV);
  const [isCategoryRenderExpanded, setIsCategoryRenderExpanded] = useState(IS_TEST_ENV);
  const [isEmojiRenderExpanded, setIsEmojiRenderExpanded] = useState(IS_TEST_ENV);
  const closeTimerRef = useRef(null);
  const gridRef = useRef(null);
  const categoryRefs = useRef({});
  const tabsRef = useRef(null);
  const searchInputRef = useRef(null);
  const isScrollingFromClick = useRef(false);

  /* ── Mount + droplet (open / close) ─────────────────────────────── */

  useLayoutEffect(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (isOpen) {
      let innerOpenId = null;
      const openId = window.requestAnimationFrame(() => {
        setIsCategoryRenderExpanded(IS_TEST_ENV);
        setIsEmojiRenderExpanded(IS_TEST_ENV);
        setMounted(true);
        if (IS_TEST_ENV) {
          setDropletExpanded(true);
          return;
        }
        setDropletExpanded(false);
        innerOpenId = window.requestAnimationFrame(() => {
          setDropletExpanded(true);
        });
      });
      return () => {
        window.cancelAnimationFrame(openId);
        if (innerOpenId != null) {
          window.cancelAnimationFrame(innerOpenId);
        }
      };
    }

    if (IS_TEST_ENV) {
      const closeId = window.setTimeout(() => {
        setDropletExpanded(false);
        setMounted(false);
      }, 0);
      return () => window.clearTimeout(closeId);
    }

    const closeDropletId = window.requestAnimationFrame(() => {
      setDropletExpanded(false);
    });
    closeTimerRef.current = window.setTimeout(() => {
      setMounted(false);
      closeTimerRef.current = null;
    }, DROPLET_MS);
    return () => {
      window.cancelAnimationFrame(closeDropletId);
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isOpen]);

  /* ── Effects ──────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!isOpen) return undefined;
    const resetId = window.setTimeout(() => {
      setSearch("");
      setActiveCategory(EMOJI_CATEGORIES[0].id);
    }, 0);
    return () => window.clearTimeout(resetId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || search.trim() || IS_TEST_ENV || isCategoryRenderExpanded) {
      return undefined;
    }

    let timeoutId = null;
    let idleId = null;
    const expandCategories = () => setIsCategoryRenderExpanded(true);

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(expandCategories, { timeout: 180 });
    } else {
      timeoutId = window.setTimeout(expandCategories, 120);
    }

    return () => {
      if (idleId != null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isCategoryRenderExpanded, isOpen, search]);

  useEffect(() => {
    if (!isOpen || !dropletExpanded || search.trim() || IS_TEST_ENV || isEmojiRenderExpanded) {
      return undefined;
    }

    let timeoutId = null;
    let idleId = null;
    const expandEmojis = () => {
      startTransition(() => {
        setIsEmojiRenderExpanded(true);
      });
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(expandEmojis, { timeout: 240 });
    } else {
      timeoutId = window.setTimeout(expandEmojis, 150);
    }

    return () => {
      if (idleId != null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [dropletExpanded, isEmojiRenderExpanded, isOpen, search]);

  useEffect(() => {
    if (!isOpen || !dropletExpanded) return undefined;
    const id = window.setTimeout(() => searchInputRef.current?.focus(), IS_TEST_ENV ? 0 : 200);
    return () => window.clearTimeout(id);
  }, [isOpen, dropletExpanded]);

  useEffect(() => {
    if (!mounted) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, onClose]);

  /* ── Derived data ────────────────────────────────────────────────── */

  const hasSearch = Boolean(search.trim());

  const filteredCategories = useMemo(() => {
    const q = search.trim();
    if (!q) return EMOJI_CATEGORIES;
    return EMOJI_CATEGORIES.map((cat) => ({
      ...cat,
      emojis: cat.emojis.filter((e) => {
        const keywords = e[1];
        return keywords && typeof keywords === "string" && emojiHaystackMatchesQuery(keywords, q, lang);
      }),
    })).filter((cat) => cat.emojis.length > 0);
  }, [search, lang]);

  const renderedCategories = useMemo(() => {
    if (hasSearch || isCategoryRenderExpanded) return filteredCategories;
    return filteredCategories.slice(0, INITIAL_CATEGORY_RENDER_COUNT);
  }, [filteredCategories, hasSearch, isCategoryRenderExpanded]);

  /* ── Callbacks ───────────────────────────────────────────────────── */

  useEffect(() => {
    if (!tabsRef.current) return;
    const activeBtn = tabsRef.current.querySelector(`[data-cat-id="${activeCategory}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeCategory]);

  const handleGridScroll = useCallback(() => {
    if (isScrollingFromClick.current || search.trim()) return;
    const container = gridRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    let current = renderedCategories[0]?.id ?? EMOJI_CATEGORIES[0].id;

    for (const cat of renderedCategories) {
      const el = categoryRefs.current[cat.id];
      if (el && el.offsetTop <= scrollTop + 80) {
        current = cat.id;
      }
    }
    setActiveCategory(current);
  }, [renderedCategories, search]);

  const scrollToCategory = useCallback((catId) => {
    setActiveCategory(catId);

    const performScroll = () => {
      const el = categoryRefs.current[catId];
      if (!el || !gridRef.current) return;
      isScrollingFromClick.current = true;
      gridRef.current.scrollTo({
        top: el.offsetTop - 8,
        behavior: "smooth",
      });
      window.setTimeout(() => {
        isScrollingFromClick.current = false;
      }, 500);
    };

    if (!search.trim()) {
      setIsCategoryRenderExpanded(true);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(performScroll);
      });
      return;
    }

    performScroll();
  }, [search]);

  const handleSelect = useCallback(
    (emoji) => {
      onSelect(emoji);
      onClose();
    },
    [onSelect, onClose],
  );

  const handleWheelOnTabs = useCallback((e) => {
    if (tabsRef.current) {
      e.preventDefault();
      tabsRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  /* ── Render ──────────────────────────────────────────────────────── */

  const showCategories = !hasSearch;

  /**
   * Droplet split like ShortiesToolbar: grid-rows and width animate on different nodes.
   * A stable max-w-md shell + min-w-0/overflow-hidden prevents the emoji grid’s intrinsic
   * min-width from ballooning the panel to full viewport width during close.
   */
  const dropletGridClass = `grid w-full min-w-0 origin-center transition-[grid-template-rows] duration-[400ms] ${
    dropletExpanded
      ? "grid-rows-[1fr] min-h-[min(42rem,calc(100dvh-6.25rem-env(safe-area-inset-bottom,0px)))] sm:min-h-[min(680px,_92vh)]"
      : "grid-rows-[0fr] min-h-0"
  }`;

  const dropletWidthClass = `shrink-0 min-w-0 overflow-hidden transition-[width] duration-[400ms] ${
    dropletExpanded ? "w-full" : "w-24 sm:w-28"
  }`;

  if (!mounted) return null;

  return (
    <div className={OVERLAY_SHELL_CLASS}>
      <div
        className={OVERLAY_BACKDROP_CLASS}
        onClick={onClose}
        role="presentation"
        aria-hidden
      />

      <div className="z-10 flex w-full min-h-0 min-w-0 flex-1 items-end justify-stretch px-0 py-0 pointer-events-none sm:items-center sm:justify-center">
        {/* pointer-events-auto: children inherit none from the flex layer above — without this, emoji/category taps never hit the dialog */}
        <div className="mx-auto w-full max-w-md min-w-0 shrink-0 pointer-events-auto">
          <div className={dropletGridClass} style={dropletEaseStyle}>
            <div
              className={`overflow-hidden overflow-x-hidden min-h-0 min-w-0 flex items-end justify-stretch sm:justify-center ${
                !dropletExpanded ? "pointer-events-none" : ""
              }`}
            >
              <div className={dropletWidthClass} style={dropletEaseStyle}>
                <div
                  className={MODAL_CONTAINER_CLASS}
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="emoji-picker-title"
                >
                    <div className={MODAL_BG_BLUR_CLASS} />

                    <div className="flex justify-center pt-3 pb-1 shrink-0 sm:hidden">
                      <div className="h-1.5 w-14 rounded-full bg-slate-300/70 dark:bg-white/15" />
                    </div>

                    <div className="flex items-center justify-between px-4 pt-2 pb-3 shrink-0 sm:px-5 sm:pt-5">
                      <h2
                        id="emoji-picker-title"
                        className="type-display-title text-lg text-slate-900 dark:text-white"
                      >
                        {t.emojiPickerTitle || "Choose emoji"}
                      </h2>
                      <Motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className={CLOSE_BTN_CLASS}
                        aria-label="Close"
                      >
                        <X size={18} />
                      </Motion.button>
                    </div>

                    <div className="px-4 pb-3 shrink-0 sm:px-5">
                      <div className={SEARCH_BAR_CLASS}>
                        <Search size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder={t.emojiPickerSearch || "Search emoji..."}
                          className="type-ui-input flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
                        />
                        {search && (
                          <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="relative flex-1 flex flex-col min-h-0">
                      <div
                        ref={gridRef}
                        onScroll={handleGridScroll}
                        className={`flex-1 overflow-y-auto px-4 pt-2 custom-scrollbar sm:px-5 ${showCategories ? "pb-[88px] sm:pb-[72px]" : "pb-5"}`}
                      >
                        {filteredCategories.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                            {t.emojiPickerNoResults || "No emoji found"}
                          </div>
                        ) : (
                          renderedCategories.map((cat) => (
                            <div key={cat.id} ref={(el) => { categoryRefs.current[cat.id] = el; }}>
                              <p className="type-ui-label text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 mb-3 mt-4 first:mt-1 px-1">
                                {t[cat.labelKey] || cat.id}
                              </p>
                              <div className="grid grid-cols-5 gap-2.5 sm:grid-cols-6 sm:gap-2">
                                {(hasSearch || isEmojiRenderExpanded
                                  ? cat.emojis
                                  : cat.emojis.slice(0, INITIAL_EMOJI_RENDER_COUNT)
                                ).map(([emoji]) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => handleSelect(emoji)}
                                    className={EMOJI_BTN_CLASS}
                                    aria-label={emoji}
                                  >
                                    <EmojiGlyph
                                      emoji={emoji}
                                      label={emoji}
                                      className="h-8 w-8"
                                      textClassName="text-[28px]"
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {showCategories && (
                        <div className={CATEGORY_BAR_CLASS}>
                          <div
                            ref={tabsRef}
                            onWheel={handleWheelOnTabs}
                            className={CATEGORY_SCROLL_CLASS}
                          >
                            {EMOJI_CATEGORIES.map((cat) => (
                              <button
                                key={cat.id}
                                data-cat-id={cat.id}
                                type="button"
                                onClick={() => scrollToCategory(cat.id)}
                                className={`${CAT_BTN_BASE} ${activeCategory === cat.id ? CAT_BTN_ACTIVE : CAT_BTN_IDLE}`}
                                aria-label={t[cat.labelKey] || cat.id}
                                title={t[cat.labelKey] || cat.id}
                              >
                                <EmojiGlyph
                                  emoji={cat.icon}
                                  label={t[cat.labelKey] || cat.id}
                                  className="h-7 w-7"
                                  textClassName="text-2xl"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmojiPickerModal;
