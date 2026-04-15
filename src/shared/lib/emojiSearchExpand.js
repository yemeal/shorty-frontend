/**
 * Query expansion for emoji picker search (substring OR over haystack).
 * Inspired by CLDR keyword breadth + “intent → many tokens” (see Emoogle / CLDR docs).
 *
 * Haystack already contains EN keywords + RU tokens from {@link deduplicateEmojis}.
 * Russian users often type a theme (“пожар”) that never appears literally in e[1].
 */

/** @param {string[]} arr */
const lower = (arr) => arr.map((s) => s.toLowerCase());

/**
 * RU user intent → extra tokens that should match rows in e[1] (EN + RU fragments).
 * Keys and values are lowercase; include English roots present in emojiData keywords.
 */
export const RU_SEARCH_INTENT_SYNONYMS = {
  пожар: lower(["огонь", "пламя", "fire", "flame", "hot", "lit", "engine", "truck", "extinguisher", "volcano", "sparkler", "fireworks", "горячий"]),
  огонь: lower(["fire", "flame", "hot", "lit", "engine", "truck", "extinguisher", "sparkler", "fireworks"]),
  пламя: lower(["flame", "fire", "hot", "lit"]),
  вода: lower(["water", "wave", "droplet", "ocean", "swim", "potable", "faucet", "sweat"]),
  море: lower(["ocean", "water", "wave", "beach", "fish", "boat", "ship"]),
  дождь: lower(["rain", "cloud", "umbrella", "storm", "droplet"]),
  снег: lower(["snow", "cold", "flake", "man", "boarder"]),
  солнце: lower(["sun", "sunny", "bright", "warm", "ray"]),
  луна: lower(["moon", "crescent", "night", "eclipse"]),
  молния: lower(["lightning", "zap", "storm", "thunder", "cloud"]),
  радуга: lower(["rainbow"]),
  любовь: lower(["heart", "kiss", "love", "cupid", "gift", "letter", "wedding", "ring", "couple"]),
  сердце: lower(["heart", "love", "kiss", "broken", "sparkling", "revolving", "ribbon"]),
  поцелуй: lower(["kiss", "love", "heart", "lips"]),
  еда: lower(["food", "meal", "restaurant", "cook", "fork", "knife", "plate", "bento", "rice", "bread", "cheese", "meat", "egg", "burger", "pizza", "fries", "popcorn", "salt"]),
  напиток: lower(["drink", "coffee", "tea", "beer", "wine", "juice", "milk", "bottle", "cup", "bubble", "tea"]),
  машина: lower(["car", "auto", "taxi", "bus", "truck", "vehicle", "suv", "police", "ambulance", "fire", "engine"]),
  транспорт: lower(["car", "bus", "train", "plane", "ship", "bike", "scooter", "metro", "tram", "rocket", "helicopter"]),
  спорт: lower(["sport", "ball", "soccer", "football", "basketball", "tennis", "volleyball", "rugby", "golf", "ski", "skate", "boxing", "medal", "trophy"]),
  музыка: lower(["music", "note", "guitar", "piano", "drum", "saxophone", "trumpet", "violin", "microphone", "headphone", "radio", "dvd", "cd"]),
  животное: lower(["animal", "dog", "cat", "mouse", "rabbit", "fox", "bear", "panda", "lion", "tiger", "cow", "pig", "frog", "monkey", "bird", "penguin", "fish", "bee", "butterfly", "snake", "whale", "dolphin", "horse", "unicorn"]),
  собака: lower(["dog", "poodle", "guide", "service"]),
  кот: lower(["cat", "kitten", "black", "lion", "tiger", "leopard"]),
  работа: lower(["office", "computer", "briefcase", "chart", "email", "memo", "calendar", "clock", "tool"]),
  дом: lower(["house", "home", "building", "roof", "door", "couch", "bed", "toilet", "shower"]),
  город: lower(["city", "building", "skyscraper", "house", "bridge", "fog", "night"]),
  природа: lower(["tree", "flower", "plant", "leaf", "mushroom", "cactus", "herb", "seedling", "palm", "evergreen"]),
  цветок: lower(["flower", "rose", "blossom", "bouquet", "cherry", "hibiscus", "sunflower", "tulip"]),
  космос: lower(["rocket", "satellite", "ufo", "alien", "ringed", "planet", "comet", "milky", "galaxy", "moon", "sun"]),
  деньги: lower(["money", "dollar", "euro", "yen", "pound", "credit", "card", "receipt", "chart", "bag"]),
  телефон: lower(["phone", "mobile", "telephone", "smartphone", "call"]),
  компьютер: lower(["computer", "laptop", "desktop", "keyboard", "mouse", "disk", "dvd", "printer"]),
  камера: lower(["camera", "video", "film", "photo"]),
  время: lower(["clock", "time", "hour", "alarm", "watch", "hourglass"]),
  книга: lower(["book", "notebook", "scroll", "bookmark", "newspaper"]),
  школа: lower(["school", "graduation", "pencil", "backpack", "abacus"]),
  праздник: lower(["party", "confetti", "tada", "balloon", "gift", "christmas", "tree", "fireworks", "champagne", "birthday", "cake"]),
  рождество: lower(["christmas", "tree", "santa", "gift", "snow"]),
  хэллоуин: lower(["ghost", "jack", "pumpkin", "skull", "spider", "bat", "candy"]),
  страх: lower(["fear", "scream", "horror", "ghost", "skull", "monster", "alien"]),
  злость: lower(["angry", "mad", "rage", "steam", "swearing", "devil"]),
  грусть: lower(["sad", "cry", "tear", "sob", "disappointed", "pensive"]),
  радость: lower(["happy", "smile", "joy", "laugh", "grin", "party"]),
  смех: lower(["laugh", "joy", "rofl", "grin", "smile"]),
  боль: lower(["sick", "hurt", "bandage", "thermometer", "nauseated", "headache", "mask"]),
  рука: lower(["hand", "wave", "point", "fist", "clap", "pray", "muscle", "writing", "nail", "victory"]),
  палец: lower(["thumb", "point", "finger", "middle", "pinch", "crossed"]),
  нога: lower(["foot", "leg", "knee", "running", "walking", "shoe"]),
  лицо: lower(["face", "smile", "sad", "angry", "surprised", "thinking", "mask"]),
  флаг: lower(["flag", "checkered", "rainbow", "pirate", "white", "black"]),
  символ: lower(["symbol", "heart", "star", "check", "cross", "question", "exclamation", "infinity", "recycle"]),
  стрелка: lower(["arrow", "up", "down", "left", "right", "curved", "twisted"]),
  число: lower(["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "100", "123"]),
  цвет: lower(["red", "orange", "yellow", "green", "blue", "purple", "brown", "black", "white", "pink"]),
  игрушка: lower(["teddy", "doll", "nesting", "dice", "joystick", "game", "puzzle"]),
  одежда: lower(["shirt", "pants", "dress", "coat", "socks", "shoe", "hat", "glasses", "necktie"]),
  инструмент: lower(["hammer", "wrench", "pick", "axe", "screwdriver", "nut", "bolt", "gear", "toolbox"]),
  медицина: lower(["medicine", "syringe", "pill", "stethoscope", "hospital", "dna", "microscope"]),
  наука: lower(["atom", "dna", "microscope", "telescope", "satellite", "test", "tube", "petri"]),
  оружие: lower(["sword", "dagger", "bow", "shield", "bomb", "boomerang"]),
  ключ: lower(["key", "lock", "old", "closed"]),
  почта: lower(["mail", "post", "envelope", "package", "mailbox"]),
  погода: lower(["sun", "cloud", "rain", "snow", "storm", "tornado", "fog", "wind", "comet"]),
};

/** EN query → extra English tokens (substring match in haystack). */
export const EN_SEARCH_INTENT_SYNONYMS = {
  fire: lower(["flame", "hot", "lit", "burn", "engine", "truck", "extinguisher", "volcano", "sparkler", "fireworks"]),
  water: lower(["wave", "droplet", "ocean", "swim", "potable", "sweat", "rain"]),
  love: lower(["heart", "kiss", "cupid", "gift", "wedding", "ring", "couple"]),
  car: lower(["auto", "taxi", "suv", "vehicle", "sedan", "truck", "bus"]),
  animal: lower(["dog", "cat", "bird", "fish", "bear", "lion", "frog", "bee", "bug"]),
  food: lower(["eat", "meal", "restaurant", "burger", "pizza", "rice", "bread", "cake", "egg", "meat"]),
  party: lower(["celebration", "confetti", "balloon", "tada", "gift", "cake", "champagne"]),
  work: lower(["office", "computer", "briefcase", "chart", "email", "memo"]),
  sport: lower(["ball", "soccer", "football", "basketball", "tennis", "medal", "trophy"]),
  music: lower(["note", "guitar", "piano", "drum", "mic", "headphone", "radio"]),
  space: lower(["rocket", "satellite", "ufo", "alien", "planet", "moon", "comet"]),
  sad: lower(["cry", "tear", "sob", "disappointed", "pensive", "worried"]),
  happy: lower(["smile", "joy", "laugh", "grin", "party"]),
};

/**
 * @param {string} rawQuery
 * @param {'ru'|'en'} lang
 * @returns {string[]} unique lowercase search needles (OR semantics)
 */
export function expandSearchQueryTerms(rawQuery, lang = "en") {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];
  const parts = q.split(/\s+/).filter(Boolean);
  const out = new Set();
  const table = lang === "ru" ? RU_SEARCH_INTENT_SYNONYMS : EN_SEARCH_INTENT_SYNONYMS;
  for (const p of parts) {
    out.add(p);
    const extra = table[p];
    if (extra) extra.forEach((t) => out.add(t));
  }
  return [...out];
}

/**
 * @param {string} haystack emoji row e[1] after dedupe
 * @param {string} rawQuery user input
 * @param {'ru'|'en'} lang
 */
export function emojiHaystackMatchesQuery(haystack, rawQuery, lang = "en") {
  const q = rawQuery.trim();
  if (!q) return true;
  const h = (haystack || "").toLowerCase();
  const terms = expandSearchQueryTerms(q, lang);
  return terms.some((t) => h.includes(t));
}
