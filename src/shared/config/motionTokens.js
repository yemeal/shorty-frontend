/**
 * Central motion and interaction tokens used across the UI.
 * Keep these values in one place so pages/components feel consistent.
 */
export const MOTION_EASE_SMOOTH = [0.23, 1, 0.32, 1];
export const MOTION_EASE_GENTLE = [0.22, 1, 0.36, 1];

/** Smooth ease-out without overshoot for layout, height, and text reveals. */
export const MOTION_EASE_OUT_SMOOTH = [0.33, 1, 0.65, 1];

export const MOTION_DURATION = {
  fast: 0.2,
  normal: 0.35,
  reveal: 0.5,
  droplet: 0.42,
};

export const MOTION_TRANSITION = {
  droplet: { duration: MOTION_DURATION.droplet, ease: MOTION_EASE_SMOOTH },
  normal: { duration: MOTION_DURATION.normal, ease: MOTION_EASE_SMOOTH },
  fast: { duration: MOTION_DURATION.fast, ease: MOTION_EASE_SMOOTH },
  reveal: { duration: MOTION_DURATION.reveal, ease: MOTION_EASE_SMOOTH },
};

/**
 * Hover-lift is split from hover-shadow to avoid utility conflicts.
 * Pages can use `GLASS_HOVER_INTERACTIVE_CLASS` directly or compose manually.
 */
export const GLASS_HOVER_LIFT_CLASS =
  "transform-gpu will-change-transform transition-[transform,box-shadow,background-color,border-color] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[1px] motion-reduce:transform-none motion-reduce:transition-none";

export const GLASS_HOVER_SHADOW_LIGHT_CLASS =
  "hover:shadow-[0_16px_30px_-22px_rgba(15,23,42,0.25)]";

export const GLASS_HOVER_SHADOW_DARK_CLASS =
  "dark:hover:shadow-[0_12px_28px_-22px_rgba(59,130,246,0.26)]";

export const GLASS_HOVER_INTERACTIVE_CLASS = `${GLASS_HOVER_LIFT_CLASS} ${GLASS_HOVER_SHADOW_LIGHT_CLASS} ${GLASS_HOVER_SHADOW_DARK_CLASS}`;

export const GLASS_HOVER_SURFACE_CLASS =
  "transform-gpu will-change-transform transition-[transform,box-shadow,background-color,border-color] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[4px] motion-reduce:transform-none motion-reduce:transition-none hover:shadow-[0_24px_44px_-24px_rgba(15,23,42,0.35)] dark:hover:shadow-[0_18px_36px_-26px_rgba(59,130,246,0.3)]";

export const GLASS_HOVER_CHROME_CLASS =
  "transform-gpu will-change-transform transition-[transform,box-shadow,background-color,border-color] duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[1px] motion-reduce:transform-none motion-reduce:transition-none hover:shadow-[0_20px_32px_-24px_rgba(15,23,42,0.28)] dark:hover:shadow-[0_12px_26px_-22px_rgba(59,130,246,0.24)]";
