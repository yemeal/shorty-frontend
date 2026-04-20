import React from "react";
import { motion as Motion } from "framer-motion";

/**
 * Segmented tab switch used by auth page for login/register modes.
 */
const AuthTabSwitch = ({ tab, onSwitch, t }) => (
  <div className="w-full max-w-xl relative rounded-3xl border border-white/45 dark:border-white/10 bg-white/50 dark:bg-slate-900/35 backdrop-blur-[35px] p-1.5 shadow-lg dark:shadow-2xl overflow-hidden">
    <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-blue-500/8 via-transparent to-purple-500/8" />
    <div className="relative grid grid-cols-2 gap-1">
      <button
        type="button"
        onClick={() => onSwitch("login")}
        className="cursor-pointer relative py-3 rounded-2xl type-display-cta text-sm sm:text-base"
      >
        {tab === "login" && (
          <Motion.div
            layoutId="auth-tab-pill"
            transition={{ type: "spring", stiffness: 420, damping: 35 }}
            className="absolute inset-0 rounded-2xl bg-blue-500/18 dark:bg-blue-500/25 border border-blue-400/40 shadow-[0_8px_25px_rgba(59,130,246,0.22)]"
          />
        )}
        <span
          className={`relative z-10 ${tab === "login" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
        >
          {t.signIn}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSwitch("register")}
        className="cursor-pointer relative py-3 rounded-2xl type-display-cta text-sm sm:text-base"
      >
        {tab === "register" && (
          <Motion.div
            layoutId="auth-tab-pill"
            transition={{ type: "spring", stiffness: 420, damping: 35 }}
            className="absolute inset-0 rounded-2xl bg-blue-500/18 dark:bg-blue-500/25 border border-blue-400/40 shadow-[0_8px_25px_rgba(59,130,246,0.22)]"
          />
        )}
        <span
          className={`relative z-10 ${tab === "register" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
        >
          {t.signUp}
        </span>
      </button>
    </div>
  </div>
);

export default AuthTabSwitch;
