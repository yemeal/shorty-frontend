import React from "react";

/** Лёгкий fallback для React.lazy маршрутов (без отдельного спиннер-пакета). */
export default function RouteFallback() {
  return (
    <div
      className="flex min-h-[40vh] w-full items-center justify-center text-sm text-slate-500 dark:text-slate-400"
      role="status"
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-2">
        <span className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500 dark:border-slate-600 dark:border-t-blue-400" />
        Loading…
      </span>
    </div>
  );
}
