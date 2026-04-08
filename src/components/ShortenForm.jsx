import React, { useState, useEffect } from 'react';
import { Link2, ExternalLink, Copy, CheckCircle2, Loader2, Zap, ArrowRight, Globe } from 'lucide-react';
import { translations } from '../App.jsx';

const reservedWords = ['docs','redoc','openapi.json','short_url','api','admin','апи','админ'];
const slugRegex = /^[a-zA-Zа-яА-ЯёЁ0-9_-]+$/;

const ShortenForm = () => {
  const lang = 'en'; // placeholder, will be overridden by HeaderWrapper
  const t = translations[lang];
  const [longUrl, setLongUrl] = useState('');
  const [slugEnabled, setSlugEnabled] = useState(false);
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');

  const validateSlug = (value) => {
    if (value.length < 6) return 'Слишком короткий слог (мин 6)';
    if (!slugRegex.test(value)) return 'Недопустимые символы';
    if (reservedWords.includes(value.toLowerCase())) return 'Запрещённое слово';
    return '';
  };

  const handleSlugChange = (e) => {
    const val = e.target.value;
    setSlug(val);
    setSlugError(validateSlug(val));
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!longUrl.trim()) { setError(t.errorEmpty); return; }
    if (slugEnabled && slugError) { setError(slugError); return; }
    setIsLoading(true);
    setError('');
    setShortUrl('');
    let url = longUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    const payload = { long_url: url };
    if (slugEnabled) payload.slug = slug;
    try {
      const response = await fetch('/short_url/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload })
      });
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Этот адрес уже занят');
        }
        const errData = await response.json();
        let errMsg = t.errorGeneric;
        if (errData.detail) {
          if (Array.isArray(errData.detail)) errMsg = errData.detail[0].msg;
          else errMsg = errData.detail;
        }
        throw new Error(errMsg);
      }
      const data = await response.json();
      let originHost = window.location.host;
      originHost = originHost.replace('xn--h1algi1a.xn--p1ai', 'шорти.рф');
      setShortUrl(`${originHost}/${data.short_url}`);
    } catch (err) {
      setError(err.message);
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

  return (
    <div className="w-full max-w-2xl relative z-10 mb-16 sm:mb-20 px-2 sm:px-0">
      <div className="glass-panel rounded-[2rem] p-4 sm:p-8 relative overflow-hidden transition-all duration-300 shadow-2xl">
        <form onSubmit={handleShorten} noValidate className={`flex flex-col sm:flex-row items-center gap-3 sm:gap-2 relative z-10 glass-input rounded-3xl sm:rounded-full p-2 border transition-all shadow-inner ${error ? 'border-red-500/50 shadow-red-500/10' : 'border-white/5 focus-within:border-blue-500/30'}`}>
          <div className="flex w-full sm:w-auto items-center flex-1 gap-2 sm:gap-3 pl-4 sm:pl-6 py-2 sm:py-0">
            <Link2 size={24} className="text-blue-500 opacity-80 shrink-0" />
            <input
              type="url"
              placeholder={t.placeholder}
              className="flex-1 w-full bg-transparent py-2 focus:outline-none text-white text-sm sm:text-lg placeholder:text-slate-500 font-mono tracking-wide"
              value={longUrl}
              onChange={(e) => { setLongUrl(e.target.value); if (error) setError(''); }}
            />
          </div>
          {/* Custom slug toggle */}
          <div className="flex items-center ml-2">
            <label className="flex items-center cursor-pointer text-sm text-slate-400 mr-2">
              <input type="checkbox" checked={slugEnabled} onChange={() => setSlugEnabled(!slugEnabled)} className="mr-1" />
              Своя ссылка
            </label>
          </div>
          {/* Slug input */}
          {slugEnabled && (
            <input
              type="text"
              placeholder="мой-слаг"
              maxLength={30}
              className={`flex-1 w-full bg-transparent py-2 focus:outline-none text-white text-sm sm:text-lg placeholder:text-slate-500 font-mono tracking-wide border-b ${slugError ? 'border-red-500' : 'border-white'} transition-all duration-300`}
              value={slug}
              onChange={handleSlugChange}
            />
          )}
          <button disabled={isLoading} className="w-full sm:w-auto glass-btn text-white font-display font-bold px-8 py-3.5 sm:py-0 sm:h-14 rounded-2xl sm:rounded-full transition-all flex items-center justify-center gap-2 group/btn active:scale-[0.97] shrink-0">
            {isLoading ? <Loader2 className="animate-spin text-slate-300" /> : <><span>{t.shortenBtn}</span><ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" /></>}
          </button>
        </form>
        {/* Result */}
        {shortUrl && (
          <div className="mt-8 p-6 bg-[#0A0A0E] border border-blue-500/30 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-5 pl-2">
              <div className="flex flex-col w-full">
                <span className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Success</span>
                <span className="text-blue-300 font-mono text-xl truncate selection:bg-blue-400/20">{shortUrl}</span>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button onClick={copyToClipboard} className={`flex-1 md:flex-none flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl transition-all border font-medium ${isCopied ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'}`}>
                  {isCopied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  {isCopied ? t.copiedBtn : t.copyBtn}
                </button>
                <a href={`${window.location.protocol}//${shortUrl}`} target="_blank" rel="noreferrer" className="flex items-center justify-center p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                  <ExternalLink size={20} />
                </a>
              </div>
            </div>
          </div>
        )}
        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-lg">
            <div className="bg-red-500/20 p-1.5 rounded-full shrink-0"><span className="text-red-400 text-lg leading-none w-4 h-4 flex items-center justify-center font-bold">!</span></div>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortenForm;
