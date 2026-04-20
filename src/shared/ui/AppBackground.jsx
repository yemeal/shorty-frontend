import React from "react";
import { useReducedMotion } from "framer-motion";

const BACKGROUND_BLOBS = [
  "fixed top-[-20%] sm:top-[-15%] left-[50%] -translate-x-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[400px] rounded-[100%] bg-blue-500/10 dark:bg-blue-500/20 blur-[120px] sm:blur-[140px] pointer-events-none z-0",
  "fixed top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-blue-500/20 dark:bg-blue-600/30 blur-[110px] sm:blur-[130px] pointer-events-none z-0",
  "fixed bottom-[-10%] right-[-10%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-purple-500/10 dark:bg-purple-600/20 blur-[130px] sm:blur-[150px] pointer-events-none z-0",
  "fixed top-[30%] left-[40%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] sm:blur-[120px] pointer-events-none z-0",
];

/**
 * Shared liquid-glass background blobs used on all main pages.
 */
const AppBackground = () => {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {BACKGROUND_BLOBS.map((blobClassName, index) => {
        const animationClass = reduceMotion
          ? ""
          : index % 2 === 0
            ? " animate-float-delayed"
            : " animate-float";
        return (
          <div
            key={blobClassName}
            aria-hidden="true"
            className={`${blobClassName}${animationClass}`}
          />
        );
      })}
    </>
  );
};

export default AppBackground;
