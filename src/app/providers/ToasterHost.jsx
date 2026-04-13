import React, { useSyncExternalStore } from "react";
import { Toaster } from "sonner";
import { useTheme } from "../../ThemeContext";

function subscribeNarrow(callback) {
  const mq = window.matchMedia("(max-width: 639px)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getNarrowSnapshot() {
  return window.matchMedia("(max-width: 639px)").matches;
}

function getNarrowServerSnapshot() {
  return false;
}

/**
 * Toaster вынесен из дерева Lang/Auth: позиция завязана только на breakpoint,
 * без лишних ререндеров всего приложения при каждом resize.
 */
export default function ToasterHost() {
  const { theme } = useTheme();
  const narrow = useSyncExternalStore(subscribeNarrow, getNarrowSnapshot, getNarrowServerSnapshot);

  return (
    <Toaster
      theme={theme}
      position={narrow ? "top-center" : "bottom-right"}
      expand
      visibleToasts={3}
      richColors
      toastOptions={{
        className: "font-sans",
        style: {
          borderRadius: "1.25rem",
          fontSize: "0.9rem",
        },
      }}
    />
  );
}
