import React, { useState, memo } from 'react';
import { Link2, Copy, CheckCircle2, Loader2, ArrowRight, ExternalLink, QrCode, Download, Trash2 } from 'lucide-react';
import { useLang } from '../LangContext';
import { useRecentLinks } from '../hooks/useRecentLinks';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { QRCodeCanvas } from 'qrcode.react';
import { ApiError, apiPostJson } from '../lib/api';

const reservedWords = [
    'docs', 'redoc', 'openapi.json', 'short_url', 'auth', 'me', 'api', 'admin',
    'health', 'metrics', 'graphql', 'ws',
    'login', 'register', 'profile', 'placeholder', 'profile-placeholder',
    'favicon.ico', 'favicon', 'robots.txt', 'robots', 'sitemap.xml', 'sitemap',
    'manifest.webmanifest', 'manifest', 'assets', 'static', 'public',
    'img', 'images', 'fonts', 'css', 'js', 'uploads', 'media',
    'about', 'contact', 'privacy', 'terms', 'support', 'help', 'status',
    'dashboard', 'settings', 'shorty',
    'апи', 'админ', 'доки', 'вход', 'регистрация', 'профиль', 'настройки',
];

const validateSlug = (slugText) => {
    if (!slugText) return 'slugErrorLength';
    if (slugText.length < 6 || slugText.length > 30) return 'slugErrorLength';
    if (!/^[a-zA-Zа-яА-ЯёЁ0-9_-]+$/.test(slugText)) return 'slugErrorChars';
    if (reservedWords.includes(slugText.toLowerCase())) return 'slugErrorReserved';
    return '';
};

// Вспомогательная функция для легитимного скачивания (добавляет ссылку в DOM для обхода блокировок)
const downloadCanvasAsPNG = (canvasId, defaultFileName) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        toast.error("Ошибка: QR-Код не найден");
        return;
    }
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.download = defaultFileName;
    downloadLink.href = pngUrl;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};

const RecentLinkItem = memo(({ link, t, idx }) => {
    const [showQR, setShowQR] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    // Делаем уникальный ID для каждого QR
    const qrCanvasId = `qr-recent-${idx}`;

    const handleCopy = () => {
        const el = document.createElement('textarea');
        el.value = link.shortUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);

        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast.success(t.copySuccess);
    };

    return (
        <Motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group bg-white/15 dark:bg-white/5 backdrop-blur-[25px] border border-white/20 dark:border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col hover:bg-white/25 dark:hover:bg-white/10 transition-all duration-300 shadow-md"
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col overflow-hidden">
                    <span className="text-blue-600 dark:text-blue-400 font-mono text-xs sm:text-base font-bold truncate">
                        {link.shortUrl}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-[280px] sm:max-w-md">
                        {link.original}
                    </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowQR(!showQR)}
                        className="cursor-pointer flex items-center justify-center w-10 h-10 bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-slate-600 dark:text-slate-300"
                    >
                        <QrCode size={18} />
                    </Motion.button>
                    <Motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={handleCopy}
                        title={t.copyBtn}
                        className="cursor-pointer flex items-center justify-center w-10 h-10 bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-slate-600 dark:text-slate-300"
                    >
                        {isCopied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                    </Motion.button>
                    <Motion.a
                        whileTap={{ scale: 0.92 }}
                        href={`${window.location.protocol}//${link.shortUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Open Link"
                        className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-[0_4px_10px_rgba(37,99,235,0.2)] dark:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    >
                        <ExternalLink size={18} />
                    </Motion.a>
                </div>
            </div>

            {/* QR Code Expansion for Recent Link */}
            <AnimatePresence>
                {showQR && (
                    <Motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
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
                                onClick={() => downloadCanvasAsPNG(qrCanvasId, `shorty-qr-${idx}.png`)}
                                className="flex items-center gap-2 cursor-pointer text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
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

const ShortenForm = () => {
    const { t } = useLang();
    const [longUrl, setLongUrl] = useState('');
    const [shortUrl, setShortUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [errorField, setErrorField] = useState(null); // 'long_url' | 'slug' | null

    // Custom Slug State
    const [isCustomSlug, setIsCustomSlug] = useState(false);
    const [customSlug, setCustomSlug] = useState('');

    // History Hook
    const { recentLinks, addLink, clearHistory } = useRecentLinks();

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
        setShortUrl('');
        setShowQR(false);

        try {
            const data = await apiPostJson('/short_url/', payload);
            let originHost = window.location.host;
            originHost = originHost.replace('xn--h1algi1a.xn--p1ai', 'шорти.рф');
            const generatedUrl = `${originHost}/${data.short_url}`;
            setShortUrl(generatedUrl);
            toast.success("Готово!", { description: 'Ссылка успешно сокращена.' });

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

    const copyToClipboard = (textToCopy = shortUrl) => {
        const el = document.createElement('textarea');
        el.value = textToCopy;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);

        if (textToCopy === shortUrl) {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
        toast.success(t.copySuccess);
    };

    const handleCustomSlugToggle = () => {
        setIsCustomSlug(!isCustomSlug);
        if (isCustomSlug) {
            setCustomSlug('');
        }
    };

    return (
        <div className="w-full max-w-2xl relative z-10 mb-4 sm:mb-20 px-2 sm:px-0 mx-auto">
            <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.5,
                    layout: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
                }}
                className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-[40px] transform-gpu border border-white/50 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-3xl p-4 sm:p-8 relative overflow-hidden transition-shadow duration-300"
            >
                <Motion.form onSubmit={handleShorten} noValidate className="flex flex-col relative z-10">

                    <div className={`flex flex-col sm:flex-row items-center gap-3 sm:gap-2 bg-white/20 dark:bg-black/30 backdrop-blur-[30px] rounded-3xl p-2 border transition-all shadow-[inset_0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_2px_10px_0_rgba(255,255,255,0.05)] mb-8 ${
                        errorField === 'long_url' 
                        ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-red-500/5' 
                        : 'border-white/30 dark:border-white/10 border-t-white/40 dark:border-t-white/10 focus-within:border-blue-400 dark:focus-within:border-blue-500/30'
                    }`}>
                        <div className="flex w-full sm:w-auto items-center flex-1 gap-2 sm:gap-4 pl-4 sm:pl-8 py-2 sm:py-0">
                            <Link2 size={22} className={`${errorField === 'long_url' ? 'text-red-400' : 'text-blue-500'} opacity-90 shrink-0`} />
                            <input
                                type="url"
                                placeholder={t.placeholder}
                                aria-label={t.placeholder}
                                className="flex-1 w-full bg-transparent py-3 focus:outline-none text-slate-800 dark:text-white text-[14px] sm:text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono tracking-normal"
                                value={longUrl}
                                onChange={(e) => {
                                    setLongUrl(e.target.value);
                                    if(errorField === 'long_url') setErrorField(null);
                                }}
                            />
                        </div>
                        <Motion.button
                            whileTap={{ scale: 0.96 }}
                            whileHover={{ scale: 1.02 }}
                            disabled={isLoading}
                            aria-label={t.shortenBtn}
                            className="w-full sm:w-auto cursor-pointer bg-blue-500/15 dark:bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 dark:border-blue-400/40 border-t-blue-400/20 dark:border-t-white/20 text-blue-600 dark:text-white font-display font-black px-8 py-4 sm:py-0 sm:h-14 rounded-3xl sm:rounded-full transition-all flex items-center justify-center gap-2 group/btn active:scale-[0.97] shrink-0 shadow-xl dark:shadow-[0_0_25px_rgba(37,99,235,0.15)] overflow-hidden relative"
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
                        </Motion.button>
                    </div>

                    {/* Checkbox for custom link */}
                    <div className="flex items-center justify-end w-full px-4 gap-3 mb-2">
                        <span id="custom-slug-label" className="text-sm text-slate-600 dark:text-slate-400 font-medium cursor-pointer select-none transition-colors" onClick={handleCustomSlugToggle}>
                            {t.customSlugLabel}
                        </span>
                        <Motion.button
                            whileTap={{ scale: 0.92 }}
                            type="button"
                            onClick={handleCustomSlugToggle}
                            aria-labelledby="custom-slug-label"
                            aria-pressed={isCustomSlug}
                            className={`w-11 h-6 cursor-pointer rounded-full relative transition-colors duration-300 focus:outline-none ${isCustomSlug ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-transform duration-300 shadow-sm ${isCustomSlug ? 'translate-x-5' : 'translate-x-0'}`} />
                        </Motion.button>
                    </div>

                    {/* Custom Slug Input */}
                    <AnimatePresence>
                        {isCustomSlug && (
                            <Motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                className="overflow-hidden transform-gpu"
                            >
                                <div className="pt-2 pb-6">
                                    <div className={`flex items-center gap-3 bg-white/15 dark:bg-black/30 backdrop-blur-[30px] rounded-3xl p-2 border transition-all shadow-inner ${
                                        errorField === 'slug' 
                                        ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-red-500/5' 
                                        : 'border-white/20 dark:border-white/5 border-t-white/30'
                                    }`}>
                                        <span className="text-slate-400 dark:text-slate-500 pl-4 font-mono select-none">шорти.рф/</span>
                                        <input
                                            type="text"
                                            maxLength="30"
                                            aria-label={t.customSlugLabel}
                                            placeholder={t.customSlugPlaceholder}
                                            className="flex-1 w-full bg-transparent py-3 focus:outline-none text-blue-600 dark:text-blue-300 text-base sm:text-lg placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono tracking-wider"
                                            value={customSlug}
                                            onChange={(e) => {
                                                setCustomSlug(e.target.value);
                                                if(errorField === 'slug') setErrorField(null);
                                            }}
                                        />
                                    </div>
                                </div>
                            </Motion.div>
                        )}
                    </AnimatePresence>
                </Motion.form>

                {/* Результат */}
                <AnimatePresence>
                    {shortUrl && (
                        <Motion.div 
                            initial={{ y: 30, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            className="mt-4 sm:mt-10 p-4 sm:p-8 bg-white/15 dark:bg-white/5 backdrop-blur-[25px] border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-50" />
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex flex-col w-full overflow-hidden">
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{t.success}</span>
                                    <span className="text-blue-600 dark:text-blue-300 font-mono text-xl truncate selection:bg-blue-200 dark:selection:bg-blue-400/20">
                                        {shortUrl}
                                    </span>
                                </div>
                                <div className="flex gap-2 full md:w-auto shrink-0 flex-wrap">
                                    <Motion.button
                                        whileTap={{ scale: 0.92 }}
                                        onClick={() => setShowQR(!showQR)}
                                        aria-label={t.downloadQRBtn}
                                        className="flex-1 md:flex-none cursor-pointer flex items-center justify-center w-10 h-10 bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-slate-600 dark:text-slate-300"
                                    >
                                        <QrCode size={18} />
                                    </Motion.button>
                                    <Motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => copyToClipboard()}
                                        aria-label={t.copyBtn}
                                        title={t.copyBtn}
                                        className="flex-1 md:flex-none cursor-pointer flex items-center justify-center w-10 h-10 bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-slate-600 dark:text-slate-300"
                                    >
                                        {isCopied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                    </Motion.button>
                                    <Motion.a
                                        whileTap={{ scale: 0.92 }}
                                        href={`${window.location.protocol}//${shortUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label="Open short link"
                                        className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-[0_4px_10px_rgba(37,99,235,0.2)] dark:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                    >
                                        <ExternalLink size={18} />
                                    </Motion.a>
                                </div>
                            </div>

                            {/* QR Code Expansion */}
                            <AnimatePresence>
                                {showQR && (
                                    <Motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                        className="overflow-hidden flex flex-col items-center gap-4"
                                    >
                                        <div className="w-full border-t border-slate-200 dark:border-white/10 mt-5 pt-5 flex flex-col items-center gap-4">
                                            <div className="p-3 bg-white rounded-xl shadow-sm">
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
                                                onClick={() => downloadCanvasAsPNG("qr-code-canvas-main", "shorty-qr.png")}
                                                className="flex items-center gap-2 cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                            >
                                                <Download size={16} />
                                                {t.downloadQRBtn}
                                            </Motion.button>
                                        </div>
                                    </Motion.div>
                                )}
                            </AnimatePresence>
                        </Motion.div>

                    )}
                </AnimatePresence>
            </Motion.div>

            {/* Локальная История (Recent Links) */}
            <AnimatePresence>
                {recentLinks.length > 0 && (
                    <Motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
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
                                onClick={() => setShowHistory(!showHistory)}
                                className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-[30px] border border-white/20 dark:border-white/10 border-t-white/30 dark:border-t-white/10 text-slate-500 dark:text-slate-300 transition-all text-sm font-semibold shadow-lg overflow-hidden relative group perspective-1000"
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
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-white/10 via-transparent to-white/5 transition-opacity duration-500" />
                            </Motion.button>

                            <AnimatePresence>
                                {showHistory && (
                                    <Motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                        className="overflow-hidden w-full"
                                    >
                                        <div className="px-1 sm:px-6 pt-4 pb-3">
                                        <div className="flex items-center justify-between mb-4 px-2">
                                            <span className="text-xs font-medium text-slate-400">
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
                                            {recentLinks.map((link, idx) => (
                                                <RecentLinkItem
                                                    key={link.shortUrl + idx}
                                                    link={link}
                                                    idx={idx}
                                                    t={t}
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

