import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import ShortenForm from './components/ShortenForm.jsx';
import { translations } from './App.jsx';

const HomePage = () => {
  const [lang, setLang] = useState('en');
  useEffect(() => {
    const saved = localStorage.getItem('shorty-lang');
    if (saved && (saved === 'ru' || saved === 'en')) setLang(saved);
    else setLang(navigator.language.startsWith('ru') ? 'ru' : 'en');
  }, []);
  const toggleLang = () => {
    const next = lang === 'en' ? 'ru' : 'en';
    setLang(next);
    localStorage.setItem('shorty-lang', next);
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {/* Background elements (same as in App) */}
      <div className="fixed top-[-20%] sm:top-[-15%] left-[50%] -translate-x-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[400px] rounded-[100%] bg-blue-500/20 blur-[100px] sm:blur-[140px] pointer-events-none z-0 animate-float-delayed" />
      <div className="fixed top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-blue-600/30 blur-[100px] sm:blur-[130px] pointer-events-none z-0 animate-float" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-purple-600/20 blur-[120px] sm:blur-[150px] pointer-events-none z-0 animate-float-delayed" />
      <div className="fixed top-[30%] left-[40%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-indigo-500/20 blur-[90px] sm:blur-[120px] pointer-events-none z-0 animate-float" />

      {/* Header */}
      <Header lang={lang} toggleLang={toggleLang} />

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-12 flex flex-col items-center">
        <section className="text-center space-y-4 sm:space-y-6 mb-10 sm:mb-14 relative z-10">
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            {/* Title will be handled inside ShortenForm via translations */}
          </h1>
        </section>
        <ShortenForm lang={lang} />
      </main>
      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm relative z-10 font-mono">
        &copy; {new Date().getFullYear()} шорти.рф — Made with passion
      </footer>
    </div>
  );
};

export default HomePage;
