import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { CheckCircle2, Copy, Download, ExternalLink, LogOut, PencilLine, QrCode, Trash2, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import Header from "../components/Header";
import { AUTH_DEFAULT_EMOJI, useAuth } from "../AuthContext";
import { useLang } from "../LangContext";
import { downloadCanvasAsJpg } from "../lib/downloadImage";
import CardActions from "../components/CardActions";
import AppBackground from "../shared/ui/AppBackground";
import { copyTextToClipboard } from "../shared/lib/clipboard";
import { buildPublicShortUrlAbsolute } from "../shared/lib/publicShortUrl";
import ProfileHeroSection from "../features/profile/ui/ProfileHeroSection";
import ShortiesToolbar from "../features/profile/ui/ShortiesToolbar";
import { fetchMyShortUrls } from "../features/profile/api/fetchMyShortUrls";
import { deleteMyShortUrl } from "../features/profile/api/deleteMyShortUrl";
import { ApiError } from "../shared/lib/api";
import {
  PROFILE_SHORTIES_PAGE_SIZE,
  PROFILE_SEARCH_DEBOUNCE_MS,
  uiSortToApiSort,
} from "../features/profile/model/myShortUrlsQuery";
import { GLASS_HOVER_INTERACTIVE_CLASS, MOTION_TRANSITION } from "../lib/motionTokens";
import { removeRecentLinkBySlug } from "../hooks/useRecentLinks";
import { GlassSecondaryButton } from "../shared/ui/GlassSecondaryAction";
import { ShortenStylePrimaryLink } from "../shared/ui/ShortenStylePrimaryLink";

const BTN_GO =
  "flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-[0_4px_10px_rgba(37,99,235,0.2)] dark:shadow-[0_0_15px_rgba(37,99,235,0.4)]";

const MotionDiv = motion.div;
const MotionButton = motion.button;
const IS_TEST_ENV = import.meta.env.MODE === "test";
const SEARCH_DEBOUNCE_MS = IS_TEST_ENV ? 0 : PROFILE_SEARCH_DEBOUNCE_MS;
/** Wait for collapse animation before background refetch (grid transition ~460ms). */
const DELETE_REFETCH_DELAY_MS = 480;

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(() => (searchParams.get("q") || "").trim());
  const [sort, setSort] = useState(() => searchParams.get("sort") || "newest");
  const [page, setPage] = useState(() => Number(searchParams.get("page") || 1));
  const [shorties, setShorties] = useState([]);
  const [listMeta, setListMeta] = useState(null);
  const [listError, setListError] = useState(false);
  const [qrExpandedId, setQrExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isLoadingShorties, setIsLoadingShorties] = useState(true);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deletingIds, setDeletingIds] = useState(new Set());

  const profileEmoji = user?.emoji || AUTH_DEFAULT_EMOJI;
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;

  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    if (sort !== "newest") next.set("sort", sort);
    if (safePage > 1) next.set("page", String(safePage));
    setSearchParams(next, { replace: true });
  }, [query, safePage, setSearchParams, sort]);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedQuery(query.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const loadShorties = useCallback(
    async (opts = {}) => {
      const background = Boolean(opts.background);
      setListError(false);
      if (!background) {
        setIsLoadingShorties(true);
      }
      const { sort_by, sort_order } = uiSortToApiSort(sort);
      try {
        const data = await fetchMyShortUrls({
          page: safePage,
          pageSize: PROFILE_SHORTIES_PAGE_SIZE,
          sortBy: sort_by,
          sortOrder: sort_order,
          q: debouncedQuery,
        });

        let nextPage = safePage;
        if (data.meta.total_pages > 0 && safePage > data.meta.total_pages) {
          nextPage = data.meta.total_pages;
        } else if (data.meta.total_items > 0 && data.items.length === 0 && safePage > 1) {
          nextPage = 1;
        }
        if (nextPage !== safePage) {
          setPage(nextPage);
          return;
        }

        setShorties(data.items);
        setListMeta(data.meta);
      } catch {
        setListError(true);
        if (!background) {
          toast.error(t.errorGeneric);
        }
      } finally {
        if (!background) {
          setIsLoadingShorties(false);
        }
      }
    },
    [debouncedQuery, safePage, sort, t],
  );

  useEffect(() => {
    loadShorties();
  }, [loadShorties]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setQrExpandedId(null);
        setIsLogoutConfirmOpen(false);
        setPendingDeleteId(null);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const { shownFrom, shownTo, totalForBadge, currentPage, totalPages } = useMemo(() => {
    const meta = listMeta;
    const total = meta?.total_items ?? 0;
    if (!meta || total === 0) {
      return {
        shownFrom: 0,
        shownTo: 0,
        totalForBadge: total,
        currentPage: meta?.page ?? safePage,
        totalPages: Math.max(1, meta?.total_pages ?? 1),
      };
    }
    const from = (meta.page - 1) * meta.page_size + 1;
    const to = (meta.page - 1) * meta.page_size + shorties.length;
    return {
      shownFrom: from,
      shownTo: to,
      totalForBadge: total,
      currentPage: meta.page,
      totalPages: Math.max(1, meta.total_pages || 1),
    };
  }, [listMeta, shorties.length, safePage]);

  const copy = async (value, itemId) => {
    try {
      const ok = await copyTextToClipboard(value);
      if (!ok) throw new Error("copy-failed");
      toast.success(t.copySuccess);
      setCopiedId(itemId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error(t.errorGeneric);
    }
  };

  const confirmDeleteShorty = async () => {
    const itemId = pendingDeleteId;
    if (!itemId) return;
    const row = shorties.find((s) => s.id === itemId);
    const deletedSlug = row?.slug;
    setPendingDeleteId(null);

    try {
      await deleteMyShortUrl(itemId);
      if (deletedSlug) removeRecentLinkBySlug(deletedSlug);
      setDeletingIds((prev) => new Set(prev).add(itemId));
      toast.success(t.profileDeleteSuccess);
      window.setTimeout(async () => {
        try {
          await loadShorties({ background: true });
        } finally {
          setDeletingIds((prev) => {
            const next = new Set(prev);
            next.delete(itemId);
            return next;
          });
        }
      }, DELETE_REFETCH_DELAY_MS);
    } catch (err) {
      const description =
        err instanceof ApiError ? err.message || t.errorGeneric : err?.message || t.errorGeneric;
      toast.error(t.profileDeleteFailedTitle, { description });
      await loadShorties({ background: true });
    }
  };

  const openAbsolute = (slug) => buildPublicShortUrlAbsolute(slug);

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-500/30 relative overflow-hidden transition-colors duration-500">
      <AppBackground />

      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-16 relative z-10">
        <div>
          <ProfileHeroSection
            t={t}
            profileEmoji={profileEmoji}
            username={user?.username}
            email={user?.email}
          />
        </div>

        <div className="mt-6 relative z-10">
          <div className="relative z-10">
            <ShortiesToolbar
              t={t}
              sort={sort}
              query={query}
              onSortChange={(e) => {
                setPage(1);
                setSort(e.target.value);
              }}
              onQueryChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
            />

            <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-[40px] transform-gpu border border-white/50 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-3xl p-4 sm:p-6 relative overflow-hidden transition-shadow duration-300">
              <div className="mb-3">
                <span className="inline-flex items-center rounded-xl border border-white/55 dark:border-white/10 bg-white/35 dark:bg-black/20 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {shownFrom}-{shownTo} {t.paginationOf} {totalForBadge}
                </span>
              </div>

              <LayoutGroup>
              <MotionDiv layout className="space-y-3 relative z-10">
                {listError && !isLoadingShorties ? (
                  <div className="rounded-2xl border border-dashed border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 py-10 text-center">
                    <p className="text-slate-500 dark:text-slate-400">{t.shortiesLoadError}</p>
                    <button
                      type="button"
                      onClick={() => loadShorties()}
                      className="mt-4 cursor-pointer rounded-xl px-3 py-2 text-sm font-medium border border-white/50 dark:border-white/10 bg-white/35 dark:bg-black/20"
                    >
                      {t.shortiesRetry}
                    </button>
                  </div>
                ) : isLoadingShorties ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={`skeleton-${idx}`}
                      className="rounded-2xl p-3 sm:p-4 bg-slate-100/90 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none animate-pulse"
                    >
                      <div className="h-4 w-40 bg-slate-300/90 dark:bg-white/10 rounded mb-2" />
                      <div className="h-3 w-full bg-slate-200/95 dark:bg-white/10 rounded mb-2" />
                      <div className="h-3 w-28 bg-slate-200/90 dark:bg-white/10 rounded" />
                    </div>
                  ))
                ) : shorties.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 py-10 text-center">
                    <UserCircle2 size={24} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-slate-500 dark:text-slate-400">{t.shortiesEmpty}</p>
                    <div className="mt-5 flex flex-col items-center gap-3">
                      <ShortenStylePrimaryLink to="/" className="justify-center" size="prominent">
                        {t.profileCreateNewShorty}
                      </ShortenStylePrimaryLink>
                      <GlassSecondaryButton
                        variant="compact"
                        onClick={() => {
                          setQuery("");
                          setSort("newest");
                          setPage(1);
                        }}
                      >
                        {t.profileResetFilters}
                      </GlassSecondaryButton>
                    </div>
                  </div>
                ) : (
                  shorties.map((item) => {
                    const qrId = `qr-profile-${item.id}`;
                    const isDeleting = deletingIds.has(item.id);
                    const absoluteUrl = openAbsolute(item.slug);
                    return (
                      <MotionDiv
                        key={item.id}
                        layout
                        transition={MOTION_TRANSITION.normal}
                        className={`grid mx-auto origin-center transition-[grid-template-rows,max-width,opacity,transform] duration-[460ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
                          isDeleting
                            ? "overflow-hidden grid-rows-[0fr] max-w-[9rem] opacity-0 scale-95"
                            : "overflow-visible grid-rows-[1fr] max-w-full opacity-100 scale-100"
                        }`}
                      >
                        <article className={`min-h-0 bg-white/15 dark:bg-white/5 backdrop-blur-[25px] border border-white/20 dark:border-white/10 rounded-2xl p-3 sm:p-4 hover:bg-white/25 dark:hover:bg-white/10 shadow-md ${GLASS_HOVER_INTERACTIVE_CLASS}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                          <div className="min-w-0 flex flex-col overflow-hidden">
                            <span className="text-blue-600 dark:text-blue-400 font-mono text-xs sm:text-base font-bold truncate">{item.short}</span>
                            <span className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-[280px] sm:max-w-md">{item.original}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {t.shortiesClicks}: {item.clicks} · {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <CardActions
                            actions={[
                              {
                                key: "qr",
                                onClick: () => setQrExpandedId((prev) => (prev === item.id ? null : item.id)),
                                variant: qrExpandedId === item.id ? "active" : "default",
                                ariaLabel: t.downloadQRBtn,
                                whileTap: { scale: 0.9 },
                                icon: <QrCode size={18} />,
                              },
                              {
                                key: "copy",
                                onClick: () => copy(item.short, item.id),
                                variant: copiedId === item.id ? "success" : "default",
                                ariaLabel: t.copyBtn,
                                whileTap: { scale: 0.92 },
                                icon:
                                  copiedId === item.id ? (
                                    <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <Copy size={18} />
                                  ),
                              },
                              {
                                key: "open",
                                type: "link",
                                href: absoluteUrl,
                                target: "_blank",
                                rel: "noreferrer",
                                ariaLabel: "Open shorty",
                                className: BTN_GO,
                                whileTap: { scale: 0.92 },
                                icon: <ExternalLink size={18} />,
                              },
                              {
                                key: "edit",
                                onClick: () => toast(t.featureUnavailable),
                                variant: "default",
                                ariaLabel: "Edit shorty",
                                whileTap: { scale: 0.9 },
                                icon: <PencilLine size={16} />,
                              },
                              {
                                key: "delete",
                                onClick: () => setPendingDeleteId(item.id),
                                variant: "dangerHover",
                                ariaLabel: "Delete shorty",
                                whileTap: { scale: 0.9 },
                                disabled: isDeleting,
                                icon: <Trash2 size={16} />,
                              },
                            ]}
                            centered
                          />
                        </div>

                        <AnimatePresence>
                          {qrExpandedId === item.id && (
                            <MotionDiv
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={MOTION_TRANSITION.droplet}
                              className="overflow-hidden flex flex-col items-center gap-3"
                            >
                              <div className="w-full border-t border-slate-200/50 dark:border-white/10 mt-3 pt-3 flex flex-col items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  <QRCodeCanvas
                                    id={qrId}
                                    value={absoluteUrl}
                                    size={120}
                                    bgColor="#ffffff"
                                    fgColor="#0f172a"
                                    level="Q"
                                    imageSettings={{ src: "/icon.svg", width: 28, height: 28, excavate: true }}
                                  />
                                </div>
                                <MotionButton
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => downloadCanvasAsJpg(qrId, `shorty-qr-${item.id}.jpg`, { quality: 0.96, scale: 4 })}
                                  className="flex items-center gap-2 cursor-pointer text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                  <Download size={14} />
                                  {t.downloadQRBtn}
                                </MotionButton>
                              </div>
                            </MotionDiv>
                          )}
                        </AnimatePresence>
                      </article>
                      </MotionDiv>
                    );
                  })
                )}
              </MotionDiv>
              </LayoutGroup>
            </div>
          </div>

          <div className="mt-5 flex justify-center relative z-10">
            <div className="inline-flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!listMeta?.has_previous_page}
                className="cursor-pointer rounded-xl px-3 py-2 text-sm font-medium border border-white/50 dark:border-white/10 bg-white/35 dark:bg-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.paginationPrev}
              </button>
              <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {t.paginationPage} {listMeta ? currentPage : safePage} / {listMeta ? totalPages : "—"}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!listMeta?.has_next_page}
                className="cursor-pointer rounded-xl px-3 py-2 text-sm font-medium border border-white/50 dark:border-white/10 bg-white/35 dark:bg-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.paginationNext}
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-display font-bold border border-white/50 dark:border-white/10 bg-white/35 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/35 transition text-red-500"
            >
              <LogOut size={16} />
              {t.signOut}
            </button>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isLogoutConfirmOpen && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm flex items-center justify-center px-4"
          >
            <MotionDiv
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-md rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-[30px] border border-white/50 dark:border-white/10 shadow-2xl p-6 text-center"
            >
              <p className="font-display text-xl font-black text-slate-900 dark:text-white">
                {t.logoutConfirmTitle}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  className="cursor-pointer rounded-2xl px-4 py-2.5 text-sm font-semibold border border-white/50 dark:border-white/10 bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/35 transition"
                >
                  {t.logoutConfirmNo}
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    setIsLogoutConfirmOpen(false);
                  }}
                  className="cursor-pointer rounded-2xl px-4 py-2.5 text-sm font-semibold bg-red-500/90 hover:bg-red-500 text-white transition"
                >
                  {t.logoutConfirmYes}
                </button>
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingDeleteId && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[71] bg-black/45 backdrop-blur-sm flex items-center justify-center px-4"
          >
            <MotionDiv
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-md rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-[30px] border border-white/50 dark:border-white/10 shadow-2xl p-6 text-center"
            >
              <p className="font-display text-xl font-black text-slate-900 dark:text-white">
                {t.deleteConfirmTitle}
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.deleteConfirmIrreversible}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  data-testid="shorty-delete-cancel"
                  onClick={() => setPendingDeleteId(null)}
                  className="cursor-pointer rounded-2xl px-4 py-2.5 text-sm font-semibold border border-white/50 dark:border-white/10 bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/35 transition"
                >
                  {t.deleteConfirmNo}
                </button>
                <button
                  type="button"
                  data-testid="shorty-delete-confirm"
                  onClick={() => void confirmDeleteShorty()}
                  className="cursor-pointer rounded-2xl px-4 py-2.5 text-sm font-semibold bg-red-500/90 hover:bg-red-500 text-white transition"
                >
                  {t.deleteConfirmYes}
                </button>
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
