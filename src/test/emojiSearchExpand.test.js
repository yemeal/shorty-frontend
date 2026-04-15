import { describe, it, expect } from "vitest";
import { expandSearchQueryTerms, emojiHaystackMatchesQuery } from "../shared/lib/emojiSearchExpand";

describe("emojiSearchExpand", () => {
  it("expands RU intent «пожар» to fire-related English tokens", () => {
    const terms = expandSearchQueryTerms("пожар", "ru");
    expect(terms).toContain("fire");
    expect(terms).toContain("flame");
    expect(terms).toContain("engine");
  });

  it("matches haystack when any expanded term is a substring", () => {
    const hay = "fire hot flame lit огонь горячий";
    expect(emojiHaystackMatchesQuery(hay, "пожар", "ru")).toBe(true);
    expect(emojiHaystackMatchesQuery(hay, "несуществующийзапрос123", "ru")).toBe(false);
  });

  it("expands EN «fire» for broader substring match", () => {
    const hay = "fire engine truck";
    expect(emojiHaystackMatchesQuery(hay, "fire", "en")).toBe(true);
  });
});
