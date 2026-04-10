import React from "react";
import { motion } from "framer-motion";

const BASE_CLASS =
  "cursor-pointer flex items-center justify-center w-10 h-10 bg-white/40 dark:bg-white/5 border rounded-xl transition-colors text-slate-600 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/35";

const VARIANT_CLASS = {
  default: "border-white/40 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500",
  active: "border-blue-500 text-blue-600 dark:text-blue-400",
  success: "border-emerald-500 text-emerald-600 dark:text-emerald-400",
  danger: "border-red-400 dark:border-red-500 text-red-500 dark:text-red-400",
};

const ActionIconButton = ({
  variant = "default",
  whileTap = { scale: 0.92 },
  className = "",
  children,
  ...props
}) => {
  return (
    <motion.button
      whileTap={whileTap}
      className={`${BASE_CLASS} ${VARIANT_CLASS[variant] || VARIANT_CLASS.default} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default ActionIconButton;
