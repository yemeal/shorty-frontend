import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import ShortenForm from '../components/ShortenForm';
import { Zap, CheckCircle2, Globe } from 'lucide-react';

const GithubIcon = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
        <path d="M9 18c-4.51 2-5-2-7-2"/>
    </svg>
);
import { useLang } from '../LangContext';

const HomePage = () => {
    const { t } = useLang();

    useEffect(() => {
        const handleScroll = () => {
            // handleScroll logic can be implemented here if needed in the future
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-500/30 relative overflow-hidden transition-colors duration-500">
            {/* Liquid Glass Background Elements */}
            <div className="fixed top-[-20%] sm:top-[-15%] left-[50%] -translate-x-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[400px] rounded-[100%] bg-blue-500/10 dark:bg-blue-500/20 blur-[100px] sm:blur-[140px] pointer-events-none z-0 animate-float-delayed" />
            <div className="fixed top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-blue-500/20 dark:bg-blue-600/30 blur-[100px] sm:blur-[130px] pointer-events-none z-0 animate-float" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-purple-500/10 dark:bg-purple-600/20 blur-[120px] sm:blur-[150px] pointer-events-none z-0 animate-float-delayed" />
            <div className="fixed top-[30%] left-[40%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[90px] sm:blur-[120px] pointer-events-none z-0 animate-float" />

            <Header />

            {/* Основной контент */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-12 flex flex-col items-center">

                <div className="text-center space-y-4 sm:space-y-6 mb-10 sm:mb-14 relative z-10 w-full transition-all duration-500">
                    <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                        {t.title1} <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 drop-shadow-sm dark:drop-shadow-lg">
                            {t.title2}
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed px-4 transition-colors">
                        {t.subtitle}
                    </p>
                </div>

                {/* Форма */}
                <ShortenForm />

                {/* Статистика / Фичи */}
                <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl pt-10 border-t border-slate-200 dark:border-white/5 relative z-10">
                    {[
                        { title: t.feat1Title, desc: t.feat1Desc, icon: <Zap size={20} className="text-blue-500 dark:text-blue-400" /> },
                        { title: t.feat2Title, desc: t.feat2Desc, icon: <CheckCircle2 size={20} className="text-purple-500 dark:text-purple-400" /> },
                        { title: t.feat3Title, desc: t.feat3Desc, icon: <Globe size={20} className="text-indigo-500 dark:text-indigo-400" /> }
                    ].map((item, i) => (
                        <div key={i} className="bg-white/40 dark:bg-white/5 backdrop-blur-md border border-slate-200/50 dark:border-white/5 p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 group shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
                            <div className="bg-blue-50 dark:bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-blue-100 dark:border-white/5 group-hover:border-blue-200 dark:group-hover:border-white/20 transition-colors">
                                {item.icon}
                            </div>
                            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-2 text-lg transition-colors">{item.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-colors">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="py-8 flex flex-col items-center justify-center gap-4 text-center text-slate-500 dark:text-slate-500 text-sm relative z-10 font-mono transition-colors">
                <a
                    href="https://github.com/yemeal/shorty"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200/60 dark:border-white/10 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                    <GithubIcon size={16} />
                    <span>GitHub</span>
                </a>
                <span>&copy; {new Date().getFullYear()} {t.footer}</span>
            </footer>
        </div>
    );
};

export default HomePage;
