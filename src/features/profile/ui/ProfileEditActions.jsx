import React from "react";
import { motion as Motion } from "framer-motion";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { GlassSecondaryLink } from "../../../shared/ui/GlassSecondaryAction";

/**
 * Bottom action bar: Cancel (glass link → /profile) + Save (shimmer CTA).
 * Mirrors the AuthPage bottom bar pattern exactly.
 */
const ProfileEditActions = ({ isDirty, isLoading, onSave, t }) => {
  return (
    <div className="bg-white/50 dark:bg-slate-900/35 backdrop-blur-[30px] border border-white/50 dark:border-white/10 rounded-3xl shadow-lg dark:shadow-2xl p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Cancel / Back */}
        <GlassSecondaryLink
          to="/profile"
          className="order-2 sm:order-1 w-full sm:w-auto"
        >
          <ArrowLeft size={16} />
          {t.profileEditCancel}
        </GlassSecondaryLink>

        {/* Save */}
        <Motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          whileHover={isDirty ? { scale: 1.02 } : undefined}
          disabled={!isDirty || isLoading}
          onClick={onSave}
          className="order-1 sm:order-2 w-full sm:w-auto cursor-pointer bg-blue-500/15 dark:bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 dark:border-blue-400/40 border-t-blue-400/20 dark:border-t-white/20 text-blue-600 dark:text-white font-display font-black text-base px-5 py-3 sm:h-12 rounded-2xl transition-all flex items-center justify-center gap-2 group/btn active:scale-[0.97] shrink-0 shadow-xl dark:shadow-[0_0_25px_rgba(37,99,235,0.15)] overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t.loading}
            </>
          ) : (
            <>
              {t.profileEditSave}
              <Check size={16} />
            </>
          )}
          {/* Shimmer overlay */}
          {isDirty && (
            <Motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/40 via-indigo-500/50 via-purple-400/40 to-transparent -skew-x-[20deg] blur-md pointer-events-none"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear", repeatDelay: 0.5 }}
            />
          )}
        </Motion.button>
      </div>
    </div>
  );
};

export default ProfileEditActions;
