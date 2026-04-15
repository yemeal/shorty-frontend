import React, { useState } from "react";
import EmojiPickerModal from "../../../shared/ui/EmojiPickerModal";
import { getEmojiDesc } from "../../../shared/lib/emojiUtils";
import { useLang } from "../../../LangContext";

/**
 * Avatar section: large emoji preview + "Change" button → opens EmojiPickerModal.
 *
 * @param {string}                emoji    — current emoji character
 * @param {(emoji: string) => void} onChange — called when user picks a new emoji
 */
const EmojiPickerSection = ({ emoji, onChange }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { lang, t } = useLang(); // useLang returns { lang, setLang, t }

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4 py-8 w-full">
        {/* Large static preview */}
        <div className="relative shrink-0">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 blur-2xl" />
          <div className="relative h-36 w-36 sm:h-44 sm:w-44 rounded-full flex items-center justify-center text-7xl sm:text-8xl bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-white/10 shadow-[0_16px_45px_rgba(99,102,241,0.25)]">
            {emoji}
          </div>
        </div>

        {/* Description + change button */}
        <div className="flex flex-col items-center text-center gap-4 w-full mt-2">
          <div>
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              {getEmojiDesc(emoji, lang)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-display font-bold border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 hover:bg-white/80 dark:hover:bg-black/50 shadow-sm hover:shadow-md transition-all sm:w-fit w-full text-slate-800 dark:text-slate-200"
          >
            {t.profileEditChangeEmoji || "Choose emoji"}
          </button>
        </div>
      </div>

      <EmojiPickerModal
        isOpen={isPickerOpen}
        onSelect={onChange}
        onClose={() => setIsPickerOpen(false)}
        t={t}
        lang={lang}
      />
    </>
  );
};

export default EmojiPickerSection;
