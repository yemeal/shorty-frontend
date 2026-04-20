import { Link } from "react-router-dom";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * Primary CTA styled like the home “Shorten” control (shimmer, hover/tap scale).
 * @param {"default" | "prominent"} size — larger padding/type for high-intent CTAs (e.g. profile empty state).
 */
export function ShortenStylePrimaryLink({ to, children, className = "", showArrow = true, size = "default" }) {
  const reduceMotion = useReducedMotion();
  const linkSize =
    size === "prominent"
      ? "text-lg sm:text-xl px-6 sm:px-7 py-3.5 sm:py-4 min-h-[3rem] w-auto shadow-xl dark:shadow-[0_0_28px_rgba(37,99,235,0.2)]"
      : "text-base px-6 py-3 shadow-xl dark:shadow-[0_0_25px_rgba(37,99,235,0.15)]";
  const arrowSize = size === "prominent" ? 22 : 18;

  return (
    <Motion.div
      whileHover={reduceMotion ? undefined : { scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      className={`inline-flex ${className}`.trim()}
    >
      <Link
        to={to}
        className={`group/btn relative overflow-hidden cursor-pointer bg-blue-500/15 dark:bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 dark:border-blue-400/40 border-t-blue-400/20 dark:border-t-white/20 text-blue-600 dark:text-white type-display-cta rounded-2xl sm:rounded-full transition-[background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/35 flex items-center justify-center gap-2 active:scale-[0.97] ${linkSize}`}
      >
        <span className="relative z-10 flex items-center gap-2 text-center">{children}</span>
        {showArrow ? (
          <ArrowRight
            size={arrowSize}
            className="relative z-10 shrink-0 transition-transform group-hover/btn:translate-x-1"
            aria-hidden
          />
        ) : null}
        {reduceMotion ? null : (
          <Motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/40 via-indigo-500/50 via-purple-400/40 to-transparent -skew-x-[20deg] blur-md pointer-events-none"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 6, ease: "linear", repeatDelay: 0.5 }}
          />
        )}
      </Link>
    </Motion.div>
  );
}
