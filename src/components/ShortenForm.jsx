import React, { useState } from 'react';
import { Link2, Copy, CheckCircle2, Loader2, ArrowRight, ExternalLink, QrCode, Download, Trash2 } from 'lucide-react';
import { useLang } from '../LangContext';
import { useRecentLinks } from '../hooks/useRecentLinks';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { QRCodeCanvas } from 'qrcode.react';

const reservedWords = ['docs', 'redoc', 'openapi.json', 'short_url', 'api', 'admin', 'апи', 'админ'];

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

const RecentLinkItem = ({ link, t, idx, copyToClipboard }) => {
    const [showQR, setShowQR] = useState(false);
    // Делаем уникальный ID для каждого QR
    const qrCanvasId = `qr-recent-${idx}`;

    return (
        <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/60 dark:border-white/5 rounded-xl p-3 sm:p-4 flex flex-col hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors shadow-sm"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col overflow-hidden">
                    <span className="text-blue-600 dark:text-blue-400 font-mono text-sm sm:text-base font-semibold truncate">
                        {link.shortUrl}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-full">
                        {link.original}
                    </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                        onClick={() => setShowQR(!showQR)}
                        title="QR-Код"
                        className="p-2 cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-slate-600 dark:text-slate-300"
                    >
                        <QrCode size={14} />
                    </button>
                    <button
                        onClick={() => copyToClipboard(link.shortUrl)}
                        title={t.copyBtn}
                        className="p-2 cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-slate-600 dark:text-slate-300"
                    >
                        <Copy size={14} />
                    </button>
                    <a
                        href={`${window.location.protocol}//${link.shortUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Open Link"
                        className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                    >
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>

            {/* QR Code Expansion for Recent Link */}
            <AnimatePresence>
                {showQR && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-slate-200/50 dark:border-white/10 mt-3 pt-3 flex flex-col items-center gap-3"
                    >
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
                        <button 
                            onClick={() => downloadCanvasAsPNG(qrCanvasId, `shorty-qr-${idx}.png`)}
                            className="flex items-center gap-2 cursor-pointer text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                            <Download size={14} />
                            {t.downloadQRBtn}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const ShortenForm = () => {
    const { t } = useLang();
    const [longUrl, setLongUrl] = useState('');
    const [shortUrl, setShortUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    
    // Custom Slug State
    const [isCustomSlug, setIsCustomSlug] = useState(false);
    const [customSlug, setCustomSlug] = useState('');

    // History Hook
    const { recentLinks, addLink, clearHistory } = useRecentLinks();

    const handleShorten = async (e) => {
        e.preventDefault();
        if (!longUrl.trim()) {
            toast.error(t.errorEmpty);
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
                return;
            }
            payload.slug = customSlug;
        }

        setIsLoading(true);
        setShortUrl('');
        setShowQR(false);

        try {
            const response = await fetch('/short_url/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ payload }),
            });

            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error(t.slugErrorTaken);
                }

                const errData = await response.json();
                let errorMessage = t.errorGeneric;
                
                if (errData.detail) {
                    if (Array.isArray(errData.detail)) {
                        errorMessage = errData.detail[0].msg;
                        if (errorMessage.includes("URL") || errorMessage.includes("url")) {
                            errorMessage = t.errorEmpty;
                        }
                    } else {
                        errorMessage = errData.detail;
                    }
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
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
            toast.error(err.message);
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
        <div className="w-full max-w-2xl relative z-10 mb-16 sm:mb-20 px-2 sm:px-0 mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-[40px] border border-white/50 dark:border-white/10 shadow-[0_24px_60px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_24px_60px_-10px_rgba(0,0,0,0.5)] rounded-[2rem] p-4 sm:p-8 relative overflow-hidden transition-all duration-300"
            >
                <form onSubmit={handleShorten} noValidate className="flex flex-col gap-4 relative z-10">
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2 bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-3xl sm:rounded-full p-2 border border-slate-200 dark:border-white/5 focus-within:border-blue-400 dark:focus-within:border-blue-500/30 transition-all shadow-[inset_0_2px_15px_rgba(0,0,0,0.05)] dark:shadow-inner">
                        <div className="flex w-full sm:w-auto items-center flex-1 gap-2 sm:gap-3 pl-4 sm:pl-6 py-2 sm:py-0">
                            <Link2 size={24} className="text-blue-500 opacity-80 shrink-0" />
                            <input
                                type="url"
                                placeholder={t.placeholder}
                                aria-label={t.placeholder}
                                className="flex-1 w-full bg-transparent py-2 focus:outline-none text-slate-800 dark:text-white text-sm sm:text-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono tracking-wide"
                                value={longUrl}
                                onChange={(e) => setLongUrl(e.target.value)}
                            />
                        </div>
                        <button
                            disabled={isLoading}
                            aria-label={t.shortenBtn}
                            className="w-full sm:w-auto cursor-pointer bg-gradient-to-b from-blue-500/90 to-blue-600/90 dark:from-blue-600/20 dark:to-blue-600/10 backdrop-blur-md border border-blue-500/30 text-white font-display font-bold px-8 py-3.5 sm:py-0 sm:h-14 rounded-2xl sm:rounded-full transition-all flex items-center justify-center gap-2 group/btn active:scale-[0.97] shrink-0 shadow-md dark:shadow-[0_0_20px_rgba(37,99,235,0.1)] hover:from-blue-500 hover:to-blue-600 dark:hover:from-blue-600/30 dark:hover:to-blue-600/15"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin text-white/70" />
                            ) : (
                                <>
                                    {t.shortenBtn}
                                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Checkbox for custom link */}
                    <div className="flex items-center justify-end w-full px-4 gap-3">
                        <span id="custom-slug-label" className="text-sm text-slate-600 dark:text-slate-400 font-medium cursor-pointer select-none transition-colors" onClick={handleCustomSlugToggle}>
                            {t.customSlugLabel}
                        </span>
                        <button 
                            type="button"
                            onClick={handleCustomSlugToggle}
                            aria-labelledby="custom-slug-label"
                            aria-pressed={isCustomSlug}
                            className={`w-11 h-6 cursor-pointer rounded-full relative transition-colors duration-300 focus:outline-none ${isCustomSlug ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-transform duration-300 shadow-sm ${isCustomSlug ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Custom Slug Input */}
                    <AnimatePresence>
                        {isCustomSlug && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-center gap-3 bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl p-2 border border-slate-200 dark:border-white/5 focus-within:border-blue-400 dark:focus-within:border-blue-500/30 transition-all mt-1 shadow-[inset_0_2px_15px_rgba(0,0,0,0.02)] dark:shadow-inner">
                                    <span className="text-slate-400 dark:text-slate-500 pl-4 font-mono select-none">шорти.рф/</span>
                                    <input
                                        type="text"
                                        maxLength="30"
                                        aria-label={t.customSlugLabel}
                                        placeholder={t.customSlugPlaceholder}
                                        className="flex-1 w-full bg-transparent py-2 focus:outline-none text-blue-600 dark:text-blue-300 text-sm sm:text-lg placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono tracking-wide"
                                        value={customSlug}
                                        onChange={(e) => setCustomSlug(e.target.value)}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>

                {/* Результат */}
                <AnimatePresence>
                    {shortUrl && (
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="mt-8 p-6 bg-slate-50 dark:bg-[#0A0A0E] border border-blue-200 dark:border-blue-500/30 rounded-2xl shadow-sm dark:shadow-[0_0_30px_rgba(37,99,235,0.1)] relative overflow-hidden transition-colors"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500" />
                            <div className="flex flex-col md:flex-row items-center justify-between gap-5 pl-2">
                                <div className="flex flex-col w-full overflow-hidden">
                                    <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-1 uppercase tracking-wider">Success</span>
                                    <span className="text-blue-600 dark:text-blue-300 font-mono text-xl truncate selection:bg-blue-200 dark:selection:bg-blue-400/20">
                                        {shortUrl}
                                    </span>
                                </div>
                                <div className="flex gap-2 full md:w-auto shrink-0 flex-wrap">
                                    <button
                                        onClick={() => setShowQR(!showQR)}
                                        aria-label={t.downloadQRBtn}
                                        className="flex-1 md:flex-none cursor-pointer flex items-center justify-center p-2.5 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl transition-all"
                                    >
                                        <QrCode size={20} />
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard()}
                                        className={`flex-1 md:flex-none cursor-pointer flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl transition-all border font-medium ${isCopied
                                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200'
                                            }`}
                                    >
                                        {isCopied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                        <span className="hidden sm:inline">{isCopied ? t.copiedBtn : t.copyBtn}</span>
                                    </button>
                                    <a
                                        href={`${window.location.protocol}//${shortUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label="Open short link"
                                        className="flex items-center justify-center p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-[0_4px_10px_rgba(37,99,235,0.2)] dark:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                    >
                                        <ExternalLink size={20} />
                                    </a>
                                </div>
                            </div>

                            {/* QR Code Expansion */}
                            <AnimatePresence>
                                {showQR && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden border-t border-slate-200 dark:border-white/10 mt-5 pt-5 flex flex-col items-center gap-4"
                                    >
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
                                        <button 
                                            onClick={() => downloadCanvasAsPNG("qr-code-canvas-main", "shorty-qr.png")}
                                            className="flex items-center gap-2 cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                        >
                                            <Download size={16} />
                                            {t.downloadQRBtn}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Локальная История (Recent Links) */}
            <AnimatePresence>
                {recentLinks.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 mx-2 sm:mx-6"
                    >
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {t.recentLinksTitle}
                            </h3>
                            <button 
                                onClick={() => {
                                    clearHistory();
                                    toast.success(t.clearSuccess);
                                }}
                                className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={14} />
                                <span className="hidden sm:inline">{t.clearHistoryBtn}</span>
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            {recentLinks.map((link, idx) => (
                                <RecentLinkItem 
                                    key={link.shortUrl + idx} 
                                    link={link} 
                                    idx={idx} 
                                    t={t} 
                                    copyToClipboard={copyToClipboard} 
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShortenForm;
