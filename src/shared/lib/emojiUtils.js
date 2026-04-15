import { EMOJI_CATEGORIES } from "../config/emojiData";
import CLDR from "../data/emojiCldrEnriched.json";
import { EMOJI_PHRASE_OVERRIDE } from "./emojiPhraseOverrides";

const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/** @param {string} ch */
function resolveCldrKey(ch) {
  if (CLDR[ch]) return ch;
  const noVs = ch.replace(/\uFE0F/g, "");
  if (CLDR[noVs]) return noVs;
  const withVs = `${noVs}\uFE0F`;
  if (CLDR[withVs]) return withVs;
  return null;
}

/**
 * Localized short label for UI (after {@link deduplicateEmojis}).
 */
export const getEmojiDesc = (emojiChar, currentLanguage = "ru") => {
  for (const cat of EMOJI_CATEGORIES) {
    const match = cat.emojis.find((e) => e[0] === emojiChar);
    if (!match) continue;
    if (typeof match[2] === "string" && typeof match[3] === "string") {
      return currentLanguage === "ru" ? match[3] : match[2];
    }
    const raw = (match[1] || "").split(/\s+/)[0] || "";
    return capitalize(raw);
  }
  return "Emoji";
};

/**
 * Merges CLDR (emojibase) labels + tags for en/ru with optional phrase overrides and
 * legacy English keywords from emojiData for search.
 */
export const deduplicateEmojis = () => {
  const seen = new Set();
  for (const cat of EMOJI_CATEGORIES) {
    cat.emojis = cat.emojis.filter((e) => {
      const char = e[0];
      if (seen.has(char)) return false;
      seen.add(char);

      const originalKeywordsString = e[1] || "";
      const phrase = EMOJI_PHRASE_OVERRIDE[originalKeywordsString];
      const key = resolveCldrKey(char);
      const cldr = key ? CLDR[key] : null;

      if (cldr) {
        const extra = originalKeywordsString.toLowerCase().split(/\s+/).filter(Boolean);
        const merged = new Set([...cldr.i.split(/\s+/).filter(Boolean), ...extra]);
        e[1] = [...merged].join(" ");
        e[2] = phrase?.en ?? cldr.en;
        e[3] = phrase?.ru ?? cldr.ru;
        return true;
      }

      const first = originalKeywordsString.trim().split(/\s+/)[0] || "";
      e[2] = phrase?.en ?? capitalize(first.toLowerCase());
      e[3] = phrase?.ru ?? capitalize(first.toLowerCase());
      e[1] = originalKeywordsString.trim();
      return true;
    });
  }
};

deduplicateEmojis();
