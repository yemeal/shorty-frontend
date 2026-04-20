import { useEffect, useState } from "react";

const FALLBACK_LABELS = {
  en: "Emoji",
  ru: "Эмоджи",
};

const emojiLabelCache = new Map();

let emojiUtilsPromise;

const loadEmojiUtils = () => {
  if (!emojiUtilsPromise) {
    emojiUtilsPromise = import("./emojiUtils");
  }
  return emojiUtilsPromise;
};

export const useEmojiLabel = (emoji, lang = "en") => {
  const fallbackLabel = FALLBACK_LABELS[lang] ?? FALLBACK_LABELS.en;
  const cacheKey = `${lang}:${emoji ?? ""}`;
  const [resolvedLabels, setResolvedLabels] = useState(() => new Map());
  const cachedLabel = resolvedLabels.get(cacheKey) ?? emojiLabelCache.get(cacheKey);

  useEffect(() => {
    if (!emoji || cachedLabel) {
      return undefined;
    }

    let isCancelled = false;
    let clearScheduledWork = () => {};

    const resolveLabel = () => {
      loadEmojiUtils()
        .then(({ getEmojiDesc }) => {
          if (isCancelled) return;
          const resolvedLabel = getEmojiDesc(emoji, lang);
          emojiLabelCache.set(cacheKey, resolvedLabel);
          setResolvedLabels((prev) => {
            if (prev.get(cacheKey) === resolvedLabel) {
              return prev;
            }
            const next = new Map(prev);
            next.set(cacheKey, resolvedLabel);
            return next;
          });
        })
        .catch(() => {
          /* ignore and keep fallback label */
        });
    };

    if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(resolveLabel, { timeout: 220 });
      clearScheduledWork = () => window.cancelIdleCallback(idleId);
    } else {
      const timerId = window.setTimeout(resolveLabel, 0);
      clearScheduledWork = () => window.clearTimeout(timerId);
    }

    return () => {
      isCancelled = true;
      clearScheduledWork();
    };
  }, [cacheKey, cachedLabel, emoji, lang]);

  return cachedLabel ?? fallbackLabel;
};
