import React from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { subscribeNetworkActivity } from "../lib/networkActivity";

const SHOW_DELAY_MS = 180;
const MIN_VISIBLE_MS = 260;

const NetworkActivityIndicator = () => {
  const [visible, setVisible] = React.useState(false);
  const pendingRef = React.useRef(0);
  const showTimerRef = React.useRef(null);
  const hideTimerRef = React.useRef(null);
  const shownAtRef = React.useRef(0);

  React.useEffect(() => {
    const clearTimers = () => {
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      showTimerRef.current = null;
      hideTimerRef.current = null;
    };

    const unsubscribe = subscribeNetworkActivity((count) => {
      pendingRef.current = count;
      if (count > 0) {
        if (visible) return;
        if (showTimerRef.current) return;
        showTimerRef.current = window.setTimeout(() => {
          showTimerRef.current = null;
          if (pendingRef.current > 0) {
            shownAtRef.current = Date.now();
            setVisible(true);
          }
        }, SHOW_DELAY_MS);
        return;
      }

      if (showTimerRef.current) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      if (!visible) return;

      const elapsed = Date.now() - shownAtRef.current;
      const waitMs = Math.max(0, MIN_VISIBLE_MS - elapsed);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => {
        hideTimerRef.current = null;
        if (pendingRef.current === 0) {
          setVisible(false);
        }
      }, waitMs);
    });

    return () => {
      clearTimers();
      unsubscribe();
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <Motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[120] pointer-events-none"
          aria-live="polite"
          aria-label="Network activity"
        >
          <div className="h-1.5 w-28 rounded-full bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-white/10 backdrop-blur-xl overflow-hidden shadow-md">
            <Motion.div
              className="h-full w-10 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
              animate={{ x: ["-120%", "250%"] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default NetworkActivityIndicator;
