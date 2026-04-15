import React from "react";

const BIO_MAX_LENGTH = 255;

/**
 * Bio textarea with character counter.
 * Uses the same glass-input styling as AuthPage fields.
 */
const BioSection = ({ bio, onChange, t }) => {
  const charCount = (bio || "").length;

  return (
    <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-[40px] transform-gpu border border-white/50 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-3xl p-5 sm:p-6 relative overflow-hidden transition-shadow duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 pointer-events-none" />
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-3">
          {t.profileEditBioLabel}
        </p>

        <textarea
          value={bio || ""}
          onChange={(e) => {
            if (e.target.value.length <= BIO_MAX_LENGTH) {
              onChange(e.target.value);
            }
          }}
          placeholder={t.profileEditBioPlaceholder}
          maxLength={BIO_MAX_LENGTH}
          rows={3}
          className="w-full rounded-2xl border px-4 py-3 outline-none transition font-mono text-base tracking-[0.01em] placeholder:font-mono placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-white border-white/50 dark:border-white/10 bg-white/25 dark:bg-black/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 shadow-[inset_0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_2px_10px_0_rgba(255,255,255,0.05)] resize-none min-h-[100px]"
        />

        <div className="mt-2 flex justify-end">
          <span
            className={`text-xs font-mono tabular-nums transition-colors ${
              charCount >= BIO_MAX_LENGTH
                ? "text-red-500"
                : charCount > BIO_MAX_LENGTH * 0.8
                  ? "text-amber-500 dark:text-amber-400"
                  : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {charCount}/{BIO_MAX_LENGTH}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BioSection;
