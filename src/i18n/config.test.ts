import { describe, it, expect } from "vitest";
import { locales, defaultLocale, isRTL, localeNames } from "./config";
import type { Locale } from "./config";

describe("i18n/config", () => {
  it("has 10 locales with 'en' as default", () => {
    expect(locales).toHaveLength(10);
    expect(defaultLocale).toBe("en");
    expect(locales).toContain("en");
  });

  it("every locale has a display name", () => {
    for (const locale of locales) {
      expect(localeNames[locale]).toBeTruthy();
    }
  });

  it("isRTL returns true only for Arabic", () => {
    expect(isRTL("ar")).toBe(true);
    const ltrLocales: Locale[] = ["en", "es", "it", "fr", "ko", "zh", "de", "ru", "pt"];
    for (const locale of ltrLocales) {
      expect(isRTL(locale)).toBe(false);
    }
  });
});
