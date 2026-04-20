import React from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { MOTION_DURATION, MOTION_EASE_OUT_SMOOTH } from "../config/motionTokens";

/**
 * Reusable animated page header with subtle staggered reveal.
 * Supports rich React nodes for title and plain text subtitle.
 */
const PageHeaderReveal = ({
  title,
  subtitle,
  className = "",
  titleId,
  titleClassName = "",
  subtitleClassName = "",
}) => {
  const prefersReducedMotion = useReducedMotion();

  /** Parent only staggers children — no own y/opacity so motion isn’t doubled with CSS transition-all. */
  const container = prefersReducedMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.22 } } }
    : {
        hidden: {},
        show: {
          transition: { staggerChildren: 0.09, delayChildren: 0.05 },
        },
      };

  const titleVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: -12 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: MOTION_DURATION.reveal + 0.06,
            ease: MOTION_EASE_OUT_SMOOTH,
          },
        },
      };

  const subtitleVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: -8 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: MOTION_DURATION.normal + 0.05,
            ease: MOTION_EASE_OUT_SMOOTH,
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
      <Motion.h1 id={titleId} variants={titleVariants} className={titleClassName}>
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
