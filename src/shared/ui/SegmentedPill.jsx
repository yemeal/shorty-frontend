import React from "react";
import { motion as Motion } from "framer-motion";

/**
 * Reusable segmented control with animated pill indicator.
 * Extracted from the AuthTabSwitch pattern — same spring animation,
 * same glass styling, parameterized for any set of options.
 *
 * @param {{ value: string, label: string }[]} options
 * @param {string} value — currently active option value
 * @param {(value: string) => void} onChange
 * @param {string} layoutId — unique Framer layoutId (prevents cross-component conflicts)
 * @param {string} [className]
 */
const SegmentedPill = ({ options, value, onChange, layoutId, className = "" }) => (
  <div
    className={`relative rounded-2xl border border-white/45 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-[20px] p-1.5 overflow-hidden ${className}`}
  >
    <div
      className="relative grid gap-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="cursor-pointer relative py-2.5 rounded-xl font-display font-bold text-sm"
        >
          {value === opt.value && (
            <Motion.div
              layoutId={layoutId + "-bg"}
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
              className="absolute inset-0 rounded-xl bg-blue-500/18 dark:bg-blue-500/25 border border-blue-400/40 shadow-[0_4px_16px_rgba(59,130,246,0.3)]"
            />
          )}
          <span
            className={`relative z-10 ${value === opt.value
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400"
              }`}
          >
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  </div>
);

export default SegmentedPill;
