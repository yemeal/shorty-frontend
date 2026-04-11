import React, { useEffect, useMemo, useState } from "react";
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
import { filterShorties, paginateShorties, sortShorties } from "../features/profile/model/shorties";
import ProfileHeroSection from "../features/profile/ui/ProfileHeroSection";
import ShortiesToolbar from "../features/profile/ui/ShortiesToolbar";
import { GLASS_HOVER_INTERACTIVE_CLASS, MOTION_TRANSITION } from "../lib/motionTokens";

// Temporary local mock list. The UI state/logic is API-ready and can be
// switched to backend data once profile shorties endpoint is available.
const MOCK_SHORTIES = [
  { id: "s1", short: "шорти.рф/spacefox", original: "https://example.com/blog/space-fox", clicks: 212, createdAt: "2026-03-27T11:20:00Z" },
  { id: "s2", short: "шорти.рф/chillwave", original: "https://example.com/playlist/chillwave", clicks: 82, createdAt: "2026-03-30T18:10:00Z" },
  { id: "s3", short: "шорти.рф/nightowl", original: "https://example.com/article/night-productivity", clicks: 146, createdAt: "2026-04-01T08:40:00Z" },
  { id: "s4", short: "шорти.рф/spark-labs", original: "https://example.com/product/spark-labs", clicks: 67, createdAt: "2026-04-03T13:00:00Z" },
  { id: "s5", short: "шорти.рф/sea-salt", original: "https://example.com/store/sea-salt", clicks: 15, createdAt: "2026-04-06T09:15:00Z" },
  { id: "s6", short: "шорти.рф/ultra-read", original: "https://example.com/docs/ultra-read", clicks: 304, createdAt: "2026-04-08T07:40:00Z" },
  { id: "s7", short: "шорти.рф/green-loop", original: "https://example.com/green-loop", clicks: 43, createdAt: "2026-04-08T19:20:00Z" },
  { id: "s8", short: "шорти.рф/echo", original: "https://example.com/podcast/echo", clicks: 89, createdAt: "2026-04-09T12:50:00Z" },
];

const PAGE_SIZE = 5;

const BTN_GO =
  "flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-[0_4px_10px_rgba(37,99,235,0.2)] dark:shadow-[0_0_15px_rgba(37,99,235,0.4)]";

const MotionDiv = motion.div;
const MotionButton = motion.button;
const IS_TEST_ENV = import.meta.env.MODE === "test";

function mockDeleteShortyRequest() {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 320);
  });
}

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [sort, setSort] = useState(() => searchParams.get("sort") || "newest");
  const [page, setPage] = useState(() => Number(searchParams.get("page") || 1));
  const [shorties, setShorties] = useState(MOCK_SHORTIES);
  const [qrExpandedId, setQrExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isLoadingShorties, setIsLoadingShorties] = useState(!IS_TEST_ENV);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
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
    if (IS_TEST_ENV) return undefined;
    setIsLoadingShorties(true);
    const timeoutId = window.setTimeout(() => setIsLoadingShorties(false), 550);
    return () => window.clearTimeout(timeoutId);
  }, [query, safePage]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setQrExpandedId(null);
        setIsLogoutConfirmOpen(false);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Centralized derived list for search + sorting.
  const filtered = useMemo(() => {
    return sortShorties(filterShorties(shorties, query), sort);
  }, [query, shorties, sort]);

  const { totalPages, currentPage, paged, shownFrom, shownTo } = useMemo(
    () => paginateShorties(filtered, PAGE_SIZE, safePage),
    [filtered, safePage],
  );

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

  const removeShorty = async (itemId) => {
    setDeletingIds((prev) => new Set(prev).add(itemId));

    try {
      await Promise.all([
        mockDeleteShortyRequest(),
        new Promise((resolve) => window.setTimeout(resolve, 420)),
      ]);
      setShorties((prev) => prev.filter((item) => item.id !== itemId));
      toast.success(t.profileDeleteSuccess);
    } catch {
      toast.error(t.errorGeneric);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

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
                  {shownFrom}-{shownTo} {t.paginationOf} {filtered.length}
                </span>
              </div>

              <LayoutGroup>
              <MotionDiv layout className="space-y-3 relative z-10">
                {isLoadingShorties ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={`skeleton-${idx}`}
                      className="rounded-2xl p-3 sm:p-4 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 animate-pulse"
                    >
                      <div className="h-4 w-40 bg-white/40 dark:bg-white/10 rounded mb-2" />
                      <div className="h-3 w-full bg-white/35 dark:bg-white/10 rounded mb-2" />
                      <div className="h-3 w-28 bg-white/30 dark:bg-white/10 rounded" />
                    </div>
                  ))
                ) : paged.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 py-10 text-center">
                    <UserCircle2 size={24} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-slate-500 dark:text-slate-400">{t.shortiesEmpty}</p>
                    <div className="mt-4 flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setQuery("");
                          setSort("newest");
                          setPage(1);
                        }}
                        className="cursor-pointer rounded-xl px-3 py-2 text-sm font-medium border border-white/50 dark:border-white/10 bg-white/35 dark:bg-black/20"
                      >
                        {t.profileResetFilters}
                      </button>
                    </div>
                  </div>
                ) : (
                  paged.map((item) => {
                    const qrId = `qr-profile-${item.id}`;
                    const isDeleting = deletingIds.has(item.id);
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
                                href: `${window.location.protocol}//${item.short}`,
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
                                onClick: () => removeShorty(item.id),
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
                                    value={`${window.location.protocol}//${item.short}`}
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
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="cursor-pointer rounded-xl px-3 py-2 text-sm font-medium border border-white/50 dark:border-white/10 bg-white/35 dark:bg-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.paginationPrev}
              </button>
              <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {t.paginationPage} {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
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
    </div>
  );
};

export default ProfilePage;
