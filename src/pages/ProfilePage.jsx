import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowUpDown, CheckCircle2, Copy, Download, ExternalLink, LogOut, PencilLine, QrCode, Trash2, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import Header from "../components/Header";
import { AUTH_DEFAULT_EMOJI, useAuth } from "../AuthContext";
import { useLang } from "../LangContext";
import { downloadCanvasAsJpg } from "../lib/downloadImage";
import ActionIconButton from "../components/ActionIconButton";

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

const BTN_GLASS =
  "cursor-pointer flex items-center justify-center w-10 h-10 bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-slate-600 dark:text-slate-300";
const BTN_GO =
  "flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-[0_4px_10px_rgba(37,99,235,0.2)] dark:shadow-[0_0_15px_rgba(37,99,235,0.4)]";
const BTN_DANGER =
  "cursor-pointer flex items-center justify-center w-10 h-10 bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl hover:border-red-400 dark:hover:border-red-500 transition-colors text-slate-500 dark:text-slate-400";

const MotionDiv = motion.div;
const MotionButton = motion.button;
const IS_TEST_ENV = import.meta.env.MODE === "test";

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
  const [isMutatingId, setIsMutatingId] = useState(null);

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
  }, [query, sort, safePage]);

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
    let items = [...shorties];

    if (query.trim()) {
      const search = query.toLowerCase().trim();
      items = items.filter(
        (item) => item.short.toLowerCase().includes(search) || item.original.toLowerCase().includes(search),
      );
    }

    if (sort === "newest") items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "oldest") items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === "clicks_desc") items.sort((a, b) => b.clicks - a.clicks);
    if (sort === "clicks_asc") items.sort((a, b) => a.clicks - b.clicks);

    return items;
  }, [query, shorties, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(safePage, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const shownFrom = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const shownTo = (currentPage - 1) * PAGE_SIZE + paged.length;

  const copy = async (value, itemId) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const el = document.createElement("textarea");
        el.value = value;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      toast.success(t.copySuccess);
      setCopiedId(itemId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error(t.errorGeneric);
    }
  };

  const removeShorty = async (itemId) => {
    setIsMutatingId(itemId);
    setTimeout(() => {
      setShorties((prev) => prev.filter((item) => item.id !== itemId));
      setIsMutatingId(null);
      toast.success(t.profileDeleteSuccess);
    }, 380);
  };

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-500/30 relative overflow-hidden transition-colors duration-500">
      <div className="fixed top-[-20%] sm:top-[-15%] left-[50%] -translate-x-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[400px] rounded-[100%] bg-blue-500/10 dark:bg-blue-500/20 blur-[120px] sm:blur-[140px] pointer-events-none z-0 animate-float-delayed" />
      <div className="fixed top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-blue-500/20 dark:bg-blue-600/30 blur-[110px] sm:blur-[130px] pointer-events-none z-0 animate-float" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-purple-500/10 dark:bg-purple-600/20 blur-[130px] sm:blur-[150px] pointer-events-none z-0 animate-float-delayed" />
      <div className="fixed top-[30%] left-[40%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] sm:blur-[120px] pointer-events-none z-0 animate-float" />

      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-16 relative z-10">
        <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}>
          <div className="text-center">
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t.profileTitle}
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t.profileShortDesc}
            </p>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 blur-2xl" />
              <div className="relative h-36 w-36 sm:h-44 sm:w-44 rounded-full flex items-center justify-center text-7xl sm:text-8xl bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-white/10 shadow-[0_16px_45px_rgba(99,102,241,0.25)]">
                {profileEmoji}
              </div>
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{user?.username || "User"}</p>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">{user?.email}</p>
            <div className="mt-3">
              <Link
                to="/placeholder"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/60 dark:border-white/10 bg-white/35 dark:bg-black/20 hover:bg-white/50 dark:hover:bg-black/35 transition px-4 py-2.5 text-sm font-semibold"
              >
                <PencilLine size={16} />
                {t.profileEdit}
              </Link>
            </div>
          </div>
        </MotionDiv>

        <div className="mt-6 relative z-10">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
              <div className="space-y-3">
                <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{t.shortiesTitle}</h2>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="relative">
                    <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={sort}
                      onChange={(e) => {
                        setPage(1);
                        setSort(e.target.value);
                      }}
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
                  onChange={(e) => {
                    setPage(1);
                    setQuery(e.target.value);
                  }}
                  placeholder={t.shortiesSearch}
                  className="w-full h-10 rounded-xl border border-white/55 dark:border-white/10 bg-white/35 dark:bg-black/20 px-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition"
                />
              </label>
            </div>

            <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-[40px] transform-gpu border border-white/50 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-3xl p-4 sm:p-6 relative overflow-hidden transition-shadow duration-300">
              <div className="mb-3">
                <span className="inline-flex items-center rounded-xl border border-white/55 dark:border-white/10 bg-white/35 dark:bg-black/20 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {shownFrom}-{shownTo} {t.paginationOf} {filtered.length}
                </span>
              </div>

              <div className="space-y-3 relative z-10">
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
                    return (
                      <article
                        key={item.id}
                        className="bg-white/15 dark:bg-white/5 backdrop-blur-[25px] border border-white/20 dark:border-white/10 rounded-2xl p-3 sm:p-4 hover:bg-white/25 dark:hover:bg-white/10 transition-all duration-300 shadow-md"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0 flex flex-col overflow-hidden">
                            <span className="text-blue-600 dark:text-blue-400 font-mono text-xs sm:text-base font-bold truncate">{item.short}</span>
                            <span className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-[280px] sm:max-w-md">{item.original}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {t.shortiesClicks}: {item.clicks} · {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <ActionIconButton
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setQrExpandedId((prev) => (prev === item.id ? null : item.id))}
                              variant={qrExpandedId === item.id ? "active" : "default"}
                              aria-label={t.downloadQRBtn}
                            >
                              <QrCode size={18} />
                            </ActionIconButton>
                            <ActionIconButton
                              whileTap={{ scale: 0.92 }}
                              onClick={() => copy(item.short, item.id)}
                              variant={copiedId === item.id ? "success" : "default"}
                              aria-label={t.copyBtn}
                            >
                              {copiedId === item.id ? (
                                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy size={18} />
                              )}
                            </ActionIconButton>
                            <motion.a
                              whileTap={{ scale: 0.92 }}
                              href={`${window.location.protocol}//${item.short}`}
                              target="_blank"
                              rel="noreferrer"
                              className={BTN_GO}
                              aria-label="Open shorty"
                            >
                              <ExternalLink size={18} />
                            </motion.a>
                            <MotionButton
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toast(t.featureUnavailable)}
                              className={BTN_GLASS}
                              aria-label="Edit shorty"
                            >
                              <PencilLine size={16} />
                            </MotionButton>
                            <MotionButton
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeShorty(item.id)}
                              className={BTN_DANGER}
                              aria-label="Delete shorty"
                              disabled={isMutatingId === item.id}
                            >
                              <Trash2 size={16} />
                            </MotionButton>
                          </div>
                        </div>

                        <AnimatePresence>
                          {qrExpandedId === item.id && (
                            <MotionDiv
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
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
                    );
                  })
                )}
              </div>
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
