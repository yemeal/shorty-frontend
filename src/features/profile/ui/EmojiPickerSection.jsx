import React, { Suspense, lazy, useState } from "react";
import { Sparkles } from "lucide-react";
import { useLang } from "../../../LangContext";
import EmojiGlyph from "../../../shared/ui/EmojiGlyph";
import { useEmojiLabel } from "../../../shared/lib/useEmojiLabel";

const LazyEmojiPickerModal = lazy(() => import("../../../shared/ui/EmojiPickerModal"));

/**
 * Avatar section: large emoji preview + "Change" button → opens EmojiPickerModal.
 *
 * @param {string}                emoji    — current emoji character
 * @param {(emoji: string) => void} onChange — called when user picks a new emoji
 */
const EmojiPickerSection = ({ emoji, onChange }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { lang, t } = useLang(); // useLang returns { lang, setLang, t }
  const emojiLabel = useEmojiLabel(emoji, lang);

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4 py-8 w-full">
        {/* Large static preview */}
        <div className="relative shrink-0">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 blur-2xl" />
          <EmojiGlyph
            emoji={emoji}
            label={emojiLabel}
            loading="eager"
            className="relative h-36 w-36 sm:h-44 sm:w-44 rounded-full bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-white/10 shadow-[0_16px_45px_rgba(99,102,241,0.25)]"
            imgClassName="p-7 sm:p-8"
            textClassName="text-7xl sm:text-8xl"
          />
        </div>

        {/* Description + change button */}
        <div className="flex flex-col items-center text-center gap-4 w-full mt-2">
          <div>
            <p className="type-ui-label text-slate-600 dark:text-slate-300">
              {emojiLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            aria-label={t.profileEditChangeEmoji || "Choose emoji"}
            className="glass-frost-surface group relative inline-flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-2xl border border-white/55 dark:border-white/10 border-t-white/70 dark:border-t-white/15 bg-white/18 dark:bg-black/25 px-4 py-3.5 text-left shadow-[0_18px_36px_-26px_rgba(15,23,42,0.45)] transition-[transform,border-color,background-color,box-shadow] duration-300 hover:-translate-y-px hover:bg-white/28 dark:hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/35"
          >
            <span className="flex min-w-0 flex-1 items-center">
              <span className="type-display-cta text-sm text-slate-900 dark:text-white sm:text-base">
                {t.profileEditChangeEmoji || "Choose emoji"}
              </span>
            </span>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/50 bg-white/35 text-slate-500 transition-[transform,border-color,color,background-color] duration-300 group-hover:-translate-y-px group-hover:border-blue-300/60 group-hover:text-blue-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:group-hover:border-blue-500/30 dark:group-hover:text-blue-300">
              <Sparkles size={16} />
            </span>
          </button>
        </div>
      </div>

      {isPickerOpen ? (
        <Suspense fallback={null}>
          <LazyEmojiPickerModal
            isOpen={isPickerOpen}
            onSelect={onChange}
            onClose={() => setIsPickerOpen(false)}
            t={t}
            lang={lang}
          />
        </Suspense>
      ) : null}
    </>
  );
};

export default EmojiPickerSection;
