import React, { useState } from 'react';
import { Link2, Copy, CheckCircle2, Loader2, ArrowRight, ExternalLink } from 'lucide-react';
import { useLang } from '../LangContext';

const reservedWords = ['docs', 'redoc', 'openapi.json', 'short_url', 'api', 'admin', 'апи', 'админ'];

const validateSlug = (slugText) => {
    if (!slugText) return 'slugErrorLength';
    if (slugText.length < 6 || slugText.length > 30) return 'slugErrorLength';
    if (!/^[a-zA-Zа-яА-ЯёЁ0-9_-]+$/.test(slugText)) return 'slugErrorChars';
    if (reservedWords.includes(slugText.toLowerCase())) return 'slugErrorReserved';
    return '';
};

const ShortenForm = () => {
    const { t } = useLang();
    const [longUrl, setLongUrl] = useState('');
    const [shortUrl, setShortUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState('');
    
    // Custom Slug State
    const [isCustomSlug, setIsCustomSlug] = useState(false);
    const [customSlug, setCustomSlug] = useState('');
    const [slugError, setSlugError] = useState('');

    const handleShorten = async (e) => {
        e.preventDefault();
        if (!longUrl.trim()) {
            setError(t.errorEmpty);
            return;
        }

        setError('');
        setSlugError('');
        
        let payload = { long_url: longUrl.trim() };

        if (!/^https?:\/\//i.test(payload.long_url)) {
            payload.long_url = 'https://' + payload.long_url;
        }

        if (isCustomSlug) {
            const errCode = validateSlug(customSlug);
            if (errCode) {
                setSlugError(t[errCode]);
                return;
            }
            payload.slug = customSlug;
        }

        setIsLoading(true);
        setShortUrl('');

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
            setShortUrl(`${originHost}/${data.short_url}`);
        } catch (err) {
            if (err.message === t.slugErrorTaken) {
                setSlugError(err.message);
            } else {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        const el = document.createElement('textarea');
        el.value = shortUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);

        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleCustomSlugToggle = () => {
        setIsCustomSlug(!isCustomSlug);
        setSlugError('');
        if (isCustomSlug) {
            setCustomSlug(''); // Clear slug when disabling
        }
    };

    const handleSlugChange = (e) => {
        const value = e.target.value;
        setCustomSlug(value);
        if (slugError) {
            const errCode = validateSlug(value);
            setSlugError(errCode ? t[errCode] : '');
        }
    };

    return (
        <div className="w-full max-w-2xl relative z-10 mb-16 sm:mb-20 px-2 sm:px-0 mx-auto">
            <div className="glass-panel rounded-[2rem] p-4 sm:p-8 relative overflow-hidden transition-all duration-300 shadow-2xl">
                <form onSubmit={handleShorten} noValidate className="flex flex-col gap-4 relative z-10">
                    
                    <div className={`flex flex-col sm:flex-row items-center gap-3 sm:gap-2 glass-input rounded-3xl sm:rounded-full p-2 border transition-all shadow-inner ${error ? 'border-red-500/50 shadow-red-500/10' : 'border-white/5 focus-within:border-blue-500/30'}`}>
                        <div className="flex w-full sm:w-auto items-center flex-1 gap-2 sm:gap-3 pl-4 sm:pl-6 py-2 sm:py-0">
                            <Link2 size={24} className="text-blue-500 opacity-80 shrink-0" />
                            <input
                                type="url"
                                placeholder={t.placeholder}
                                className="flex-1 w-full bg-transparent py-2 focus:outline-none text-white text-sm sm:text-lg placeholder:text-slate-500 font-mono tracking-wide"
                                value={longUrl}
                                onChange={(e) => {
                                    setLongUrl(e.target.value);
                                    if (error) setError('');
                                }}
                            />
                        </div>
                        <button
                            disabled={isLoading}
                            className="w-full sm:w-auto glass-btn text-white font-display font-bold px-8 py-3.5 sm:py-0 sm:h-14 rounded-2xl sm:rounded-full transition-all flex items-center justify-center gap-2 group/btn active:scale-[0.97] shrink-0"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin text-slate-300" />
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
                        <label className="text-sm text-slate-400 font-medium cursor-pointer select-none" onClick={handleCustomSlugToggle}>
                            {t.customSlugLabel}
                        </label>
                        <button 
                            type="button"
                            onClick={handleCustomSlugToggle}
                            className={`w-11 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${isCustomSlug ? 'bg-blue-500' : 'bg-slate-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-transform duration-300 ${isCustomSlug ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Custom Slug Input (Smooth appearance) */}
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isCustomSlug ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className={`flex items-center gap-3 glass-input rounded-2xl p-2 border transition-all mt-1 ${slugError ? 'border-red-500/50 shadow-red-500/10' : 'border-white/5 focus-within:border-blue-500/30'}`}>
                            <span className="text-slate-500 pl-4 font-mono select-none">шорти.рф/</span>
                            <input
                                type="text"
                                maxLength="30"
                                placeholder={t.customSlugPlaceholder}
                                className="flex-1 w-full bg-transparent py-2 focus:outline-none text-blue-300 text-sm sm:text-lg placeholder:text-slate-600 font-mono tracking-wide"
                                value={customSlug}
                                onChange={handleSlugChange}
                            />
                        </div>
                    </div>
                </form>

                {slugError && isCustomSlug && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-lg">
                        <div className="bg-red-500/20 p-1.5 rounded-full shrink-0">
                            <span className="text-red-400 text-sm leading-none w-4 h-4 flex items-center justify-center font-bold">!</span>
                        </div>
                        {slugError}
                    </div>
                )}

                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-lg">
                        <div className="bg-red-500/20 p-1.5 rounded-full shrink-0">
                            <span className="text-red-400 text-lg leading-none w-4 h-4 flex items-center justify-center font-bold">!</span>
                        </div>
                        {error}
                    </div>
                )}

                {/* Результат */}
                {shortUrl && (
                    <div className="mt-8 p-6 bg-[#0A0A0E] border border-blue-500/30 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500" />
                        <div className="flex flex-col md:flex-row items-center justify-between gap-5 pl-2">
                            <div className="flex flex-col w-full overflow-hidden">
                                <span className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Success</span>
                                <span className="text-blue-300 font-mono text-xl truncate selection:bg-blue-400/20">
                                    {shortUrl}
                                </span>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto shrink-0">
                                <button
                                    onClick={copyToClipboard}
                                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl transition-all border font-medium ${isCopied
                                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                                        }`}
                                >
                                    {isCopied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                    {isCopied ? t.copiedBtn : t.copyBtn}
                                </button>
                                <a
                                    href={`${window.location.protocol}//${shortUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                >
                                    <ExternalLink size={20} />
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShortenForm;
