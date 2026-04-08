import React from 'react';
import Header from '../components/Header';
import { useLang } from '../LangContext';

const ProfilePlaceholder = () => {
    const { t } = useLang();

    return (
        <div className="min-h-screen text-slate-200 font-sans selection:bg-blue-500/30 relative overflow-hidden bg-[#0A0A0E]">
            {/* Liquid Glass Background Elements - Same as main page */}
            <div className="fixed top-[-20%] sm:top-[-15%] left-[50%] -translate-x-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[400px] rounded-[100%] bg-blue-500/20 blur-[100px] sm:blur-[140px] pointer-events-none z-0 animate-float-delayed" />
            <div className="fixed top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-blue-600/30 blur-[100px] sm:blur-[130px] pointer-events-none z-0 animate-float" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-purple-600/20 blur-[120px] sm:blur-[150px] pointer-events-none z-0 animate-float-delayed" />
            <div className="fixed top-[30%] left-[40%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-indigo-500/20 blur-[90px] sm:blur-[120px] pointer-events-none z-0 animate-float" />

            <Header />

            {/* Profile Placeholder Content */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6">
                <div className="relative flex flex-col items-center justify-center text-center max-w-2xl mx-auto p-12 sm:p-20 glass-panel rounded-3xl border border-white/5 overflow-hidden group">
                    {/* Pulsating Neon Border Effect */}
                    <div className="absolute inset-0 border border-[#007bff]/20 rounded-3xl transition-all duration-700 animate-pulse shadow-[inset_0_0_50px_rgba(0,123,255,0.05)]" />
                    
                    {/* Content */}
                    <div className="relative z-10 space-y-4">
                        <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                            {t.profilePlaceholder1}
                        </h1>
                        <p className="text-lg sm:text-xl font-medium tracking-wide text-[#007bff] drop-shadow-[0_0_10px_rgba(0,123,255,0.4)] transition-all duration-300">
                            {t.profilePlaceholder2}
                        </p>
                    </div>
                    
                    {/* Background glow behind text */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#007bff]/10 blur-[60px] rounded-full pointer-events-none" />
                </div>
            </main>
        </div>
    );
};

export default ProfilePlaceholder;
