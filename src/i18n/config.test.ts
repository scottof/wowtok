import { describe, it, expect } from "vitest";
import { locales, defaultLocale, isRTL, localeNames, localeFlags } from "./config";
import type { Locale } from "./config";

describe("i18n/config", () => {
  it("has 8 locales with 'en' as default", () => {
    expect(locales).toHaveLength(8);
    expect(defaultLocale).toBe("en");
    expect(locales).toContain("en");
  });

  it("every locale has a name and a flag", () => {
    for (const locale of locales) {
      expect(localeNames[locale]).toBeTruthy();
      expect(localeFlags[locale]).toBeTruthy();
    }
  });

  it("isRTL returns true only for Arabic", () => {
    expect(isRTL("ar")).toBe(true);
    const ltrLocales: Locale[] = ["en", "es", "it", "fr", "ko", "zh", "de"];
    for (const locale of ltrLocales) {
      expect(isRTL(locale)).toBe(false);
    }
  });
});
