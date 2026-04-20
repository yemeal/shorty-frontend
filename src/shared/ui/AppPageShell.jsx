import React from "react";
import Header from "../../components/Header";
import AppBackground from "./AppBackground";
import SiteFooter from "./SiteFooter";

const AppPageShell = ({ children, mainClassName = "" }) => {
  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-500/30 relative overflow-hidden transition-colors duration-500 flex flex-col">
      <AppBackground />
      <Header />
      <main className={`relative z-10 flex-1 ${mainClassName}`.trim()}>{children}</main>
      <SiteFooter />
    </div>
  );
};

export default AppPageShell;
