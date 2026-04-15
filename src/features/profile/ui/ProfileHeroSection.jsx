import React from "react";
import { Link } from "react-router-dom";
import { PencilLine } from "lucide-react";
import PageHeaderReveal from "../../../components/PageHeaderReveal";

/**
 * Reusable hero block for profile page.
 */
const ProfileHeroSection = ({ t, profileEmoji, username, email }) => {
  return (
    <div>
      <PageHeaderReveal
        title={t.profileTitle}
        subtitle={t.profileShortDesc}
        className="text-center"
        titleClassName="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        subtitleClassName="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
      />

      <div className="mt-6 flex justify-center">
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 blur-2xl" />
          <div className="relative h-36 w-36 sm:h-44 sm:w-44 rounded-full flex items-center justify-center text-7xl sm:text-8xl bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-white/10 shadow-[0_16px_45px_rgba(99,102,241,0.25)]">
            {profileEmoji}
          </div>
        </div>
      </div>

      <div className="mt-5 text-center">
        <p className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {username || "User"}
        </p>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
          {email}
        </p>
        <div className="mt-3">
          <Link
            to="/profile/edit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/60 dark:border-white/10 bg-white/35 dark:bg-black/20 hover:bg-white/50 dark:hover:bg-black/35 transition px-4 py-2.5 text-sm font-semibold"
          >
            <PencilLine size={16} />
            {t.profileEdit}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeroSection;
