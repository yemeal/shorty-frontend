/**
 * Builds src/shared/data/emojiCldrEnriched.json from emojibase-data (CLDR) en + ru.
 * Run: node scripts/buildEmojiCldrIndex.mjs
 */
import { createRequire } from "module";
import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const en = require("emojibase-data/en/data.json");
const ru = require("emojibase-data/ru/data.json");

const byEmojiEn = new Map(en.map((e) => [e.emoji, e]));
const byEmojiRu = new Map(ru.map((e) => [e.emoji, e]));

function resolveRecord(map, ch) {
  if (map.has(ch)) return map.get(ch);
  const noVs = ch.replace(/\uFE0F/g, "");
  if (map.has(noVs)) return map.get(noVs);
  const withVs = noVs + "\uFE0F";
  if (map.has(withVs)) return map.get(withVs);
  return null;
}

/** Title-case each space-separated word (CLDR labels are lower case). */
function displayLabel(label, locale) {
  if (!label) return "";
  const loc = locale === "ru" ? "ru" : "en";
  return label
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toLocaleUpperCase(loc) + w.slice(1).toLowerCase())
    .join(" ");
}

function searchTokens(enRec, ruRec, extraKeywordString) {
  const set = new Set();
  const add = (s) => {
    if (!s || typeof s !== "string") return;
    s.toLowerCase()
      .split(/[\s/,.;:_-]+/)
      .filter(Boolean)
      .forEach((t) => set.add(t));
  };
  if (enRec) {
    add(enRec.label);
    (enRec.tags || []).forEach(add);
  }
  if (ruRec) {
    add(ruRec.label);
    (ruRec.tags || []).forEach(add);
  }
  add(extraKeywordString);
  return [...set].join(" ");
}

async function main() {
  const emojiDataUrl = pathToFileURL(join(root, "src/shared/config/emojiData.js")).href;
  const { EMOJI_CATEGORIES } = await import(emojiDataUrl);
  const out = {};

  for (const cat of EMOJI_CATEGORIES) {
    for (const row of cat.emojis) {
      const ch = row[0];
      const origKeywords = row[1] || "";
      const enRec = resolveRecord(byEmojiEn, ch);
      const ruRec = resolveRecord(byEmojiRu, ch);
      if (!enRec && !ruRec) continue;

      const i = searchTokens(enRec, ruRec, origKeywords);
      const en = displayLabel(enRec?.label || origKeywords.split(/\s+/)[0] || "Emoji", "en");
      const ru = displayLabel(ruRec?.label || enRec?.label || origKeywords.split(/\s+/)[0] || "Emoji", "ru");

      out[ch] = { i, en, ru };
    }
  }

  const dataDir = join(root, "src/shared/data");
  mkdirSync(dataDir, { recursive: true });
  const outPath = join(dataDir, "emojiCldrEnriched.json");
  writeFileSync(outPath, JSON.stringify(out, null, 0), "utf8");
  console.log("Wrote", outPath, "entries", Object.keys(out).length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
