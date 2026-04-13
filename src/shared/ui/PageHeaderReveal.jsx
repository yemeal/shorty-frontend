import React from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { MOTION_DURATION, MOTION_EASE_SMOOTH } from "../config/motionTokens";

/**
 * Reusable animated page header with subtle staggered reveal.
 * Supports rich React nodes for title and plain text subtitle.
 */
const PageHeaderReveal = ({
  title,
  subtitle,
  className = "",
  titleClassName = "",
  subtitleClassName = "",
}) => {
  const prefersReducedMotion = useReducedMotion();

  /** Negative y = start above final position, animate down toward content below (e.g. home form). */
  const container = prefersReducedMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: -18 },
        show: {
          opacity: 1,
          y: 0,
          transition: { staggerChildren: 0.08, delayChildren: 0.02 },
        },
      };

  const titleVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: -22, filter: "blur(8px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: {
            duration: MOTION_DURATION.reveal,
            ease: MOTION_EASE_SMOOTH,
          },
        },
      };

  const subtitleVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: -14 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: MOTION_DURATION.normal,
            ease: MOTION_EASE_SMOOTH,
          },
        },
      };

  return (
    <Motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      <Motion.h1 variants={titleVariants} className={titleClassName}>
        {title}
      </Motion.h1>
      {subtitle ? (
        <Motion.p variants={subtitleVariants} className={subtitleClassName}>
          {subtitle}
        </Motion.p>
      ) : null}
    </Motion.div>
  );
};

export default PageHeaderReveal;
