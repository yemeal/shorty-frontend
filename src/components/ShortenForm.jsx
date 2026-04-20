import React, { useEffect, useId, useLayoutEffect, useRef, useState, memo } from 'react';
import { Link2, Copy, CheckCircle2, Loader2, ArrowRight, ExternalLink, QrCode, Download, Trash2 } from 'lucide-react';
import { useLang } from '../LangContext';
import { useRecentLinks } from '../hooks/useRecentLinks';
import { motion as Motion, AnimatePresence, LayoutGroup, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { QRCodeCanvas } from 'qrcode.react';
import { ApiError, apiPostJson } from '../shared/lib/api';
import { downloadCanvasAsJpg } from '../lib/downloadImage';
import CardActions from './CardActions';
import {
    GLASS_HOVER_INTERACTIVE_CLASS,
    MOTION_DURATION,
    MOTION_EASE_OUT_SMOOTH,
    MOTION_EASE_SMOOTH,
} from '../lib/motionTokens';
import { copyTextToClipboard } from '../shared/lib/clipboard';
import { buildPublicShortUrlDisplay } from '../shared/lib/publicShortUrl';
import { validateSlug } from '../features/shorten/model/slug';

const DRAFT_STORAGE_KEY = 'shorty-shorten-draft';
const HUMAN_INPUT_CLASS =
    "type-ui-input flex-1 w-full bg-transparent py-3 focus:outline-none text-base placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-white";

const TECH_INPUT_CLASS =
    "type-tech flex-1 w-full bg-transparent py-3 focus:outline-none text-base placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-white";

const BTN_GO =
    "flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-[background-color,box-shadow,transform] duration-200 shadow-[0_4px_10px_rgba(37,99,235,0.2)] dark:shadow-[0_0_15px_rgba(37,99,235,0.4)]";

const RecentLinkItem = memo(({ link, t, idx, isQrOpen, onToggleQr }) => {
    const [isCopied, setIsCopied] = useState(false);
    // Делаем уникальный ID для каждого QR
    const qrCanvasId = `qr-recent-${idx}`;

    const handleCopy = async () => {
        try {
            const ok = await copyTextToClipboard(link.shortUrl);
            if (!ok) throw new Error("copy-failed");
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
            toast.success(t.copySuccess);
        } catch {
            toast.error(t.errorGeneric);
        }
    };

    return (
        <Motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                layout: { duration: 0.38, ease: MOTION_EASE_OUT_SMOOTH },
                opacity: { duration: 0.34, delay: idx * 0.032, ease: MOTION_EASE_OUT_SMOOTH },
                y: { duration: 0.38, delay: idx * 0.032, ease: MOTION_EASE_OUT_SMOOTH },
            }}
            className={`group bg-white/15 dark:bg-white/5 backdrop-blur-[25px] border border-white/20 dark:border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col hover:bg-white/25 dark:hover:bg-white/10 shadow-md ${GLASS_HOVER_INTERACTIVE_CLASS}`}
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex flex-col overflow-hidden">
                    <span className="type-tech-strong text-blue-600 dark:text-blue-400 text-xs sm:text-base truncate">
                        {link.shortUrl}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-[280px] sm:max-w-md">
                        {link.original}
                    </span>
                </div>
                <CardActions
                    actions={[
                        {
                            key: "qr",
                            whileTap: { scale: 0.9 },
                            onClick: onToggleQr,
                            variant: isQrOpen ? "active" : "default",
                            ariaLabel: t.downloadQRBtn,
                            icon: <QrCode size={18} />
                        },
                        {
                            key: "copy",
                            whileTap: { scale: 0.92 },
                            onClick: handleCopy,
                            title: t.copyBtn,
                            variant: isCopied ? "success" : "default",
                            ariaLabel: t.copyBtn,
                            icon: isCopied ? <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={18} />
                        },
                        {
                            key: "open",
                            type: "link",
                            whileTap: { scale: 0.92 },
                            href: `${window.location.protocol}//${link.shortUrl}`,
                            target: "_blank",
                            rel: "noreferrer",
                            title: "Open Link",
                            ariaLabel: "Open Link",
                            className: BTN_GO,
                            icon: <ExternalLink size={18} />
                        }
                    ]}
                    centered
                />
            </div>

            {/* QR Code Expansion for Recent Link */}
            <AnimatePresence>
                {isQrOpen && (
                    <Motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: MOTION_EASE_OUT_SMOOTH }}
                        className="overflow-hidden flex flex-col items-center gap-3"
                    >
                        <div className="w-full border-t border-slate-200/50 dark:border-white/10 mt-3 pt-3 flex flex-col items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <QRCodeCanvas
                                    id={qrCanvasId}
                                    value={`${window.location.protocol}//${link.shortUrl}`}
                                    size={120}
                                    bgColor={"#ffffff"}
                                    fgColor={"#0f172a"}
                                    level={"Q"}
                                    imageSettings={{
                                        src: "/icon.svg",
                                        height: 28,
                                        width: 28,
                                        excavate: true,
                                    }}
                                />
                            </div>
                            <Motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    const ok = downloadCanvasAsJpg(qrCanvasId, `shorty-qr-${idx}.jpg`, { quality: 0.96, scale: 4 });
                                    if (!ok) toast.error(t.qrDownloadError);
                                }}
                                className="flex items-center gap-2 cursor-pointer text-xs type-ui-label text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                <Download size={14} />
                                {t.downloadQRBtn}
                            </Motion.button>
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </Motion.div>
    );
});

/**
 * «Капля» только при первом появлении блока успеха; при смене ссылки (skipEntrance) оболочка остаётся раскрытой.
 */
const SuccessResultDropletShell = ({ prefersReducedMotion, skipEntrance, children }) => {
    const [hasAnimatedOpen, setHasAnimatedOpen] = useState(() =>
        Boolean(skipEntrance || prefersReducedMotion),
    );

    useLayoutEffect(() => {
        if (skipEntrance || prefersReducedMotion || hasAnimatedOpen) {
            return undefined;
        }
        let innerId;
        const outerId = requestAnimationFrame(() => {
            innerId = requestAnimationFrame(() => setHasAnimatedOpen(true));
        });
        return () => {
            cancelAnimationFrame(outerId);
            if (innerId != null) cancelAnimationFrame(innerId);
        };
    }, [hasAnimatedOpen, prefersReducedMotion, skipEntrance]);

    const open = skipEntrance || prefersReducedMotion || hasAnimatedOpen;

    return (
        <div
            className={`grid w-full mx-auto transition-[grid-template-rows,max-width] duration-[400ms] ${
                open ? "grid-rows-[1fr] max-w-full" : "grid-rows-[0fr] max-w-[6rem] sm:max-w-[7.5rem]"
            }`}
            style={{
                transitionTimingFunction: `cubic-bezier(${MOTION_EASE_SMOOTH.join(",")})`,
            }}
        >
            <div className="min-h-0 overflow-hidden px-1.5 pt-1 pb-2 sm:px-2 sm:pb-3">
                {children}
            </div>
        </div>
    );
};

const ShortenForm = () => {
    const { t } = useLang();
    const prefersReducedMotion = useReducedMotion();
    const longUrlFieldId = useId();
    const customSlugFieldId = useId();
    const customSlugPanelId = useId();
    const formShellVariants = prefersReducedMotion
        ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
        : {
              hidden: { opacity: 0, y: 40, scale: 0.96 },
              show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                      delay: 0.1,
                      duration: MOTION_DURATION.reveal,
                      ease: MOTION_EASE_OUT_SMOOTH,
                  },
              },
          };
    const [longUrl, setLongUrl] = useState(() => {
        try {
            const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (!saved) return '';
            return JSON.parse(saved)?.longUrl || '';
        } catch {
            return '';
        }
    });
    const [shortUrl, setShortUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [expandedRecentQrId, setExpandedRecentQrId] = useState(null);
    const [errorField, setErrorField] = useState(null); // 'long_url' | 'slug' | null
    /** first = капля; replace = та же панель, смена ссылки через flip */
    const [successRevealMode, setSuccessRevealMode] = useState("first");

    // Custom Slug State
    const [isCustomSlug, setIsCustomSlug] = useState(() => {
        try {
            const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (!saved) return false;
            return Boolean(JSON.parse(saved)?.isCustomSlug);
        } catch {
            return false;
        }
    });
    const [customSlug, setCustomSlug] = useState(() => {
        try {
            const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (!saved) return '';
            return JSON.parse(saved)?.customSlug || '';
        } catch {
            return '';
        }
    });
    const mainInputRef = useRef(null);
    const customSlugInputRef = useRef(null);

    // History Hook
    const { recentLinks, addLink, clearHistory } = useRecentLinks();

    const formLayoutTransition = prefersReducedMotion
        ? { layout: { duration: 0 } }
        : { layout: { duration: 0.42, ease: MOTION_EASE_OUT_SMOOTH } };

    useEffect(() => {
        try {
            localStorage.setItem(
                DRAFT_STORAGE_KEY,
                JSON.stringify({
                    longUrl,
                    customSlug,
                    isCustomSlug,
                }),
            );
        } catch {
            // no-op: draft persistence should not break the flow
        }
    }, [customSlug, isCustomSlug, longUrl]);

    useEffect(() => {
        const onKeyDown = (event) => {
            if (
                event.key === '/' &&
                !(event.target instanceof HTMLInputElement) &&
                !(event.target instanceof HTMLTextAreaElement)
            ) {
                event.preventDefault();
                mainInputRef.current?.focus();
            }
            if (event.key === 'Escape') {
                setShowQR(false);
                setShowHistory(false);
                setExpandedRecentQrId(null);
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const handleShorten = async (e) => {
        e.preventDefault();
        setErrorField(null);
        if (!longUrl.trim()) {
            toast.error(t.errorEmpty);
            setErrorField('long_url');
            return;
        }

        let payload = { long_url: longUrl.trim() };

        if (!/^https?:\/\//i.test(payload.long_url)) {
            payload.long_url = 'https://' + payload.long_url;
        }

        if (isCustomSlug) {
            const errCode = validateSlug(customSlug);
            if (errCode) {
                toast.error(t[errCode]);
                setErrorField('slug');
                return;
            }
            payload.slug = customSlug;
        }

        setIsLoading(true);
        setShowQR(false);

        try {
            const data = await apiPostJson('/short_url/', payload);
            const createdSlug = data?.slug ?? data?.short_url;
            if (!createdSlug) {
                throw new Error(t.errorGeneric);
            }
            const generatedUrl = buildPublicShortUrlDisplay(createdSlug);
            setSuccessRevealMode(shortUrl ? "replace" : "first");
            setShortUrl(generatedUrl);
            toast.success(t.shortenSuccessTitle, { description: t.shortenSuccessDescription });
            localStorage.removeItem(DRAFT_STORAGE_KEY);

            // Add to history
            addLink({
                original: payload.long_url,
                shortUrl: generatedUrl,
                date: new Date().toISOString()
            });

        } catch (err) {
            if (err instanceof ApiError) {
                if (err.status === 409) {
                    setErrorField('slug');
                    toast.error(t.slugErrorTaken);
                    return;
                }
                if (err.status === 422) {
                    setErrorField('long_url');
                }
                toast.error(err.message || t.errorGeneric);
                return;
            }
            toast.error(err?.message || t.errorGeneric);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (textToCopy = shortUrl) => {
        try {
            const ok = await copyTextToClipboard(textToCopy);
            if (!ok) throw new Error("copy-failed");

            if (textToCopy === shortUrl) {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            }
            toast.success(t.copySuccess);
        } catch {
            toast.error(t.errorGeneric);
        }
    };

    const handleCustomSlugToggle = () => {
        setIsCustomSlug((prev) => {
            if (prev) {
                setCustomSlug('');
                customSlugInputRef.current?.blur();
            }
            return !prev;
        });
    };

    return (
        <div className="w-full max-w-2xl relative z-10 mb-4 sm:mb-20 px-2 sm:px-0 mx-auto">
            <Motion.div
                layout
                variants={formShellVariants}
                initial="hidden"
                animate="show"
                transition={formLayoutTransition}
                className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-[40px] transform-gpu border border-white/50 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-3xl p-4 sm:p-8 pb-3 sm:pb-5 dark:pb-4 relative overflow-visible transition-[box-shadow] duration-300"
            >
                <LayoutGroup id="shorten-form">
                <Motion.form
                    layout
                    onSubmit={handleShorten}
                    noValidate
                    transition={formLayoutTransition}
                    className="flex flex-col relative z-10"
                >

                    <div className={`flex flex-col sm:flex-row items-center gap-3 sm:gap-2 bg-white/20 dark:bg-black/30 backdrop-blur-[30px] rounded-3xl p-2 border transition-[background-color,border-color,box-shadow] duration-200 shadow-[inset_0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_2px_10px_0_rgba(255,255,255,0.05)] mb-8 ${
                        errorField === 'long_url' 
                        ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-red-500/5' 
                        : 'border-white/30 dark:border-white/10 border-t-white/40 dark:border-t-white/10 focus-within:border-blue-400 dark:focus-within:border-blue-500/30'
                    }`}>
                        <div className="flex w-full sm:w-auto items-center flex-1 gap-2 sm:gap-4 pl-4 sm:pl-8 py-2 sm:py-0">
                            <Link2 size={22} className={`${errorField === 'long_url' ? 'text-red-400' : 'text-blue-500'} opacity-90 shrink-0`} />
                            <input
                                id={longUrlFieldId}
                                name="long_url"
                                ref={mainInputRef}
                                type="url"
                                placeholder={t.placeholder}
                                aria-label={t.placeholder}
                                className={HUMAN_INPUT_CLASS}
                                value={longUrl}
                                inputMode="url"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                onChange={(e) => {
                                    setLongUrl(e.target.value);
                                    if(errorField === 'long_url') setErrorField(null);
                                }}
                            />
                        </div>
                        <Motion.button
                            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                            whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                            disabled={isLoading}
                            aria-label={t.shortenBtn}
                            className="w-full sm:w-auto cursor-pointer bg-blue-500/15 dark:bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 dark:border-blue-400/40 border-t-blue-400/20 dark:border-t-white/20 text-blue-600 dark:text-white type-display-cta px-8 py-4 sm:py-0 sm:h-14 rounded-3xl sm:rounded-full transition-[background-color,border-color,box-shadow,transform,opacity] duration-200 flex items-center justify-center gap-2 group/btn active:scale-[0.97] shrink-0 shadow-xl dark:shadow-[0_0_25px_rgba(37,99,235,0.15)] overflow-hidden relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/35"
                        >
                            {isLoading ? (
                                <Motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                    <Loader2 className="text-white/70" />
                                </Motion.div>
                            ) : (
                                <div className="relative z-10 flex items-center gap-2">
                                    <span className="text-base sm:text-lg">{t.shortenBtn}</span>
                                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform shrink-0" />
                                </div>
                            )}

                            {/* Slow Liquid Shimmer Reflection - Brand Gradient Color */}
                            {prefersReducedMotion ? null : (
                                <Motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/40 via-indigo-500/50 via-purple-400/40 to-transparent -skew-x-[20deg] blur-md"
                                    animate={{
                                        x: ['-100%', '200%']
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 6,
                                        ease: "linear",
                                        repeatDelay: 0.5
                                    }}
                                />
                            )}
                        </Motion.button>
                    </div>

                    <div className="flex items-center justify-end w-full px-4 gap-3 mb-2">
                        <button
                            type="button"
                            className="text-xs sm:text-sm type-ui-label text-slate-600 dark:text-slate-400 cursor-pointer select-none transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/35"
                            onClick={handleCustomSlugToggle}
                        >
                            {t.customSlugLabel}
                        </button>
                        <Motion.button
                            whileTap={{ scale: 0.92 }}
                            type="button"
                            onClick={handleCustomSlugToggle}
                            aria-controls={customSlugPanelId}
                            aria-label={t.customSlugLabel}
                            aria-pressed={isCustomSlug}
                            className={`w-11 h-6 cursor-pointer rounded-full relative transition-colors duration-300 focus:outline-none ${isCustomSlug ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-transform duration-300 shadow-sm ${isCustomSlug ? 'translate-x-5' : 'translate-x-0'}`} />
                        </Motion.button>
                    </div>

                    {/* Custom Slug Input — только grid-rows (без opacity), иначе мерцание фона; без transition-all на строке */}
                    <div
                        id={customSlugPanelId}
                        className={`grid transition-[grid-template-rows] duration-[420ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
                            isCustomSlug ? "grid-rows-[1fr]" : "grid-rows-[0fr] pointer-events-none"
                        }`}
                        aria-hidden={!isCustomSlug}
                    >
                        <div className="overflow-hidden transform-gpu min-h-0" inert={!isCustomSlug}>
                            <div className="pt-2 pb-6">
                                <div
                                    className={`flex items-center gap-3 bg-white/15 dark:bg-black/30 backdrop-blur-[30px] rounded-3xl p-2 border shadow-inner transition-[border-color,box-shadow,background-color] duration-200 ${
                                        errorField === 'slug'
                                            ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-red-500/5'
                                            : 'border-white/20 dark:border-white/5 border-t-white/30'
                                    }`}
                                >
                                    <span className="type-tech text-slate-400 dark:text-slate-500 pl-4 select-none">шорти.рф/</span>
                                    <input
                                        id={customSlugFieldId}
                                        name="custom_slug"
                                        ref={customSlugInputRef}
                                        type="text"
                                        maxLength="30"
                                        tabIndex={isCustomSlug ? 0 : -1}
                                        aria-label={t.customSlugLabel}
                                        placeholder={t.customSlugPlaceholder}
                                        className={TECH_INPUT_CLASS}
                                        value={customSlug}
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        spellCheck={false}
                                        onChange={(e) => {
                                            setCustomSlug(e.target.value);
                                            if(errorField === 'slug') setErrorField(null);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Motion.form>

                {/* Результат: капля при первом появлении; смена ссылки — тот же блок, key обновляет контент без анимации переворота. */}
                {shortUrl ? (
                    <Motion.div
                        layout={false}
                        key="shorten-success-anchor"
                        className="mt-4 sm:mt-6 w-full mx-auto"
                    >
                        <SuccessResultDropletShell
                            prefersReducedMotion={prefersReducedMotion}
                            skipEntrance={successRevealMode === "replace"}
                        >
                            <div className="relative w-full min-h-0">
                                <div
                                    key={shortUrl}
                                    className={`p-4 sm:p-8 bg-white/20 dark:bg-black/25 backdrop-blur-[30px] border border-white/40 dark:border-white/10 border-t-white/50 dark:border-t-white/5 rounded-3xl shadow-md dark:shadow-lg relative w-full overflow-hidden transform-gpu ring-1 ring-black/[0.04] dark:ring-white/[0.06] ${GLASS_HOVER_INTERACTIVE_CLASS}`}
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-50" />
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-8">
                                        <div className="flex flex-col w-full overflow-hidden">
                                            <span className="type-ui-input text-xs font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 mb-1">
                                                {t.success}
                                            </span>
                                            <span className="type-tech-strong text-blue-600 dark:text-blue-300 text-xl truncate selection:bg-blue-200 dark:selection:bg-blue-400/20">
                                                {shortUrl}
                                            </span>
                                        </div>
                                        <CardActions
                                            actions={[
                                                {
                                                    key: "qr",
                                                    whileTap: { scale: 0.92 },
                                                    onClick: () => setShowQR(!showQR),
                                                    ariaLabel: t.downloadQRBtn,
                                                    variant: showQR ? "active" : "default",
                                                    icon: <QrCode size={18} />
                                                },
                                                {
                                                    key: "copy",
                                                    whileTap: { scale: 0.95 },
                                                    onClick: () => copyToClipboard(),
                                                    ariaLabel: t.copyBtn,
                                                    title: t.copyBtn,
                                                    variant: isCopied ? "success" : "default",
                                                    icon: isCopied ? <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={18} />
                                                },
                                                {
                                                    key: "open",
                                                    type: "link",
                                                    whileTap: { scale: 0.92 },
                                                    href: `${window.location.protocol}//${shortUrl}`,
                                                    target: "_blank",
                                                    rel: "noreferrer",
                                                    ariaLabel: "Open short link",
                                                    className: BTN_GO,
                                                    icon: <ExternalLink size={18} />
                                                }
                                            ]}
                                            centered
                                        />
                                    </div>

                                    <AnimatePresence>
                                        {showQR && (
                                            <Motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.4, ease: MOTION_EASE_OUT_SMOOTH }}
                                                className="overflow-hidden flex flex-col items-center gap-4"
                                            >
                                                <div className="w-full border-t border-slate-200/80 dark:border-white/10 mt-5 pt-5 flex flex-col items-center gap-4">
                                                    <div className="p-3 bg-white rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                                                        <QRCodeCanvas
                                                            id="qr-code-canvas-main"
                                                            value={`${window.location.protocol}//${shortUrl}`}
                                                            size={160}
                                                            bgColor={"#ffffff"}
                                                            fgColor={"#0f172a"}
                                                            level={"Q"}
                                                            imageSettings={{
                                                                src: "/icon.svg",
                                                                x: undefined,
                                                                y: undefined,
                                                                height: 38,
                                                                width: 38,
                                                                excavate: true,
                                                            }}
                                                        />
                                                    </div>
                                                    <Motion.button
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => {
                                                            const ok = downloadCanvasAsJpg("qr-code-canvas-main", "shorty-qr.jpg", { quality: 0.96, scale: 4 });
                                                            if (!ok) toast.error(t.qrDownloadError);
                                                        }}
                                                        className="flex items-center gap-2 cursor-pointer text-sm type-ui-label text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                                    >
                                                        <Download size={16} />
                                                        {t.downloadQRBtn}
                                                    </Motion.button>
                                                </div>
                                            </Motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </SuccessResultDropletShell>
                    </Motion.div>
                ) : null}
                </LayoutGroup>
            </Motion.div>

            {/* Локальная История (Recent Links) */}
            <AnimatePresence>
                {recentLinks.length > 0 && (
                    <Motion.div
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.44,
                            ease: MOTION_EASE_OUT_SMOOTH,
                            layout: { duration: 0.4, ease: MOTION_EASE_OUT_SMOOTH },
                        }}
                        className="mt-8 mx-auto w-full"
                    >
                        <div className="flex flex-col items-center">
                            <Motion.button
                                whileTap={{
                                    scale: 0.95,
                                    y: 1,
                                    rotateX: 5,
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                                }}
                                whileHover={{
                                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                                    borderColor: "rgba(255, 255, 255, 0.4)",
                                    y: -1
                                }}
                                onClick={() => {
                                    const willOpen = !showHistory;
                                    setShowHistory(willOpen);
                                    if (willOpen) {
                                        setIsHistoryLoading(true);
                                        window.setTimeout(() => setIsHistoryLoading(false), 320);
                                    }
                                }}
                                className="cursor-pointer flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-[30px] border border-white/20 dark:border-white/10 border-t-white/30 dark:border-t-white/10 text-slate-500 dark:text-slate-300 transition-[color,background-color,border-color,box-shadow] duration-200 text-sm font-semibold shadow-lg overflow-hidden relative group perspective-1000"
                            >
                                <Motion.div
                                    animate={{ rotate: showHistory ? 180 : 0, scale: showHistory ? 1.1 : 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                    className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-500/10 text-slate-500 dark:text-slate-400"
                                >
                                    <ArrowRight size={14} className="rotate-90" />
                                </Motion.div>
                                <span className="relative z-10 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                                    {t.recentLinksTitle}
                                </span>

                                {/* Glass inner glow (hover only) */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-white/10 via-transparent to-white/5 transition-opacity duration-500 pointer-events-none" />
                            </Motion.button>

                            <AnimatePresence>
                                {showHistory && (
                                    <Motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{
                                            duration: 0.42,
                                            ease: MOTION_EASE_OUT_SMOOTH,
                                        }}
                                        className="overflow-hidden w-full"
                                    >
                                        <div className="px-1 sm:px-6 pt-4 pb-3">
                                        <div className="flex items-center justify-between mb-4 px-2">
                                            <span className="type-ui-input text-xs font-medium text-slate-400">
                                                {t.fiveLastLinks}
                                            </span>
                                            <Motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => {
                                                    clearHistory();
                                                    toast.success(t.clearSuccess);
                                                }}
                                                className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                                <span className="hidden sm:inline">{t.clearHistoryBtn}</span>
                                            </Motion.button>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            {isHistoryLoading
                                                ? Array.from({ length: Math.min(3, recentLinks.length) }).map((_, idx) => (
                                                    <div
                                                        key={`recent-skeleton-${idx}`}
                                                        className="rounded-2xl p-3 sm:p-4 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 animate-pulse"
                                                    >
                                                        <div className="h-4 w-44 bg-white/40 dark:bg-white/10 rounded mb-2" />
                                                        <div className="h-3 w-full bg-white/35 dark:bg-white/10 rounded" />
                                                    </div>
                                                ))
                                                : recentLinks.map((link, idx) => (
                                                    <RecentLinkItem
                                                        key={link.shortUrl + idx}
                                                        link={link}
                                                        idx={idx}
                                                        t={t}
                                                        isQrOpen={expandedRecentQrId === `${link.shortUrl}-${idx}`}
                                                        onToggleQr={() =>
                                                            setExpandedRecentQrId((prev) =>
                                                                prev === `${link.shortUrl}-${idx}` ? null : `${link.shortUrl}-${idx}`,
                                                            )
                                                        }
                                                    />
                                                ))}
                                        </div>
                                        </div>
                                    </Motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShortenForm;

