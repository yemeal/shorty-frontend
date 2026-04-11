/**
 * Central motion and interaction tokens used across the UI.
 * Keep these values in one place so pages/components feel consistent.
 */
export const MOTION_EASE_SMOOTH = [0.23, 1, 0.32, 1];

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
  "transform-gpu transition-[transform,box-shadow,background-color,border-color] duration-[220ms] ease-in-out hover:-translate-y-[1px]";

export const GLASS_HOVER_SHADOW_LIGHT_CLASS =
  "hover:shadow-[0_10px_24px_-18px_rgba(15,23,42,0.22)]";

export const GLASS_HOVER_SHADOW_DARK_CLASS =
  "dark:hover:shadow-[0_8px_20px_-16px_rgba(59,130,246,0.22)]";

export const GLASS_HOVER_INTERACTIVE_CLASS = `${GLASS_HOVER_LIFT_CLASS} ${GLASS_HOVER_SHADOW_LIGHT_CLASS} ${GLASS_HOVER_SHADOW_DARK_CLASS}`;
