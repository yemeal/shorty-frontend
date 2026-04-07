import React, { useState, useEffect } from 'react';
import {
  Link2,
  ExternalLink,
  Copy,
  CheckCircle2,
  Loader2,
  Zap,
  ArrowRight,
  Globe
} from 'lucide-react';

const translations = {
  en: {
    brand: "шорти.рф",
    title1: "Make links",
    title2: "shorter and elegant",
    subtitle: "A free, open-source URL shortening service. No ads, just pure functionality.",
    placeholder: "Paste your long link here...",
    shortenBtn: "Shorten",
    copyBtn: "Copy",
    copiedBtn: "Copied!",
    errorEmpty: "Please enter a valid URL",
    errorGeneric: "Something went wrong",
    feat1Title: "Speed",
    feat1Desc: "Generate links in milliseconds",
    feat2Title: "Reliability",
    feat2Desc: "Your data is completely safe",
    feat3Title: "Open Source",
    feat3Desc: "Code is fully open on GitHub",
    footer: "шорти.рф — Made with passion"
  },
  ru: {
    brand: "шорти.рф",
    title1: "Делай ссылки",
    title2: "короче и красивее",
    subtitle: "Бесплатный сервис сокращения ссылок с открытым исходным кодом. Никакой рекламы, только чистый функционал.",
    placeholder: "Вставь длинную ссылку сюда...",
    shortenBtn: "Сократить",
    copyBtn: "Копировать",
    copiedBtn: "Готово",
    errorEmpty: "Пожалуйста, введите URL-адрес",
    errorGeneric: "Что-то пошло не так",
    feat1Title: "Быстрота",
    feat1Desc: "Генерация ссылки за миллисекунды",
    feat2Title: "Надежность",
    feat2Desc: "Ваши данные в полной безопасности",
    feat3Title: "Open Source",
    feat3Desc: "Код полностью открыт на GitHub",
    footer: "шорти.рф — Сделано с кайфом"
  }
};

const App = () => {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Язык
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('shorty-lang');
    if (savedLang && (savedLang === 'ru' || savedLang === 'en')) {
      setLang(savedLang);
    } else {
      const browserLang = navigator.language.startsWith('ru') ? 'ru' : 'en';
      setLang(browserLang);
    }
  }, []);

  const toggleLang = () => {
    const next = lang === 'en' ? 'ru' : 'en';
    setLang(next);
    localStorage.setItem('shorty-lang', next);
  };

  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!longUrl.trim()) {
      setError(t.errorEmpty);
      return;
    }

    setIsLoading(true);
    setError('');
    setShortUrl('');

    // Автоматически добавляем https:// если пользователь не ввёл протокол
    let url = longUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    try {
      const response = await fetch('/short_url/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: { long_url: url } }),
      });

      if (!response.ok) {
        const errData = await response.json();

        let errorMessage = t.errorGeneric;
        if (errData.detail) {
          if (Array.isArray(errData.detail)) {
            // Умный парсинг ошибок FastAPI (например: String should match pattern / URL scheme)
            errorMessage = errData.detail[0].msg;
            if (errorMessage.includes("URL") || errorMessage.includes("url")) {
              errorMessage = t.errorEmpty; // Заменяем на человекочитаемую ошибку
            }
          } else {
            errorMessage = errData.detail;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      let originHost = window.location.host;
      // IDN: заменяем punycode на красивый кириллический домен
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
    <div className="min-h-screen text-slate-200 font-sans selection:bg-blue-500/30 relative overflow-hidden">

      {/* Liquid Glass Background Elements */}
      {/* Центральное пятно сверху, чтобы на десктопе под пилюлей тоже был свет для преломления */}
      <div className="fixed top-[-20%] sm:top-[-15%] left-[50%] -translate-x-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[400px] rounded-[100%] bg-blue-500/20 blur-[100px] sm:blur-[140px] pointer-events-none z-0 animate-float-delayed" />
      
      <div className="fixed top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-blue-600/30 blur-[100px] sm:blur-[130px] pointer-events-none z-0 animate-float" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-purple-600/20 blur-[120px] sm:blur-[150px] pointer-events-none z-0 animate-float-delayed" />
      <div className="fixed top-[30%] left-[40%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-indigo-500/20 blur-[90px] sm:blur-[120px] pointer-events-none z-0 animate-float" />

      {/* Навигация "Glass Pill" (Постоянная) */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 sm:pt-6">
        <nav className="flex justify-between items-center mx-auto glass-panel py-2.5 px-5 sm:px-6 rounded-full w-[95%] max-w-3xl border-white/10">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer bg-slate-900 py-1.5 px-3 sm:px-4 rounded-full border border-white/5 shadow-md">
            <div className="relative flex items-center justify-center transition-all duration-500 h-7 w-7 sm:h-9 sm:w-9">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
              <div className="relative bg-blue-600 shadow-inner shadow-white/20 p-1 rounded-full z-10 w-full h-full flex items-center justify-center border border-white/10">
                <Zap size={16} className="text-white group-hover:rotate-12 transition-transform duration-300" strokeWidth={2.5} />
              </div>
            </div>
            <span className="font-display font-bold tracking-tight text-white pr-1 text-base sm:text-lg">
              {t.brand}
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={toggleLang}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-95 border border-white/5 py-2 px-3 sm:px-4 rounded-full transition-all font-medium text-xs sm:text-sm text-slate-300 hover:text-white shadow-md z-10"
            >
              <Globe size={14} className="text-blue-400" />
              {lang.toUpperCase()}
            </button>
            <a
              href="https://github.com/yemeal/shorty-backend"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center bg-[#0F1C36] hover:bg-[#162A51] hover:scale-105 active:scale-95 border border-blue-500/20 py-2 px-5 rounded-full transition-all font-medium text-sm text-blue-400 hover:text-blue-300 hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] shadow-md z-10"
            >
              <span className="font-bold mr-1.5 drop-shadow-lg">★</span>
              GitHub
            </a>
          </div>
        </nav>
      </div>

      {/* Основной контент */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-12 flex flex-col items-center">

        <div className="text-center space-y-4 sm:space-y-6 mb-10 sm:mb-14 relative z-10">
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            {t.title1} <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-lg">
              {t.title2}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed px-4">
            {t.subtitle}
          </p>
        </div>

        {/* Форма / Карточка ввода */}
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
            </form>

            {/* Результат */}
            {shortUrl && (
              <div className="mt-8 p-6 bg-[#0A0A0E] border border-blue-500/30 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.1)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-5 pl-2">
                  <div className="flex flex-col w-full">
                    <span className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Success</span>
                    <span className="text-blue-300 font-mono text-xl truncate selection:bg-blue-400/20">
                      {shortUrl}
                    </span>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
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

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-lg">
                <div className="bg-red-500/20 p-1.5 rounded-full shrink-0">
                  <span className="text-red-400 text-lg leading-none w-4 h-4 flex items-center justify-center font-bold">!</span>
                </div>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Статистика / Фичи */}
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl pt-10 border-t border-white/5 relative z-10">
          {[
            { title: t.feat1Title, desc: t.feat1Desc, icon: <Zap size={20} className="text-blue-400" /> },
            { title: t.feat2Title, desc: t.feat2Desc, icon: <CheckCircle2 size={20} className="text-purple-400" /> },
            { title: t.feat3Title, desc: t.feat3Desc, icon: <Globe size={20} className="text-indigo-400" /> }
          ].map((item, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-white/5 group-hover:border-white/20 transition-colors">
                {item.icon}
              </div>
              <h3 className="font-display font-bold text-white mb-2 text-lg">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-8 text-center text-slate-500 text-sm relative z-10 font-mono">
        &copy; {new Date().getFullYear()} {t.footer}
      </footer>
    </div>
  );
};

export default App;