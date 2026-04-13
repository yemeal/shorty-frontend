import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

const MotionLink = motion(Link);

/** Matches auth “Home” link: frosted pill + light-theme drop shadow. */
export const GLASS_SECONDARY_ACTION_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-display font-bold border border-white/50 dark:border-white/10 bg-white/35 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/35 shadow-[0_10px_24px_rgba(15,23,42,0.2)] dark:shadow-none transition-transform duration-150 ease-out";

export function GlassSecondaryLink({ to, className = "", children, ...rest }) {
  const reduceMotion = useReducedMotion();
  return (
    <MotionLink
      to={to}
      className={`${GLASS_SECONDARY_ACTION_CLASS} ${className}`.trim()}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
      {...rest}
    >
      {children}
    </MotionLink>
  );
}

const GLASS_SECONDARY_COMPACT_CLASS =
  "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-display font-semibold border border-white/50 dark:border-white/10 bg-white/30 dark:bg-black/20 hover:bg-white/55 dark:hover:bg-black/35 shadow-[0_6px_14px_rgba(15,23,42,0.12)] dark:shadow-none transition-transform duration-150 ease-out";

const tapTransition = { duration: 0.12, ease: [0.23, 1, 0.32, 1] };

export function GlassSecondaryButton({ variant = "default", className = "", disabled, children, ...rest }) {
  const reduceMotion = useReducedMotion();
  const base = variant === "compact" ? GLASS_SECONDARY_COMPACT_CLASS : GLASS_SECONDARY_ACTION_CLASS;
  const tapScale = variant === "compact" ? 0.97 : 0.96;
  return (
    <motion.button
      type="button"
      disabled={disabled}
      className={`${base} cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`.trim()}
      whileTap={disabled || reduceMotion ? undefined : { scale: tapScale }}
      transition={tapTransition}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
