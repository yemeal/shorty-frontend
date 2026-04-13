import { describe, it, expect } from "vitest";
import { translations } from "../translations";

const LANGUAGES = Object.keys(translations);

describe("translations", () => {
  it("has en and ru languages", () => {
    expect(LANGUAGES).toContain("en");
    expect(LANGUAGES).toContain("ru");
  });

  it("en and ru have identical key sets", () => {
    const enKeys = Object.keys(translations.en).sort();
    const ruKeys = Object.keys(translations.ru).sort();
    expect(enKeys).toEqual(ruKeys);
  });

  it("no empty string values in any language", () => {
    for (const lang of LANGUAGES) {
      for (const [key, value] of Object.entries(translations[lang])) {
        expect(value, `${lang}.${key} is empty`).not.toBe("");
      }
    }
  });

  it("brand is consistent across languages", () => {
    expect(translations.en.brand).toBe(translations.ru.brand);
  });

  it("contains all critical auth keys", () => {
    const required = [
      "signIn", "signUp", "signOut", "loginTitle", "registerTitle",
      "authErrorFillRequired", "authErrorInvalidCredentials",
      "authErrorEmailExists", "authErrorUsernameExists",
    ];
    for (const lang of LANGUAGES) {
      for (const key of required) {
        expect(translations[lang], `${lang} missing ${key}`).toHaveProperty(key);
      }
    }
  });

  it("contains all profile keys", () => {
    const required = [
      "profileTitle", "profileEdit", "shortiesTitle",
      "shortiesPerPage",
      "shortiesPerPageTooltip",
      "profileToolbarSortMenuAria",
      "paginationPrev", "paginationNext", "paginationPage", "paginationOf", "paginationNavLabel",
      "featureUnavailable",
    ];
    for (const lang of LANGUAGES) {
      for (const key of required) {
        expect(translations[lang], `${lang} missing ${key}`).toHaveProperty(key);
      }
    }
  });
});
