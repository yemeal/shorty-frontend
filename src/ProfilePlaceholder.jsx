import React from 'react';

const ProfilePlaceholder = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0A0A0E] text-center relative overflow-hidden">
    {/* Background elements similar to HomePage */}
    <div className="fixed top-[-20%] sm:top-[-15%] left-[50%] -translate-x-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[400px] rounded-[100%] bg-blue-500/20 blur-[100px] sm:blur-[140px] pointer-events-none z-0 animate-float-delayed" />
    <div className="fixed top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-blue-600/30 blur-[100px] sm:blur-[130px] pointer-events-none z-0 animate-float" />
    <div className="fixed bottom-[-10%] right-[-10%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-purple-600/20 blur-[120px] sm:blur-[150px] pointer-events-none z-0 animate-float-delayed" />
    <div className="fixed top-[30%] left-[40%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-indigo-500/20 blur-[90px] sm:blur-[120px] pointer-events-none z-0 animate-float" />
    <div className="relative z-10">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">Пока здесь ничего нет...</h1>
      <p className="text-xl sm:text-2xl text-blue-400 animate-pulse">...но скоро обязательно появится</p>
    </div>
  </div>
);

export default ProfilePlaceholder;
