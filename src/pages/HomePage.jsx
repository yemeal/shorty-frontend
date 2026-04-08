import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import ShortenForm from '../components/ShortenForm';
import { Zap, CheckCircle2, Globe } from 'lucide-react';
import { useLang } from '../LangContext';

const HomePage = () => {
    const { t } = useLang();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen text-slate-200 font-sans selection:bg-blue-500/30 relative overflow-hidden bg-[#0A0A0E]">
            {/* Liquid Glass Background Elements */}
            <div className="fixed top-[-20%] sm:top-[-15%] left-[50%] -translate-x-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[400px] rounded-[100%] bg-blue-500/20 blur-[100px] sm:blur-[140px] pointer-events-none z-0 animate-float-delayed" />
            <div className="fixed top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-blue-600/30 blur-[100px] sm:blur-[130px] pointer-events-none z-0 animate-float" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-purple-600/20 blur-[120px] sm:blur-[150px] pointer-events-none z-0 animate-float-delayed" />
            <div className="fixed top-[30%] left-[40%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-indigo-500/20 blur-[90px] sm:blur-[120px] pointer-events-none z-0 animate-float" />

            <Header />

            {/* Основной контент */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-12 flex flex-col items-center">

                <div className="text-center space-y-4 sm:space-y-6 mb-10 sm:mb-14 relative z-10 w-full">
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

                {/* Форма */}
                <ShortenForm />

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

export default HomePage;
